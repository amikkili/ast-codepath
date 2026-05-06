'use client'
// app/pricing/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Pricing page with real Stripe checkout buttons.
// Logged-in users are sent to Stripe to complete payment.
// Non-logged-in users are sent to /login first.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { COMPANY, PLANS } from '../../lib/constants'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)

  async function subscribe(planId) {
    if (!session) { router.push('/login?tab=signup'); return }
    if (session.user.plan === planId) return

    setLoading(planId)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
    } catch {
      alert('Could not connect to payment system. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Could not open billing portal.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-[10px] text-[#534AB7] uppercase tracking-widest text-center mb-2">Pricing</p>
        <h1 className="text-2xl font-medium text-[#e2e8f0] text-center mb-2">
          Simple, honest pricing
        </h1>
        <p className="text-sm text-[#8892a4] text-center mb-10">
          Cancel anytime. No hidden fees. 7-day money-back guarantee.
        </p>

        {/* Current plan banner for logged-in users */}
        {session && (
          <div className="bg-[#161b27] border border-[#534AB7]/30 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e2e8f0]">
                Your current plan: <span className="text-[#7f77dd]">{session.user.plan}</span>
              </p>
              <p className="text-xs text-[#5a6278] mt-0.5">
                {session.user.plan === 'FREE'
                  ? 'Upgrade to unlock all lessons and the full AI doubt agent.'
                  : 'Manage your subscription, update payment method, or cancel below.'}
              </p>
            </div>
            {session.user.plan !== 'FREE' && (
              <button onClick={openPortal} disabled={portalLoading}
                className="text-xs text-[#7f77dd] border border-[#534AB7]/50 px-4 py-2 rounded-lg hover:bg-[#534AB7]/10 transition-colors disabled:opacity-50">
                {portalLoading ? 'Opening...' : 'Manage billing'}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = session?.user?.plan === plan.id
            const isLoading = loading === plan.id

            return (
              <div key={plan.id}
                className={`bg-[#161b27] rounded-xl p-6 relative flex flex-col ${
                  plan.popular ? 'border-2 border-[#534AB7]' : 'border border-[#2a2f3e]'
                }`}>

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#534AB7] text-[#EEEDFE] text-[10px] font-medium px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-[#1D9E75] text-[#E1F5EE] text-[10px] font-medium px-3 py-1 rounded-full">
                    Your plan
                  </div>
                )}

                <p className="text-xs text-[#8892a4] mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-medium text-[#e2e8f0]">${plan.price}</span>
                  <span className="text-xs text-[#8892a4]">{plan.per}</span>
                </div>
                <p className="text-[11px] text-[#8892a4] mb-4 leading-relaxed">{plan.desc}</p>
                <hr className="border-[#2a2f3e] mb-4" />

                <ul className="space-y-2.5 mb-6 flex-1">
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
                    {session ? 'Go to dashboard' : 'Start free'}
                  </Link>
                ) : (
                  <button
                    onClick={() => subscribe(plan.id)}
                    disabled={isCurrent || isLoading}
                    className={`w-full text-xs font-medium py-2.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-[#1e2a1e] text-[#1D9E75] cursor-default border border-[#1D9E75]/30'
                        : plan.popular
                        ? 'bg-[#534AB7] text-[#EEEDFE] hover:opacity-90'
                        : 'border border-[#534AB7]/50 text-[#7f77dd] hover:bg-[#534AB7]/10'
                    } disabled:opacity-60`}>
                    {isCurrent ? 'Current plan' : isLoading ? 'Redirecting to Stripe...' : plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {[
            { icon: '🔒', label: 'Secured by Stripe' },
            { icon: '↩', label: '7-day money back' },
            { icon: '✕', label: 'Cancel anytime' },
            { icon: '🔐', label: 'SSL encrypted' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[11px] text-[#5a6278]">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#5a6278] mt-6">
          Questions? Contact us at{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-[#7f77dd] hover:underline">
            {COMPANY.email}
          </a>{' '}
          or call {COMPANY.phone}
        </p>

        <div className="flex justify-center gap-4 mt-3">
          <Link href="/privacy" className="text-[11px] text-[#5a6278] hover:text-[#8892a4] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[11px] text-[#5a6278] hover:text-[#8892a4] transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
