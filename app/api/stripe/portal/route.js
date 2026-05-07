// app/api/stripe/portal/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Opens Stripe Customer Portal — student can:
//   - See their billing history
//   - Update their payment method
//   - Cancel their subscription
// No custom code needed — Stripe hosts this page for you
// ─────────────────────────────────────────────────────────────────────────────

import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { stripe } from '../../../../lib/stripe'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.stripeCustomerId)
    return Response.json({ error: 'No billing account found' }, { status: 400 })

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   user.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  })

  return Response.json({ url: portalSession.url })
}
