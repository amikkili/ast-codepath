// app/api/stripe/checkout/route.js  ← REPLACE existing file
// FIX: Added cleaner success_url and ensured metadata is passed correctly
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

const PRICE_IDS = {
  BASIC: process.env.STRIPE_PRICE_BASIC,
  PRO:   process.env.STRIPE_PRICE_PRO,
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Login required' }, { status: 401 })

  const { plan } = await req.json()
  if (!PRICE_IDS[plan])
    return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return Response.json({ demo: true, message: 'Stripe not configured' })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' })

    const appUrl = process.env.NEXTAUTH_URL || 'https://ast-codepath.onrender.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      customer_email:       session.user.email,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],

      // ── After payment → redirect back with all info in URL ────────────
      success_url: `${appUrl}/upgrade?success=true&plan=${plan}&uid=${session.user.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/upgrade?cancelled=true`,

      // ── Metadata passed to webhook ─────────────────────────────────────
      metadata: {
        userId:    session.user.id,
        userEmail: session.user.email,
        plan:      plan,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan:   plan,
        },
      },
      allow_promotion_codes: true,
    })

    return Response.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
