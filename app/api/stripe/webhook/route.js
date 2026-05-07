// app/api/stripe/webhook/route.js
// ─────────────────────────────────────────────────────────────────────────────
// FIXED: uses getStripe() lazy function + force-dynamic
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { getStripe, getPlanFromPriceId } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { headers } from 'next/headers'

export async function POST(req) {
  try {
    const body      = await req.text()
    const signature = headers().get('stripe-signature')

    const stripe = getStripe()
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    switch (event.type) {

      // Payment succeeded — upgrade user plan
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object
        const userId = checkoutSession.metadata?.userId
        const plan   = checkoutSession.metadata?.plan

        if (userId && plan) {
          const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription
          )
          await db.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeSubscriptionId:   checkoutSession.subscription,
              stripePriceId:          subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
          console.log(`Upgraded user ${userId} to ${plan}`)
        }
        break
      }

      // Monthly renewal — refresh period end date
      case 'customer.subscription.updated': {
        const sub     = event.data.object
        const priceId = sub.items.data[0].price.id
        const plan    = getPlanFromPriceId(priceId)

        await db.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            plan,
            stripePriceId:          priceId,
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        })
        break
      }

      // Subscription cancelled — downgrade to FREE
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await db.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            plan:                    'FREE',
            stripeSubscriptionId:    null,
            stripePriceId:           null,
            stripeCurrentPeriodEnd:  null,
          },
        })
        console.log(`Subscription cancelled — user downgraded to FREE`)
        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return Response.json({ received: true })

  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(`Server error: ${err.message}`, { status: 500 })
  }
}
