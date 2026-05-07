'use client'
// app/upgrade/page.js  ← REPLACE your existing upgrade/page.js with this
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Added proper session loading state handling so clicking Subscribe
//      does NOT redirect to login when user is already logged in.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useSession }          from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { COMPANY } from '../../lib/constants'

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    per: 'forever',
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
    id: 'BASIC',
    name: 'Basic',
    price: '$12',
    per: '/ month',
    desc: 'Full course access + unlimited AI.',
    border: 'border-[#534AB7]',
    popular: true,
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
    id: 'PRO',
    name: 'Pro',
    price: '$39',
    per: '/ month',
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
  // ── FIX: destructure "status" so we know when session is still loading ──
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [loadingPlan, setLoadingPlan] = useState(null)
  const [message, setMessage]         = useState(null)

  // Handle Stripe redirect back after payment
  useEffect(() => {
    const success   = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')
    const plan      = searchParams.get('plan')

    if (success === 'true' && plan) {
      setMessage({ type: 'success', plan })
      update() // refresh session so plan badge updates in navbar
    }
    if (cancelled === 'true') {
      setMessage({ type: 'cancelled' })
    }
  }, [searchParams, update])

  async function handleSubscribe(planId) {
    // ── FIX 1: Wait for session to finish loading before checking ─────────
    if (status === 'loading') return

    // ── FIX 2: Only redirect to login if confirmed NOT authenticated ──────
    if (status === 'unauthenticated' || !session) {
      // Save intended plan so we can return here after login
      router.push(`/login?callbackUrl=/upgrade&plan=${planId}`)
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

      if (data.demo) {
        setMessage({ type: 'demo' })
        setLoadingPlan(null)
        return
      }

      if (data.url) {
        // Redirect to Stripe payment page
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' })
        setLoadingPlan(null)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — please try again' })
      setLoadingPlan(null)
    }
  }

  const currentPlan = session?.user?.plan || 'FREE'

  // ── FIX 3: Show loading spinner while session is being fetched ───────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#5a6278]">Loading your account...</p>
        </div>
      </div>
    )
  }

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
          {/* Show current plan in navbar */}
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

        {/* Page header */}
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

        {/* Messages */}
        {message?.type === 'success' && (
          <div className="mb-8 bg-[#1e2a1e] border border-[#1D9E75]/50 rounded-xl p-5 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-medium text-[#1D9E75]">
              Payment successful! You are now on the {message.plan} plan.
            </p>
            <p className="text-xs text-[#8892a4] mt-1">
              Your access has been upgraded. Start watching all lessons now.
            </p>
            <Link href="/dashboard"
              className="inline-block mt-3 bg-[#1D9E75] text-white text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Go to dashboard →
            </Link>
          </div>
        )}

        {message?.type === 'cancelled' && (
          <div className="mb-6 bg-[#2a2f3e]/40 border border-[#2a2f3e] rounded-xl p-4 text-center">
            <p className="text-sm text-[#8892a4]">Payment cancelled. No charge was made.</p>
          </div>
        )}

        {message?.type === 'demo' && (
          <div className="mb-6 bg-[#1e2a22] border border-[#BA7517]/40 rounded-xl p-5">
            <p className="text-sm font-medium text-[#BA7517] mb-2">⚠ Stripe not configured yet</p>
            <p className="text-xs text-[#8892a4] leading-relaxed mb-3">
              Add these 5 environment variables in your Render dashboard to enable payments:
            </p>
            <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] text-[#c8d0e0] space-y-1">
              <p>STRIPE_SECRET_KEY=sk_test_xxxx</p>
              <p>STRIPE_PUBLISHABLE_KEY=pk_test_xxxx</p>
              <p>STRIPE_PRICE_BASIC=price_xxxx</p>
              <p>STRIPE_PRICE_PRO=price_xxxx</p>
              <p>STRIPE_WEBHOOK_SECRET=whsec_xxxx</p>
            </div>
          </div>
        )}

        {message?.type === 'error' && (
          <div className="mb-6 bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
            <p className="text-xs text-red-400">{message.text}</p>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent  = currentPlan === plan.id
            const isLoading  = loadingPlan === plan.id
            const isUpgrade  = ['FREE','BASIC','PRO'].indexOf(plan.id) > ['FREE','BASIC','PRO'].indexOf(currentPlan)

            return (
              <div key={plan.id}
                className={`bg-[#161b27] rounded-xl p-6 relative border-2 ${plan.border} transition-all`}>

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

                {/* Button logic */}
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
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full text-xs font-medium py-2.5 rounded-lg transition-all ${plan.btnClass} disabled:opacity-60 disabled:cursor-wait`}>
                    {isLoading
                      ? '⏳ Redirecting to Stripe...'
                      : `Subscribe — ${plan.price}/mo`
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-[#5a6278] flex-wrap">
          <span>🔒 Secured by Stripe</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>No hidden fees</span>
          <span>·</span>
          <span>Receipts by email</span>
        </div>

        {/* Admin Stripe setup guide */}
        {session?.user?.role === 'ADMIN' && (
          <details className="mt-10 bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
            <summary className="text-sm font-medium text-[#e2e8f0] cursor-pointer">
              Admin: Stripe setup guide — click to expand
            </summary>
            <div className="mt-4 space-y-4 text-xs text-[#8892a4] leading-relaxed">
              <div>
                <p className="text-[#c8d0e0] font-medium mb-1">Step 1 — Create products in Stripe</p>
                <p>Stripe Dashboard → Product catalog → Add product:</p>
                <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] mt-2 space-y-1">
                  <p>Product 1: "Basic Plan" → Recurring → $12/month → copy Price ID</p>
                  <p>Product 2: "Pro Plan"   → Recurring → $39/month → copy Price ID</p>
                </div>
              </div>
              <div>
                <p className="text-[#c8d0e0] font-medium mb-1">Step 2 — Get API keys</p>
                <p>Stripe → Developers → API Keys → copy Publishable key + Secret key</p>
              </div>
              <div>
                <p className="text-[#c8d0e0] font-medium mb-1">Step 3 — Create webhook</p>
                <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] mt-2 space-y-1">
                  <p>URL: https://www.anilsofttech.com/api/stripe/webhook</p>
                  <p>Events: checkout.session.completed</p>
                  <p>         customer.subscription.deleted</p>
                  <p>         invoice.payment_failed</p>
                </div>
                <p className="mt-1">Copy the Signing secret (whsec_...)</p>
              </div>
              <div>
                <p className="text-[#c8d0e0] font-medium mb-1">Step 4 — Add to Render environment</p>
                <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] mt-2 space-y-1">
                  <p>STRIPE_SECRET_KEY=sk_test_xxx</p>
                  <p>STRIPE_PUBLISHABLE_KEY=pk_test_xxx</p>
                  <p>STRIPE_PRICE_BASIC=price_xxx</p>
                  <p>STRIPE_PRICE_PRO=price_xxx</p>
                  <p>STRIPE_WEBHOOK_SECRET=whsec_xxx</p>
                </div>
              </div>
              <div>
                <p className="text-[#c8d0e0] font-medium mb-1">Test card (no real money)</p>
                <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg p-3 font-mono text-[11px] mt-2 space-y-1">
                  <p>Card: 4242 4242 4242 4242</p>
                  <p>Expiry: 12/34  CVC: 123</p>
                </div>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
