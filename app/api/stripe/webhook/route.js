// app/api/stripe/webhook/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Stripe sends events here after payment success, failure, cancellation.
// This is how your database automatically updates when someone pays.
//
// SETUP:
// 1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
//    URL: https://www.anilsofttech.com/api/stripe/webhook
//    Events to listen for:
//      - checkout.session.completed
//      - customer.subscription.updated
//      - customer.subscription.deleted
// 2. Copy the Webhook Signing Secret (whsec_xxx) → add to .env as STRIPE_WEBHOOK_SECRET
// ─────────────────────────────────────────────────────────────────────────────

import { stripe, getPlanFromPriceId } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { headers } from 'next/headers'

// Stripe needs raw body — must disable body parser
export const runtime = 'nodejs'

export async function POST(req) {
  const body      = await req.text()
  const signature = headers().get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {

    // Payment succeeded — upgrade user plan
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId  = session.metadata?.userId
      const plan    = session.metadata?.plan

      if (userId && plan) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        await db.user.update({
          where: { id: userId },
          data: {
            plan:                    plan,
            stripeSubscriptionId:    session.subscription,
            stripePriceId:           subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd:  new Date(subscription.current_period_end * 1000),
          },
        })
        console.log(`✓ Upgraded user ${userId} to ${plan}`)
      }
      break
    }

    // Subscription renewed (monthly) — refresh period end date
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const userId       = subscription.metadata?.userId
      const priceId      = subscription.items.data[0].price.id
      const plan         = getPlanFromPriceId(priceId)

      if (userId) {
        await db.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan,
            stripePriceId:          priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        console.log(`✓ Subscription updated for ${userId} — plan: ${plan}`)
      }
      break
    }

    // Subscription cancelled — downgrade to FREE
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await db.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan:                    'FREE',
          stripeSubscriptionId:    null,
          stripePriceId:           null,
          stripeCurrentPeriodEnd:  null,
        },
      })
      console.log(`✓ Subscription cancelled — user downgraded to FREE`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return Response.json({ received: true })
}
