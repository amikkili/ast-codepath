// app/api/stripe/confirm/route.js  ← NEW FILE
// ─────────────────────────────────────────────────────────────────────────────
// BACKUP: Called directly from the browser after payment redirect.
// Verifies the Stripe session is paid, then upgrades the plan in DB.
// This ensures plan updates even if the webhook is slow or misconfigured.
// ─────────────────────────────────────────────────────────────────────────────
import { db } from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { stripeSessionId, plan } = await req.json()

  if (!stripeSessionId || !plan)
    return Response.json({ error: 'stripeSessionId and plan required' }, { status: 400 })

  if (!['BASIC', 'PRO'].includes(plan))
    return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const stripeKey = process.env.STRIPE_SECRET_KEY

  // ── If Stripe not configured, still update plan (for testing) ─────────────
  if (!stripeKey) {
    await db.user.update({
      where: { id: session.user.id },
      data:  { plan },
    })
    return Response.json({ ok: true, plan })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' })

    // Verify with Stripe that this session was actually paid
    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId)

    if (stripeSession.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not confirmed by Stripe' }, { status: 400 })
    }

    // Verify the session belongs to this user
    if (stripeSession.customer_email !== session.user.email) {
      return Response.json({ error: 'Session mismatch' }, { status: 403 })
    }

    // Update the plan in database
    await db.user.update({
      where: { id: session.user.id },
      data:  { plan },
    })

    console.log(`✓ Plan confirmed and upgraded: ${session.user.email} → ${plan}`)
    return Response.json({ ok: true, plan })
  } catch (err) {
    console.error('Confirm error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
