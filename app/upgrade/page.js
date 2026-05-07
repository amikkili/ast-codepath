'use client'
// app/upgrade/page.js  ← REPLACE existing file
// FIX: Stops blinking by:
// 1. useRef to ensure confirmation only runs ONCE
// 2. router.replace() to clean URL params after processing
// 3. Removed update() from confirm flow (it was causing re-renders → blinking)
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession }                               from 'next-auth/react'
import { useSearchParams, useRouter }               from 'next/navigation'
import Link                                         from 'next/link'
import { COMPANY }                                  from '../../lib/constants'

const PLANS = [
  {
    id: 'FREE', name: 'Free', price: '$0', per: 'forever',
    desc: 'Try before you commit.',
    border: 'border-[#2a2f3e]',
    btnClass: 'border border-[#2a2f3e] text-[#8892a4] hover:bg-[#2a2f3e]/30',
    features: [
      { ok: true,  text: '2 free preview lessons' },
      { ok: true,  text: 'Limited AI agent (5 q/day)' },
      { ok: false, text: 'All video lessons' },
      { ok: false, text: 'Completion certificate' },
      { ok: false, text: 'Live weekly sessions' },
    ],
  },
  {
    id: 'BASIC', name: 'Basic', price: '$12', per: '/ month',
    desc: 'Full course access + unlimited AI.',
    border: 'border-[#534AB7]', popular: true,
    btnClass: 'bg-[#534AB7] text-[#EEEDFE] hover:opacity-90',
    features: [
      { ok: true,  text: 'All courses & lessons' },
      { ok: true,  text: 'Unlimited AI doubt agent' },
      { ok: true,  text: 'In-browser progress tracking' },
      { ok: true,  text: 'Completion certificate' },
      { ok: false, text: 'Live weekly sessions' },
    ],
  },
  {
    id: 'PRO', name: 'Pro', price: '$39', per: '/ month',
    desc: 'Everything in Basic + live classes.',
    border: 'border-[#2a2f3e]',
    btnClass: 'border border-[#534AB7]/50 text-[#7f77dd] hover:bg-[#534AB7]/10',
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
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [loadingPlan, setLoadingPlan] = useState(null)
  const [confirming, setConfirming]   = useState(false)
  const [message, setMessage]         = useState(null)
  const [realPlan, setRealPlan]       = useState(null)

  // ── FIX: useRef prevents confirmation from running more than once ─────────
  const hasConfirmed = useRef(false)

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

  // ── Handle Stripe redirect ────────────────────────────────────────────────
  useEffect(() => {
    const success         = searchParams.get('success')
    const cancelled       = searchParams.get('cancelled')
    const plan            = searchParams.get('plan')
    const stripeSessionId = searchParams.get('session_id')

    if (cancelled === 'true') {
      setMessage({ type: 'cancelled' })
      // ── Clean URL so it doesn't show on refresh ──────────────────────
      router.replace('/upgrade')
      return
    }

    // ── FIX: Only run confirmation once using the ref ─────────────────────
    if (success === 'true' && plan && stripeSessionId && !hasConfirmed.current) {
      hasConfirmed.current = true   // lock so it never runs again
      setConfirming(true)

      fetch('/api/stripe/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ stripeSessionId, plan }),
      })
        .then((r) => r.json())
        .then(async (data) => {
          if (data.ok) {
            setRealPlan(plan)
            setMessage({ type: 'success', plan })
            // ── FIX: Clean URL params so page stops blinking on re-render ─
            router.replace('/upgrade')
          } else {
            setMessage({ type: 'error', text: data.error || 'Could not confirm payment' })
            router.replace('/upgrade')
          }
        })
        .catch(() => {
          setMessage({ type: 'error', text: 'Network error — please try again' })
          router.replace('/upgrade')
        })
        .finally(() => setConfirming(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // ── FIX: Empty deps [] = runs exactly ONCE on mount, never again ──

  async function handleSubscribe(planId) {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !session) {
      router.push('/login?callbackUrl=/upgrade')
      return
    }
    if (planId === 'FREE') return

    setLoadingPlan(planId)
    setMessage(null)

    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId }),
      })
      const data = await res.json()

      if (data.demo) { setMessage({ type: 'demo' }); setLoadingPlan(null); return }
      if (data.url)  { window.location.href = data.url; return }

      setMessage({ type: 'error', text: data.error || 'Something went wrong' })
      setLoadingPlan(null)
    } catch {
      setMessage({ type: 'error', text: 'Network error — please try again' })
      setLoadingPlan(null)
    }
  }

  // ── Show spinner only while confirming payment ────────────────────────────
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
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = realPlan || session?.user?.plan || 'FREE'

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">

      {/* Navbar */}
      <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium">{COMPANY.product}</span>
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <Link href="/dashboard" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">
              ← Dashboard
            </Link>
          )}
          {session && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              currentPlan === 'PRO'   ? 'bg-[#1e2a1e] text-[#1D9E75]' :
              currentPlan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
              'bg-[#2a2f3e] text-[#8892a4]'
            }`}>
              {currentPlan} plan
            </span>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Pricing</p>
          <h1 className="text-3xl font-medium tracking-tight mb-3">Simple, honest pricing</h1>
          <p className="text-sm text-[#8892a4]">Cancel anytime. No hidden fees. Payments secured by Stripe.</p>
          {session && (
            <p className="text-xs text-[#5a6278] mt-2">
              Logged in as <span className="text-[#c8d0e0]">{session.user.email}</span> —{' '}
              <span className="text-[#7f77dd] font-medium">{currentPlan}</span> plan
            </p>
          )}
        </div>

        {/* Messages — stable, no blinking */}
        {message?.type === 'success' && (
          <div className="mb-8 bg-[#1e2a1e] border border-[#1D9E75]/50 rounded-xl p-6 text-center">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-base font-medium text-[#1D9E75] mb-1">
              Payment confirmed! You are now on the {message.plan} plan.
            </p>
            <p className="text-xs text-[#8892a4] mb-5">
              Your access has been upgraded. All {message.plan} content is now unlocked.
            </p>
            <Link href="/dashboard"
              className="inline-block bg-[#1D9E75] text-white text-sm font-medium px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
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
          <div className="mb-6 bg-[#1e2a22] border border-[#BA7517]/40 rounded-xl p-5">
            <p className="text-sm font-medium text-[#BA7517] mb-2">⚠ Stripe not configured yet</p>
            <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] text-[#c8d0e0] space-y-1">
              <p>STRIPE_SECRET_KEY=sk_test_xxxx</p>
              <p>STRIPE_PRICE_BASIC=price_xxxx</p>
              <p>STRIPE_PRICE_PRO=price_xxxx</p>
              <p>STRIPE_WEBHOOK_SECRET=whsec_xxxx</p>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const isLoading = loadingPlan === plan.id

            return (
              <div key={plan.id}
                className={`bg-[#161b27] rounded-xl p-6 relative border-2 ${plan.border}`}>

                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#534AB7] text-[#EEEDFE] text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    Most popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-[#1D9E75] text-white text-[10px] font-medium px-3 py-1 rounded-full">
                    ✓ Current plan
                  </div>
                )}

                <p className="text-xs text-[#8892a4] mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-medium">{plan.price}</span>
                  <span className="text-xs text-[#5a6278]">{plan.per}</span>
                </div>
                <p className="text-[11px] text-[#8892a4] mb-5 leading-relaxed">{plan.desc}</p>
                <hr className="border-[#2a2f3e] mb-4" />

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-[11px]">
                      {f.ok ? (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#2a2f3e]/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] text-[#5a6278]">✕</span>
                      )}
                      <span className={f.ok ? 'text-[#8892a4]' : 'text-[#5a6278]/60'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'FREE' ? (
                  <Link href={session ? '/dashboard' : '/login'}
                    className="block w-full text-center text-xs font-medium py-2.5 rounded-lg border border-[#2a2f3e] text-[#8892a4] hover:bg-[#2a2f3e]/30 transition-colors">
                    {session ? 'Go to dashboard' : 'Get started free'}
                  </Link>
                ) : isCurrent ? (
                  <button disabled
                    className="w-full text-xs font-medium py-2.5 rounded-lg bg-[#1D9E75]/20 text-[#1D9E75] cursor-default">
                    ✓ Active plan
                  </button>
                ) : (
                  <button onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full text-xs font-medium py-2.5 rounded-lg transition-all ${plan.btnClass} disabled:opacity-60`}>
                    {isLoading ? '⏳ Redirecting to Stripe...' : `Subscribe — ${plan.price}/mo`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-[#5a6278] flex-wrap">
          <span>🔒 Secured by Stripe</span>
          <span>·</span><span>Cancel anytime</span>
          <span>·</span><span>No hidden fees</span>
          <span>·</span><span>Receipts by email</span>
        </div>
      </div>
    </div>
  )
}
