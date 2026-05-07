// app/api/razorpay/verify/route.js  ← NEW FILE
// Verifies Razorpay payment signature (prevents fake payments).
// After verification, upgrades student plan in PostgreSQL.
import { db }               from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions }      from '../../../../lib/auth'
import { sendEmail, paymentConfirmationEmail } from '../../../../lib/email'
import crypto               from 'crypto'

const INR_DISPLAY = {
  BASIC: '₹999/month',
  PRO:   '₹3,299/month',
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan)
    return Response.json({ error: 'Missing payment details' }, { status: 400 })

  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret) {
    // Demo mode — still upgrade plan for testing
    await db.user.update({
      where: { id: session.user.id },
      data:  { plan },
    })
    return Response.json({ ok: true, plan })
  }

  try {
    // ── Verify HMAC signature — prevents fake payment claims ──────────────
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected  = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      console.error('Razorpay signature mismatch — possible fraud attempt')
      return Response.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // ── Signature valid — upgrade plan in DB ──────────────────────────────
    await db.user.update({
      where: { id: session.user.id },
      data:  { plan },
    })

    console.log(`✓ Razorpay payment verified: ${session.user.email} → ${plan}`)

    // ── Send payment confirmation email (non-blocking) ────────────────────
    const user = await db.user.findUnique({
      where:  { id: session.user.id },
      select: { name: true, email: true },
    })
    if (user) {
      const template = paymentConfirmationEmail({
        name:   user.name,
        plan,
        amount: INR_DISPLAY[plan] || plan,
      })
      sendEmail({ to: user.email, ...template }).catch(() => {})
    }

    return Response.json({ ok: true, plan })
  } catch (err) {
    console.error('Razorpay verify error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
