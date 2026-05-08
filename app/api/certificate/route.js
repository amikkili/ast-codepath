// app/api/certificate/route.js  ← REPLACE existing file
// Simplified: just GET (list certificates) and POST (manual re-send)
// Certificate generation is now triggered directly from progress API

import { db }                     from '../../../lib/db'
import { getServerSession }       from 'next-auth'
import { authOptions }            from '../../../lib/auth'
import { generateCertificatePDF } from '../../../lib/certificate'
import { sendEmail }              from '../../../lib/email'

// ── GET: list all certificates for logged-in student ──────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const certs = await db.certificate.findMany({
    where:   { userId: session.user.id },
    orderBy: { issuedAt: 'desc' },
  })
  return Response.json({ certificates: certs })
}

// ── POST: re-send an existing certificate by email ────────────────────────────
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return Response.json({ error: 'courseId required' }, { status: 400 })

  const cert = await db.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })

  if (!cert) return Response.json({ error: 'No certificate found for this course' }, { status: 404 })

  const user   = await db.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true, language: true } })

  if (!user || !course) return Response.json({ error: 'User or course not found' }, { status: 404 })

  // Generate PDF and re-send
  const certId    = `AST-${new Date(cert.issuedAt).getFullYear()}-${course.language.slice(0,2).toUpperCase()}-${cert.id.slice(-6).toUpperCase()}`
  const pdfBuffer = await generateCertificatePDF({
    studentName:   user.name,
    courseName:    course.title,
    issuedAt:      cert.issuedAt,
    certificateId: certId,
  })

  const html = `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f1117;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:28px">
      <div style="text-align:center;margin-bottom:16px"><div style="font-size:36px">📎</div></div>
      <h2 style="font-size:18px;font-weight:500;color:#e2e8f0;margin:0 0 8px;text-align:center">Your certificate is attached</h2>
      <p style="font-size:13px;color:#8892a4;text-align:center;margin:0 0 16px">
        Here is your re-sent certificate for <strong style="color:#7f77dd">${course.title}</strong>
      </p>
      <div style="text-align:center">
        <a href="https://www.anilsofttech.com/dashboard" style="background:#534AB7;color:#EEEDFE;font-size:12px;padding:10px 24px;border-radius:8px;text-decoration:none;display:inline-block">Go to dashboard</a>
      </div>
    </div>
  </body></html>`

  await sendEmail({
    to:      user.email,
    subject: `Your ${course.title} certificate — CodePath by Anil Software Technologies`,
    html,
    attachments: [{
      filename:    `certificate-${course.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      content:     pdfBuffer.toString('base64'),
      type:        'application/pdf',
      disposition: 'attachment',
    }],
  })

  return Response.json({ ok: true, message: `Certificate re-sent to ${user.email}` })
}
