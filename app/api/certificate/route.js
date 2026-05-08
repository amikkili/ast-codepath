// app/api/certificate/route.js  ← NEW FILE
// ─────────────────────────────────────────────────────────────────────────────
// GET  → returns list of certificates for the logged-in student
// POST → called after last lesson is marked done → generates PDF → sends email
// ─────────────────────────────────────────────────────────────────────────────
import { db }                     from '../../../lib/db'
import { getServerSession }       from 'next-auth'
import { authOptions }            from '../../../lib/auth'
import { generateCertificatePDF } from '../../../lib/certificate'
import { sendEmail }              from '../../../lib/email'

// ── GET: list student's certificates ─────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const certs = await db.certificate.findMany({
    where:   { userId: session.user.id },
    orderBy: { issuedAt: 'desc' },
  })
  return Response.json({ certificates: certs })
}

// ── POST: generate certificate after course completion ────────────────────────
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return Response.json({ error: 'courseId required' }, { status: 400 })

  // ── 1. Get course and all its lessons ────────────────────────────────────
  const course = await db.course.findUnique({
    where:   { id: courseId },
    include: { lessons: { where: { published: true } } },
  })
  if (!course) return Response.json({ error: 'Course not found' }, { status: 404 })

  // ── 2. Check all lessons are done ────────────────────────────────────────
  const lessonIds   = course.lessons.map(l => l.id)
  const doneCount   = await db.progress.count({
    where: { userId: session.user.id, lessonId: { in: lessonIds }, done: true },
  })

  if (doneCount < lessonIds.length) {
    return Response.json({
      error: `Course not complete. ${doneCount}/${lessonIds.length} lessons done.`,
    }, { status: 400 })
  }

  // ── 3. Check if certificate already issued ────────────────────────────────
  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })

  let cert = existing

  if (!existing) {
    // ── 4. Create certificate record in DB ──────────────────────────────────
    cert = await db.certificate.create({
      data: {
        userId:     session.user.id,
        courseId,
        courseName: course.title,
      },
    })

    // ── 5. Get student details ───────────────────────────────────────────────
    const user = await db.user.findUnique({
      where:  { id: session.user.id },
      select: { name: true, email: true },
    })

    // ── 6. Generate PDF certificate ──────────────────────────────────────────
    const certId   = `AST-${new Date().getFullYear()}-${course.language.slice(0,2).toUpperCase()}-${cert.id.slice(-6).toUpperCase()}`
    const pdfBuffer = await generateCertificatePDF({
      studentName:   user.name,
      courseName:    course.title,
      issuedAt:      cert.issuedAt,
      certificateId: certId,
    })

    // ── 7. Send congratulations email with PDF attached ──────────────────────
    const html = `
      <!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f1117;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:32px">

        <div style="text-align:center;margin-bottom:24px">
          <div style="width:60px;height:60px;background:#1e2a1e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px">🏆</div>
          <div style="display:inline-flex;align-items:center;gap:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:#534AB7;display:inline-block"></div>
            <span style="font-size:13px;font-weight:500;color:#e2e8f0">Anil Software Technologies — CodePath</span>
          </div>
        </div>

        <h1 style="font-size:20px;font-weight:500;color:#e2e8f0;margin:0 0 8px;text-align:center">
          🎉 Congratulations, ${user.name.split(' ')[0]}!
        </h1>
        <p style="font-size:13px;color:#8892a4;text-align:center;margin:0 0 24px">
          You have successfully completed <strong style="color:#7f77dd">${course.title}</strong>
        </p>

        <div style="background:#1e2a1e;border:0.5px solid rgba(29,158,117,0.4);border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="font-size:12px;font-weight:500;color:#1D9E75;margin:0 0 8px">📎 Your certificate is attached</p>
          <p style="font-size:12px;color:#8892a4;margin:0;line-height:1.6">
            Your verified completion certificate is attached to this email as a PDF.
            You can download it, print it, and add it to your LinkedIn profile.
          </p>
        </div>

        <div style="margin-bottom:20px">
          <p style="font-size:12px;color:#c8d0e0;font-weight:500;margin:0 0 8px">What you can do with your certificate:</p>
          <p style="font-size:12px;color:#8892a4;margin:0 0 4px;line-height:1.6">✅ Add to LinkedIn → Profile → Licences & Certifications</p>
          <p style="font-size:12px;color:#8892a4;margin:0 0 4px;line-height:1.6">✅ Share with employers as proof of your ${course.language} skills</p>
          <p style="font-size:12px;color:#8892a4;margin:0;line-height:1.6">✅ Print and keep as your achievement record</p>
        </div>

        <div style="background:#0f1117;border:0.5px solid #2a2f3e;border-radius:8px;padding:14px;margin-bottom:20px">
          <p style="font-size:12px;color:#c8d0e0;font-weight:500;margin:0 0 6px">What's next?</p>
          <p style="font-size:12px;color:#8892a4;margin:0;line-height:1.6">
            Continue your learning journey! More courses are available on CodePath — JavaScript, Java, Python advanced, and more.
          </p>
        </div>

        <div style="text-align:center;margin-bottom:20px">
          <a href="https://www.anilsofttech.com/dashboard"
            style="background:#534AB7;color:#EEEDFE;font-size:13px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
            Go to dashboard →
          </a>
        </div>

        <div style="border-top:0.5px solid #2a2f3e;padding-top:16px">
          <p style="font-size:12px;color:#5a6278;margin:0">
            With regards,<br>
            <strong style="color:#8892a4">Anil Kumar Mikkili</strong><br>
            CEO & Founder, Anil Software Technologies<br>
            +91 9866376367 · contact@anilsofttech.com
          </p>
        </div>
      </div>
      </body></html>
    `

    // Send email with PDF attachment
    await sendEmail({
      to:      user.email,
      subject: `🎉 Congratulations! Your ${course.title} certificate is ready — CodePath`,
      html,
      attachments: [{
        filename: `certificate-${course.title.toLowerCase().replace(/\s+/g,'-')}.pdf`,
        content:  pdfBuffer.toString('base64'),
        type:     'application/pdf',
        disposition: 'attachment',
      }],
    })

    console.log(`✓ Certificate issued: ${user.email} — ${course.title}`)
  }

  return Response.json({ certificate: cert, alreadyIssued: !!existing })
}
