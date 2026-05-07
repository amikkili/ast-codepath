// app/api/stripe/portal/route.js
// ─────────────────────────────────────────────────────────────────────────────
// FIXED: uses getStripe() lazy function + force-dynamic
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { getStripe } from '../../../../lib/stripe'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.stripeCustomerId) {
      return Response.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    const stripe  = getStripe()
    const appUrl  = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    })

    return Response.json({ url: portalSession.url })

  } catch (err) {
    console.error('Portal error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
