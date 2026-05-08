// lib/email.js  ← REPLACE entire file
// UPDATED: sendEmail now supports attachments (needed for certificate PDF)

const COMPANY = {
  name:    'Anil Software Technologies',
  product: 'CodePath',
  email:   'contact@anilsofttech.com',
  website: 'https://www.anilsofttech.com',
  color:   '#534AB7',
}

// ── Send email via Resend API (with optional attachments) ─────────────────────
export async function sendEmail({ to, subject, html, attachments = [] }) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log('[EMAIL] Add RESEND_API_KEY to env to send real emails')
    return { ok: true, demo: true }
  }

  try {
    const body = {
      from:    `${COMPANY.product} by ${COMPANY.name} <${COMPANY.email}>`,
      to:      [to],
      subject,
      html,
    }

    // Add attachments if provided (for certificate PDF)
    if (attachments.length > 0) {
      body.attachments = attachments
    }

    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Resend error:', data)
      return { ok: false, error: data.message }
    }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('Email send failed:', err)
    return { ok: false, error: err.message }
  }
}

// ── Template 1: Welcome email ─────────────────────────────────────────────────
export function welcomeEmail({ name }) {
  const html = emailWrapper(`
    <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Welcome to ${COMPANY.product}, ${name.split(' ')[0]}!</h1>
    <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">
      Your account has been created. You are on the <strong style="color:#7f77dd">Free plan</strong> — 2 free lessons + AI doubt agent (5 questions/day).
    </p>
    <div style="background:#0f1117;border:0.5px solid #2a2f3e;border-radius:8px;padding:16px;margin:0 0 24px">
      <p style="font-size:13px;font-weight:500;color:#e2e8f0;margin:0 0 10px">What you can do now:</p>
      <p style="font-size:13px;color:#8892a4;margin:0 0 6px;line-height:1.6">▶ Watch 2 free Python lessons</p>
      <p style="font-size:13px;color:#8892a4;margin:0 0 6px;line-height:1.6">◉ Ask our AI tutor any doubt</p>
      <p style="font-size:13px;color:#8892a4;margin:0;line-height:1.6">⬆ Upgrade to unlock all courses</p>
    </div>
    <div style="text-align:center;margin:0 0 20px">
      <a href="${COMPANY.website}/dashboard" style="background:#534AB7;color:#EEEDFE;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">Go to your dashboard →</a>
    </div>
    <div style="border-top:0.5px solid #2a2f3e;padding-top:16px">
      <p style="font-size:12px;color:#5a6278;margin:0">Need help? <a href="mailto:${COMPANY.email}" style="color:#534AB7">${COMPANY.email}</a> · +91 9866376367</p>
    </div>
  `)
  return { subject: `Welcome to ${COMPANY.product}! Your account is ready`, html }
}

// ── Template 2: Password reset ────────────────────────────────────────────────
export function passwordResetEmail({ name, resetUrl, expiresInMinutes = 30 }) {
  const html = emailWrapper(`
    <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Reset your password</h1>
    <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">Hi ${name.split(' ')[0]}, click the button below to create a new password.</p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${resetUrl}" style="background:#534AB7;color:#EEEDFE;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">Reset my password →</a>
    </div>
    <div style="background:#0f1117;border:0.5px solid #2a2f3e;border-radius:8px;padding:14px;margin:0 0 20px">
      <p style="font-size:12px;color:#5a6278;margin:0">This link expires in <strong style="color:#8892a4">${expiresInMinutes} minutes</strong>. If you did not request this, ignore the email.</p>
    </div>
  `)
  return { subject: `Reset your ${COMPANY.product} password`, html }
}

// ── Template 3: Payment confirmation ─────────────────────────────────────────
export function paymentConfirmationEmail({ name, plan, amount }) {
  const html = emailWrapper(`
    <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Payment confirmed — welcome to ${plan}!</h1>
    <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">Hi ${name.split(' ')[0]}, your ${COMPANY.product} ${plan} subscription is now active.</p>
    <div style="background:#1e2a1e;border:0.5px solid #1D9E75;border-radius:8px;padding:16px;margin:0 0 24px">
      <p style="font-size:13px;font-weight:500;color:#1D9E75;margin:0 0 8px">Order summary</p>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:13px;color:#8892a4">${COMPANY.product} ${plan} plan (monthly)</span>
        <span style="font-size:13px;font-weight:500;color:#e2e8f0">${amount}</span>
      </div>
    </div>
    <div style="text-align:center;margin:0 0 20px">
      <a href="${COMPANY.website}/dashboard" style="background:#1D9E75;color:#fff;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">Start learning now →</a>
    </div>
  `)
  return { subject: `Your ${COMPANY.product} ${plan} subscription is active`, html }
}

// ── Shared email HTML wrapper ─────────────────────────────────────────────────
function emailWrapper(body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:Inter,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:24px;text-align:center">
  <div style="display:inline-flex;align-items:center;gap:8px">
    <div style="width:10px;height:10px;border-radius:50%;background:${COMPANY.color};display:inline-block"></div>
    <span style="font-size:16px;font-weight:500;color:#e2e8f0">${COMPANY.product}</span>
  </div>
  <div style="font-size:11px;color:#5a6278;margin-top:4px">by ${COMPANY.name}</div>
</td></tr>
<tr><td style="background:#161b27;border:0.5px solid #2a2f3e;border-radius:12px;padding:32px">${body}</td></tr>
<tr><td style="padding-top:20px;text-align:center">
  <p style="font-size:11px;color:#5a6278;margin:0">${COMPANY.name} · <a href="${COMPANY.website}" style="color:#534AB7">${COMPANY.website}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
