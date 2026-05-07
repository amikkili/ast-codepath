// app/api/contact/route.js  ← NEW FILE
// Handles both General Inquiry and Request Demo form submissions.
// Sends email to contact@anilsofttech.com via Resend.
import { sendEmail } from '../../../lib/email'

export async function POST(req) {
  try {
    const body = await req.json()
    const { type, name, email, subject, message, company, phone, enquiry } = body

    if (!name || !email)
      return Response.json({ error: 'Name and email are required' }, { status: 400 })

    // ── Email to you (the admin) ──────────────────────────────────────────
    const isDemo = type === 'demo'
    const adminSubject = isDemo
      ? `New Demo Request from ${name} — ${company || 'Individual'}`
      : `New Inquiry: ${subject || 'General'} — from ${name}`

    const adminHtml = `
      <!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f1117;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:28px">
        <div style="margin-bottom:20px">
          <span style="display:inline-flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:#534AB7;display:inline-block"></span>
            <span style="font-size:14px;font-weight:500;color:#e2e8f0">CodePath — Anil Software Technologies</span>
          </span>
        </div>
        <h2 style="font-size:18px;font-weight:500;color:#e2e8f0;margin:0 0 6px">
          ${isDemo ? '📋 New Demo Request' : '✉ New General Inquiry'}
        </h2>
        <p style="font-size:12px;color:#5a6278;margin:0 0 20px">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>

        <table style="width:100%;border-collapse:collapse">
          ${[
            ['Name', name],
            ['Email', email],
            phone ? ['Phone', phone] : null,
            company ? ['Company', company] : null,
            subject ? ['Subject', subject] : null,
            enquiry ? ['Enquiry type', enquiry] : null,
          ].filter(Boolean).map(([k, v]) => `
            <tr>
              <td style="padding:8px 12px;background:#0f1117;border:0.5px solid #2a2f3e;font-size:12px;color:#8892a4;width:120px">${k}</td>
              <td style="padding:8px 12px;background:#0f1117;border:0.5px solid #2a2f3e;font-size:12px;color:#e2e8f0">${v}</td>
            </tr>
          `).join('')}
        </table>

        ${message ? `
        <div style="margin-top:16px;background:#0f1117;border:0.5px solid #2a2f3e;border-radius:8px;padding:14px">
          <p style="font-size:11px;color:#5a6278;margin:0 0 6px">Message</p>
          <p style="font-size:13px;color:#c8d0e0;line-height:1.7;margin:0">${message}</p>
        </div>` : ''}

        <div style="margin-top:20px;padding-top:16px;border-top:0.5px solid #2a2f3e">
          <a href="mailto:${email}" style="background:#534AB7;color:#EEEDFE;font-size:13px;font-weight:500;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">
            Reply to ${name} →
          </a>
        </div>
      </div>
      </body></html>
    `

    // ── Auto-reply to the person who submitted ────────────────────────────
    const replySubject = isDemo
      ? `We received your demo request — AST CodePath`
      : `Thanks for reaching out — AST CodePath`

    const replyHtml = `
      <!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f1117;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:28px">
        <div style="margin-bottom:20px">
          <span style="display:inline-flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:#534AB7;display:inline-block"></span>
            <span style="font-size:14px;font-weight:500;color:#e2e8f0">CodePath — Anil Software Technologies</span>
          </span>
        </div>
        <h2 style="font-size:18px;font-weight:500;color:#e2e8f0;margin:0 0 12px">Hi ${name.split(' ')[0]}, we got your message!</h2>
        <p style="font-size:13px;color:#8892a4;line-height:1.7;margin:0 0 16px">
          ${isDemo
            ? 'Thank you for requesting a demo of CodePath. Anil Kumar Mikkili will personally review your request and get back to you within 24 business hours to schedule a convenient time.'
            : 'Thank you for reaching out to Anil Software Technologies. We have received your inquiry and will respond within 24 business hours (Mon–Fri, 10 AM – 6 PM IST).'}
        </p>
        <div style="background:#0f1117;border:0.5px solid #2a2f3e;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="font-size:12px;font-weight:500;color:#e2e8f0;margin:0 0 10px">Our contact details</p>
          <p style="font-size:12px;color:#8892a4;margin:0 0 4px">📍 Ponnur, Guntur (DT), Andhra Pradesh, India — 522124</p>
          <p style="font-size:12px;color:#8892a4;margin:0 0 4px">📞 +91 9866376367 (Mon–Fri, 10 AM – 6 PM IST)</p>
          <p style="font-size:12px;color:#8892a4;margin:0">✉ contact@anilsofttech.com</p>
        </div>
        <a href="https://www.anilsofttech.com" style="background:#534AB7;color:#EEEDFE;font-size:13px;font-weight:500;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Visit CodePath →
        </a>
      </div>
      </body></html>
    `

    // Send both emails in parallel
    await Promise.all([
      sendEmail({ to: 'contact@anilsofttech.com', subject: adminSubject, html: adminHtml }),
      sendEmail({ to: email, subject: replySubject, html: replyHtml }),
    ])

    return Response.json({ ok: true, message: 'Message sent successfully' })
  } catch (err) {
    console.error('Contact form error:', err)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
