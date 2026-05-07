// app/api/stripe/checkout/route.js
// ─────────────────────────────────────────────────────────────────────────────
// FIXED: uses getStripe() lazy function instead of top-level stripe instance.
// force-dynamic prevents Next.js from statically analyzing this route at build.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { getStripe, STRIPE_PRICES } from '../../../../lib/stripe'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Please log in first' }, { status: 401 })
    }

    const { plan } = await req.json()
    if (!['BASIC', 'PRO'].includes(plan)) {
      return Response.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const priceId = STRIPE_PRICES[plan]
    if (!priceId) {
      return Response.json(
        { error: `Stripe price not configured. Add STRIPE_PRICE_${plan} to your environment variables in Render.` },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    const user   = await db.user.findUnique({ where: { id: session.user.id } })

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        name:     user.name,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await db.user.update({
        where: { id: user.id },
        data:  { stripeCustomerId: customerId },
      })
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url:  `${appUrl}/pricing?cancelled=true`,
      metadata:    { userId: user.id, plan },
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      allow_promotion_codes: true,
    })

    return Response.json({ url: checkoutSession.url })

  } catch (err) {
    console.error('Stripe checkout error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
