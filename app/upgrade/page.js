'use client'
// app/upgrade/page.js  ← REPLACE existing file
// ADDED: Razorpay payment option alongside Stripe
// Students from India see both options — Razorpay for UPI/net banking
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession }                               from 'next-auth/react'
import { useSearchParams, useRouter }               from 'next/navigation'
import Link                                         from 'next/link'
import { COMPANY }                                  from '../../lib/constants'

const PLANS = [
  {
    id: 'FREE', name: 'Free', priceUSD: '$0', priceINR: '₹0', per: 'forever',
    desc: 'Try before you commit.',
    border: 'border-[#2a2f3e]',
    features: [
      { ok: true,  text: '2 free preview lessons' },
      { ok: true,  text: 'Limited AI agent (5 q/day)' },
      { ok: false, text: 'All video lessons' },
      { ok: false, text: 'Completion certificate' },
      { ok: false, text: 'Live weekly sessions' },
    ],
  },
  {
    id: 'BASIC', name: 'Basic', priceUSD: '$12', priceINR: '₹999', per: '/ month',
    desc: 'Full course access + unlimited AI.',
    border: 'border-[#534AB7]', popular: true,
    features: [
      { ok: true,  text: 'All courses & lessons' },
      { ok: true,  text: 'Unlimited AI doubt agent' },
      { ok: true,  text: 'Progress tracking' },
      { ok: true,  text: 'Completion certificate' },
      { ok: false, text: 'Live weekly sessions' },
    ],
  },
  {
    id: 'PRO', name: 'Pro', priceUSD: '$39', priceINR: '₹3,299', per: '/ month',
    desc: 'Everything in Basic + live classes.',
    border: 'border-[#2a2f3e]',
    features: [
      { ok: true, text: 'Everything in Basic' },
      { ok: true, text: 'Weekly live sessions' },
      { ok: true, text: '1:1 mentor office hours' },
      { ok: true, text: 'Priority AI support' },
      { ok: true, text: 'Job prep & interview kit' },
    ],
  },
]

export default function UpgradePage() {
  const { data: session, status } = useSession()
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const hasConfirmed  = useRef(false)

  const [loadingPlan, setLoadingPlan]       = useState(null)
  const [confirming, setConfirming]         = useState(false)
  const [message, setMessage]               = useState(null)
  const [realPlan, setRealPlan]             = useState(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const fetchRealPlan = useCallback(async () => {
    try {
      const res  = await fetch('/api/user/plan')
      const data = await res.json()
      if (data.plan) setRealPlan(data.plan)
    } catch {}
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchRealPlan()
  }, [status, fetchRealPlan])

  // Load Razorpay checkout script once
  useEffect(() => {
    const script  = document.createElement('script')
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Handle Stripe redirect
  useEffect(() => {
    const success         = searchParams.get('success')
    const cancelled       = searchParams.get('cancelled')
    const plan            = searchParams.get('plan')
    const stripeSessionId = searchParams.get('session_id')

    if (cancelled === 'true') { setMessage({ type: 'cancelled' }); router.replace('/upgrade'); return }

    if (success === 'true' && plan && stripeSessionId && !hasConfirmed.current) {
      hasConfirmed.current = true
      setConfirming(true)
      fetch('/api/stripe/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ stripeSessionId, plan }),
      })
        .then((r) => r.json())
        .then(async (data) => {
          if (data.ok) { setRealPlan(plan); setMessage({ type: 'success', plan, method: 'stripe' }) }
          else { setMessage({ type: 'error', text: data.error || 'Could not confirm payment' }) }
          router.replace('/upgrade')
        })
        .catch(() => { setMessage({ type: 'error', text: 'Network error' }); router.replace('/upgrade') })
        .finally(() => setConfirming(false))
    }
  }, [])

  // ── Stripe payment ────────────────────────────────────────────────────────
  async function payWithStripe(planId) {
    setLoadingPlan(`stripe-${planId}`)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.demo) { setMessage({ type: 'demo', gateway: 'Stripe' }); setLoadingPlan(null); return }
      if (data.url) { window.location.href = data.url; return }
      setMessage({ type: 'error', text: data.error }); setLoadingPlan(null)
    } catch { setMessage({ type: 'error', text: 'Network error' }); setLoadingPlan(null) }
  }

  // ── Razorpay payment ──────────────────────────────────────────────────────
  async function payWithRazorpay(planId) {
    if (!razorpayLoaded) { setMessage({ type: 'error', text: 'Razorpay is loading, please wait a moment' }); return }
    setLoadingPlan(`rzp-${planId}`)
    try {
      const res  = await fetch('/api/razorpay/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.demo) { setMessage({ type: 'demo', gateway: 'Razorpay' }); setLoadingPlan(null); return }
      if (data.error) { setMessage({ type: 'error', text: data.error }); setLoadingPlan(null); return }

      setLoadingPlan(null)

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        `${COMPANY.product} by ${COMPANY.name}`,
        description: `${data.plan} Plan — ${data.display}`,
        order_id:    data.orderId,
        prefill: {
          name:  data.name,
          email: data.email,
        },
        theme: { color: '#534AB7' },
        handler: async (response) => {
          // Payment successful — verify on server
          setConfirming(true)
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan:                planId,
            }),
          })
          const verifyData = await verifyRes.json()
          setConfirming(false)
          if (verifyData.ok) {
            setRealPlan(planId)
            setMessage({ type: 'success', plan: planId, method: 'razorpay' })
            await fetchRealPlan()
          } else {
            setMessage({ type: 'error', text: verifyData.error || 'Verification failed' })
          }
        },
        modal: {
          ondismiss: () => { setLoadingPlan(null) },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not open payment — ' + err.message })
      setLoadingPlan(null)
    }
  }

  function handleSubscribe(planId, gateway) {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !session) { router.push('/login?callbackUrl=/upgrade'); return }
    if (planId === 'FREE') return
    setMessage(null)
    if (gateway === 'razorpay') payWithRazorpay(planId)
    else payWithStripe(planId)
  }

  if (confirming) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-[#e2e8f0] mb-1">Confirming your payment...</p>
          <p className="text-xs text-[#5a6278]">Please wait — this takes just a second</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" /></div>
  }

  const currentPlan = realPlan || session?.user?.plan || 'FREE'

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">
      <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium">{COMPANY.product}</span>
        </Link>
        <div className="flex items-center gap-4">
          {session && <Link href="/dashboard" className="text-xs text-[#8892a4] hover:text-[#e2e8f0]">← Dashboard</Link>}
          {session && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              currentPlan === 'PRO' ? 'bg-[#1e2a1e] text-[#1D9E75]' :
              currentPlan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
              'bg-[#2a2f3e] text-[#8892a4]'}`}>{currentPlan} plan</span>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Pricing</p>
          <h1 className="text-3xl font-medium tracking-tight mb-3">Simple, honest pricing</h1>
          <p className="text-sm text-[#8892a4]">Pay via card (international) or UPI / net banking (India)</p>
          {session && (
            <p className="text-xs text-[#5a6278] mt-2">
              Logged in as <span className="text-[#c8d0e0]">{session.user.email}</span> — <span className="text-[#7f77dd] font-medium">{currentPlan}</span> plan
            </p>
          )}
        </div>

        {/* Messages */}
        {message?.type === 'success' && (
          <div className="mb-8 bg-[#1e2a1e] border border-[#1D9E75]/50 rounded-xl p-6 text-center">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-base font-medium text-[#1D9E75] mb-1">Payment confirmed! You are now on the {message.plan} plan.</p>
            <p className="text-xs text-[#8892a4] mb-2">
              Paid via {message.method === 'razorpay' ? 'Razorpay (India)' : 'Stripe (International)'} · A receipt was sent to your email.
            </p>
            <Link href="/dashboard" className="inline-block bg-[#1D9E75] text-white text-sm font-medium px-8 py-2.5 rounded-lg hover:opacity-90 mt-2">
              Go to dashboard →
            </Link>
          </div>
        )}
        {message?.type === 'cancelled' && (
          <div className="mb-6 bg-[#2a2f3e]/40 border border-[#2a2f3e] rounded-xl p-4 text-center">
            <p className="text-sm text-[#8892a4]">Payment cancelled. No charge was made.</p>
          </div>
        )}
        {message?.type === 'error' && (
          <div className="mb-6 bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
            <p className="text-xs text-red-400">{message.text}</p>
          </div>
        )}
        {message?.type === 'demo' && (
          <div className="mb-6 bg-[#1e2a22] border border-[#BA7517]/40 rounded-xl p-4">
            <p className="text-sm font-medium text-[#BA7517] mb-1">⚠ {message.gateway} not configured yet</p>
            <p className="text-xs text-[#8892a4]">Add the required environment variables in Render to enable payments.</p>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} className={`bg-[#161b27] rounded-xl p-6 relative border-2 ${plan.border}`}>
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#534AB7] text-[#EEEDFE] text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">Most popular</div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-[#1D9E75] text-white text-[10px] font-medium px-3 py-1 rounded-full">✓ Current plan</div>
                )}
                <p className="text-xs text-[#8892a4] mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-2xl font-medium">{plan.priceINR}</span>
                  <span className="text-xs text-[#5a6278]">{plan.per}</span>
                </div>
                <p className="text-[10px] text-[#5a6278] mb-4">{plan.priceUSD} USD equiv.</p>
                <hr className="border-[#2a2f3e] mb-4" />
                <ul className="space-y-2.5 mb-5">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-[11px]">
                      {f.ok
                        ? <span className="w-3.5 h-3.5 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" /></span>
                        : <span className="w-3.5 h-3.5 rounded-full bg-[#2a2f3e]/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] text-[#5a6278]">✕</span>
                      }
                      <span className={f.ok ? 'text-[#8892a4]' : 'text-[#5a6278]/60'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'FREE' ? (
                  <Link href={session ? '/dashboard' : '/login'} className="block w-full text-center text-xs font-medium py-2.5 rounded-lg border border-[#2a2f3e] text-[#8892a4] hover:bg-[#2a2f3e]/30">
                    {session ? 'Go to dashboard' : 'Get started free'}
                  </Link>
                ) : isCurrent ? (
                  <button disabled className="w-full text-xs font-medium py-2.5 rounded-lg bg-[#1D9E75]/20 text-[#1D9E75] cursor-default">✓ Active plan</button>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Razorpay — Indian payments */}
                    <button onClick={() => handleSubscribe(plan.id, 'razorpay')}
                      disabled={loadingPlan !== null}
                      className="w-full text-xs font-medium py-2 rounded-lg bg-[#3395FF] text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5">
                      {loadingPlan === `rzp-${plan.id}`
                        ? '⏳ Opening...'
                        : <><span>Pay with Razorpay</span><span className="text-[10px] opacity-80">UPI · Net banking · Card</span></>
                      }
                    </button>
                    {/* Stripe — international */}
                    <button onClick={() => handleSubscribe(plan.id, 'stripe')}
                      disabled={loadingPlan !== null}
                      className="w-full text-xs font-medium py-2 rounded-lg border border-[#534AB7]/50 text-[#7f77dd] hover:bg-[#534AB7]/10 disabled:opacity-60">
                      {loadingPlan === `stripe-${plan.id}` ? '⏳ Redirecting...' : 'Pay with Stripe (International card)'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center text-[11px] text-[#5a6278] space-y-1">
          <p>Razorpay — UPI, PhonePe, Paytm, Net banking, Indian cards · Charged in INR</p>
          <p>Stripe — International cards (Visa, Mastercard, Amex) · Charged in USD</p>
          <p className="mt-2">Cancel anytime · No hidden fees · Receipts sent by email</p>
        </div>
      </div>
    </div>
  )
}
