// lib/stripe.js
// ─────────────────────────────────────────────────────────────────────────────
// FIXED: Stripe client is now lazy — only created when first used.
// This prevents the "Neither apiKey nor config.authenticator provided" build error
// that happens when Next.js analyzes route files before env vars are loaded.
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'

// ── Lazy Stripe client ────────────────────────────────────────────────────────
let _stripe = null

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    })
  }
  return _stripe
}

// ── Map plan names to Stripe Price IDs ───────────────────────────────────────
export const STRIPE_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC,
  PRO:   process.env.STRIPE_PRICE_PRO,
}

// ── Map Stripe Price ID back to plan name ─────────────────────────────────────
export function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_PRICE_BASIC) return 'BASIC'
  if (priceId === process.env.STRIPE_PRICE_PRO)   return 'PRO'
  return 'FREE'
}
