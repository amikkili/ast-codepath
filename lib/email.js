// lib/email.js  ← PUT THIS IN YOUR lib/ FOLDER (same folder as db.js and auth.js)
// Resend.com email client + all branded email templates for AST CodePath

const COMPANY = {
  name:    'Anil Software Technologies',
  product: 'CodePath',
  email:   'contact@anilsofttech.com',
  website: 'https://www.anilsofttech.com',
  color:   '#534AB7',
}

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`)
    console.log('[EMAIL DEV] Add RESEND_API_KEY to .env.local to send real emails')
    return { ok: true, demo: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${COMPANY.product} by ${COMPANY.name} <${COMPANY.email}>`,
        to:   [to],
        subject,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) { console.error('Resend error:', data); return { ok: false, error: data.message } }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('Email send failed:', err)
    return { ok: false, error: err.message }
  }
}

function wrap(body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:Inter,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px">
<tr><td align="center"><table width="520" cellpadding="0" cellspacing="0">
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
</table></td></tr></table></body></html>`
}

export function welcomeEmail({ name }) {
  return {
    subject: `Welcome to ${COMPANY.product}! Your account is ready`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Welcome, ${name.split(' ')[0]}!</h1>
      <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">
        Your account is active. You are on the <strong style="color:#7f77dd">Free plan</strong> — 
        upgrade anytime to unlock all lessons.
      </p>
      <div style="text-align:center;margin:0 0 20px">
        <a href="${COMPANY.website}/dashboard" style="background:#534AB7;color:#EEEDFE;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
          Go to your dashboard →
        </a>
      </div>
      <p style="font-size:12px;color:#5a6278;margin:0">
        Questions? Email <a href="mailto:${COMPANY.email}" style="color:#534AB7">${COMPANY.email}</a> · +91 9866376367
      </p>
    `),
  }
}

export function passwordResetEmail({ name, resetUrl, expiresInMinutes = 30 }) {
  return {
    subject: `Reset your ${COMPANY.product} password`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Reset your password</h1>
      <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">
        Hi ${name.split(' ')[0]}, click below to set a new password. This link expires in ${expiresInMinutes} minutes.
      </p>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${resetUrl}" style="background:#534AB7;color:#EEEDFE;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
          Reset my password →
        </a>
      </div>
      <p style="font-size:12px;color:#5a6278;margin:0">
        Did not request this? Ignore this email — your password will not change.<br>
        Link: <a href="${resetUrl}" style="color:#534AB7;word-break:break-all">${resetUrl}</a>
      </p>
    `),
  }
}

export function paymentConfirmationEmail({ name, plan, amount }) {
  return {
    subject: `Your ${COMPANY.product} ${plan} subscription is active`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:500;color:#e2e8f0;margin:0 0 8px">Payment confirmed!</h1>
      <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 20px">
        Hi ${name.split(' ')[0]}, your ${plan} subscription is now active.
      </p>
      <div style="background:#1e2a1e;border:0.5px solid #1D9E75;border-radius:8px;padding:14px;margin:0 0 24px">
        <p style="font-size:13px;font-weight:500;color:#1D9E75;margin:0 0 6px">Order summary</p>
        <p style="font-size:13px;color:#8892a4;margin:0">${COMPANY.product} ${plan} plan — ${amount}</p>
      </div>
      <div style="text-align:center;margin:0 0 20px">
        <a href="${COMPANY.website}/dashboard" style="background:#1D9E75;color:#fff;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block">
          Start learning now →
        </a>
      </div>
      <p style="font-size:12px;color:#5a6278;margin:0">
        Cancel anytime from your account. Questions? <a href="mailto:${COMPANY.email}" style="color:#534AB7">${COMPANY.email}</a>
      </p>
    `),
  }
}
