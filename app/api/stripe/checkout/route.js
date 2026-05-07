// app/api/stripe/checkout/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Creates a Stripe Checkout session for a plan upgrade.
// Student is redirected to Stripe's secure payment page.
// After payment, Stripe redirects them back to /dashboard?success=true
// ─────────────────────────────────────────────────────────────────────────────

import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { stripe, STRIPE_PRICES } from '../../../../lib/stripe'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!['BASIC', 'PRO'].includes(plan))
    return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const priceId = STRIPE_PRICES[plan]
  if (!priceId)
    return Response.json({ error: 'Price not configured. Set STRIPE_PRICE_BASIC and STRIPE_PRICE_PRO in env.' }, { status: 500 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  user.name,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
    cancel_url:  `${appUrl}/pricing?cancelled=true`,
    metadata: { userId: user.id, plan },
    subscription_data: {
      metadata: { userId: user.id, plan },
    },
    allow_promotion_codes: true,
  })

  return Response.json({ url: checkoutSession.url })
}
