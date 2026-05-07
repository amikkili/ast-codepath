// lib/stripe.js
// ─────────────────────────────────────────────────────────────────────────────
// Stripe configuration and helper functions
//
// SETUP STEPS:
// 1. Go to https://stripe.com → sign up free
// 2. In Stripe Dashboard → Developers → API keys
//    Copy: Publishable key (pk_test_xxx) and Secret key (sk_test_xxx)
// 3. In Stripe Dashboard → Products → Create product for each plan:
//    - "CodePath Basic" → $12/month → copy Price ID (price_xxx)
//    - "CodePath Pro"   → $39/month → copy Price ID (price_xxx)
// 4. Paste all IDs into your .env.local
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

// ── Map plan names to Stripe Price IDs ───────────────────────────────────────
// Replace these with your actual Stripe Price IDs after creating products
export const STRIPE_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC, // e.g. price_1PxxxxxxxxxxxxBasic
  PRO:   process.env.STRIPE_PRICE_PRO,   // e.g. price_1PxxxxxxxxxxxxPro
}

// ── Map Stripe Price IDs back to our plan names ───────────────────────────────
export function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_PRICE_BASIC) return 'BASIC'
  if (priceId === process.env.STRIPE_PRICE_PRO)   return 'PRO'
  return 'FREE'
}

// ── Get or create a Stripe customer for a user ───────────────────────────────
export async function getOrCreateStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email: user.email,
    name:  user.name,
    metadata: { userId: user.id },
  })

  await db.user.update({
    where: { id: user.id },
    data:  { stripeCustomerId: customer.id },
  })

  return customer.id
}
