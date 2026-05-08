// app/api/progress/route.js  ← REPLACE existing file
// FIX: Certificate generation is now called DIRECTLY (not via HTTP fetch)
// The previous approach of calling /api/certificate via fetch failed on Render
// because a server cannot reliably call itself via HTTP on the same instance.

import { db }                     from '../../../lib/db'
import { getServerSession }       from 'next-auth'
import { authOptions }            from '../../../lib/auth'
import { generateCertificatePDF } from '../../../lib/certificate'
import { sendEmail }              from '../../../lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await db.progress.findMany({
    where:  { userId: session.user.id },
    select: { lessonId: true, done: true },
  })
  return Response.json({ progress })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, done } = await req.json()
  if (!lessonId) return Response.json({ error: 'lessonId required' }, { status: 400 })

  // Save progress
  const progress = await db.progress.upsert({
    where:  { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { done },
    create: { userId: session.user.id, lessonId, done: done ?? true },
  })

  let courseCompleted   = false
  let certificateIssued = false

  if (done) {
    try {
      // Find which course this lesson belongs to
      const lesson = await db.lesson.findUnique({
        where:  { id: lessonId },
        select: { courseId: true },
      })

      if (lesson) {
        // Count total published lessons in this course
        const allLessons = await db.lesson.findMany({
          where:  { courseId: lesson.courseId, published: true },
          select: { id: true },
        })
        const allIds = allLessons.map(l => l.id)

        // Count how many the student has done
        const doneCount = await db.progress.count({
          where: { userId: session.user.id, lessonId: { in: allIds }, done: true },
        })

        if (doneCount >= allIds.length && allIds.length > 0) {
          courseCompleted = true
          console.log(`Course completed: userId=${session.user.id} courseId=${lesson.courseId}`)

          // ── Check if certificate already issued ──────────────────────────
          const existing = await db.certificate.findUnique({
            where: { userId_courseId: { userId: session.user.id, courseId: lesson.courseId } },
          })

          if (!existing) {
            // ── Get course details ───────────────────────────────────────
            const course = await db.course.findUnique({
              where:  { id: lesson.courseId },
              select: { title: true, language: true },
            })

            // ── Get student details ──────────────────────────────────────
            const user = await db.user.findUnique({
              where:  { id: session.user.id },
              select: { name: true, email: true },
            })

            if (course && user) {
              // ── Create certificate record ────────────────────────────────
              const cert = await db.certificate.create({
                data: {
                  userId:     session.user.id,
                  courseId:   lesson.courseId,
                  courseName: course.title,
                },
              })

              certificateIssued = true
              console.log(`Certificate created: id=${cert.id}`)

              // ── Generate Certificate ID ──────────────────────────────────
              const certId = `AST-${new Date().getFullYear()}-${course.language.slice(0,2).toUpperCase()}-${cert.id.slice(-6).toUpperCase()}`

              // ── Generate PDF (async, non-blocking) ───────────────────────
              // We use a separate async block so it doesn't delay the response
              ;(async () => {
                try {
                  const pdfBuffer = await generateCertificatePDF({
                    studentName:   user.name,
                    courseName:    course.title,
                    issuedAt:      cert.issuedAt,
                    certificateId: certId,
                  })

                  // ── Build completion email HTML ────────────────────────
                  const html = `
                    <!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f1117;padding:32px">
                    <div style="max-width:560px;margin:0 auto;background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:32px">
                      <div style="text-align:center;margin-bottom:20px">
                        <div style="font-size:40px;margin-bottom:8px">🏆</div>
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
                        <p style="font-size:12px;font-weight:500;color:#1D9E75;margin:0 0 6px">📎 Your certificate is attached as PDF</p>
                        <p style="font-size:12px;color:#8892a4;margin:0;line-height:1.6">
                          Download it, print it, and add it to your LinkedIn profile under Licences &amp; Certifications.
                        </p>
                      </div>
                      <div style="margin-bottom:20px">
                        <p style="font-size:12px;color:#c8d0e0;font-weight:500;margin:0 0 8px">You can:</p>
                        <p style="font-size:12px;color:#8892a4;margin:0 0 4px;line-height:1.6">✅ Add to LinkedIn → Profile → Licences &amp; Certifications</p>
                        <p style="font-size:12px;color:#8892a4;margin:0 0 4px;line-height:1.6">✅ Share with employers as proof of ${course.language} skills</p>
                        <p style="font-size:12px;color:#8892a4;margin:0;line-height:1.6">✅ Download from your dashboard anytime</p>
                      </div>
                      <div style="text-align:center;margin-bottom:20px">
                        <a href="https://www.anilsofttech.com/dashboard" style="background:#534AB7;color:#EEEDFE;font-size:13px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">Go to dashboard →</a>
                      </div>
                      <div style="border-top:0.5px solid #2a2f3e;padding-top:16px">
                        <p style="font-size:12px;color:#5a6278;margin:0">
                          With regards,<br>
                          <strong style="color:#8892a4">Anil Kumar Mikkili</strong><br>
                          CEO &amp; Founder, Anil Software Technologies<br>
                          +91 9866376367 · contact@anilsofttech.com
                        </p>
                      </div>
                    </div>
                    </body></html>
                  `

                  // ── Send email with PDF attachment ─────────────────────
                  await sendEmail({
                    to:      user.email,
                    subject: `🎉 Congratulations! Your ${course.title} certificate is ready — CodePath`,
                    html,
                    attachments: [{
                      filename:    `certificate-${course.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                      content:     pdfBuffer.toString('base64'),
                      type:        'application/pdf',
                      disposition: 'attachment',
                    }],
                  })

                  console.log(`✓ Certificate email sent to ${user.email}`)
                } catch (emailErr) {
                  console.error('Certificate email error:', emailErr)
                }
              })()
            }
          } else {
            console.log('Certificate already issued for this course')
          }
        }
      }
    } catch (err) {
      // Non-critical — don't fail the progress save if certificate errors
      console.error('Certificate flow error (non-critical):', err)
    }
  }

  return Response.json({ progress, courseCompleted, certificateIssued })
}
