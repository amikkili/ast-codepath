// app/api/razorpay/order/route.js  ← NEW FILE
// Creates a Razorpay order. Student pays in INR via UPI / net banking / card.
// Razorpay Key ID and Secret from: razorpay.com → Settings → API Keys
import { getServerSession } from 'next-auth'
import { authOptions }      from '../../../../lib/auth'

// INR prices per plan (paise — 1 INR = 100 paise)
const INR_PRICES = {
  BASIC: { amount: 99900,  display: '₹999/month'  },  // ₹999
  PRO:   { amount: 329900, display: '₹3,299/month' },  // ₹3,299
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Login required' }, { status: 401 })

  const { plan } = await req.json()
  if (!INR_PRICES[plan])
    return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return Response.json({ demo: true, message: 'Razorpay not configured yet' })
  }

  try {
    const { amount } = INR_PRICES[plan]

    // Create order via Razorpay REST API
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount,                // in paise
        currency: 'INR',
        receipt:  `ast_${session.user.id}_${Date.now()}`,
        notes: {
          userId:    session.user.id,
          userEmail: session.user.email,
          plan,
        },
      }),
    })

    const order = await res.json()
    if (!res.ok) throw new Error(order.error?.description || 'Razorpay order failed')

    return Response.json({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId,                        // sent to frontend to open checkout
      name:      session.user.name,
      email:     session.user.email,
      plan,
      display:   INR_PRICES[plan].display,
    })
  } catch (err) {
    console.error('Razorpay order error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
