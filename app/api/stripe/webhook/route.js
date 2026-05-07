// app/api/stripe/webhook/route.js  ← REPLACE your existing webhook with this
// FIX: Separated plan update and stripeCustomerId update so that even if
//      one fails the other still succeeds. Plan update is now the priority.
import { db } from '../../../../lib/db'

export async function POST(req) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.log('Stripe not configured — webhook skipped')
    return Response.json({ received: true })
  }

  try {
    const Stripe    = (await import('stripe')).default
    const stripe    = new Stripe(stripeKey, { apiVersion: '2024-04-10' })
    const body      = await req.text()
    const signature = req.headers.get('stripe-signature')

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature failed:', err.message)
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        const userId  = session.metadata?.userId
        const plan    = session.metadata?.plan

        console.log(`Payment received — userId: ${userId}, plan: ${plan}`)

        if (!userId || !plan) {
          console.error('Missing userId or plan in metadata')
          break
        }

        // ── Step 1: Update plan first (most important) ────────────────────
        await db.user.update({
          where: { id: userId },
          data:  { plan: plan },
        })
        console.log(`✓ Plan upgraded to ${plan} for userId: ${userId}`)

        // ── Step 2: Save Stripe customer ID separately (safe to fail) ─────
        // This only works after the schema migration has run.
        // If column doesn't exist yet it logs a warning but doesn't crash.
        if (session.customer) {
          try {
            await db.user.update({
              where: { id: userId },
              data:  { stripeCustomerId: session.customer },
            })
            console.log(`✓ Stripe customer ID saved: ${session.customer}`)
          } catch (err) {
            console.warn('Could not save stripeCustomerId — run migration:', err.message)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Student cancelled — downgrade to FREE
        const sub    = event.data.object
        const userId = sub.metadata?.userId
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data:  { plan: 'FREE' },
          })
          console.log(`Plan downgraded to FREE for userId: ${userId}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        console.log('Payment failed for customer:', event.data.object.customer)
        break
      }

      default:
        break
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'Webhook error' }, { status: 500 })
  }
}
