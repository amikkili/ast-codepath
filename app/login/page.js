'use client'
// app/login/page.js  ← REPLACE existing file
// ADDED: "Forgot password?" link below the sign in form
import { useState, useEffect } from 'react'
import { signIn }              from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link                    from 'next/link'
import { COMPANY }             from '../../lib/constants'

export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const [tab, setTab]       = useState('login')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [err, setErr]       = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.get('tab') === 'signup') setTab('signup')
  }, [params])

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)

    if (tab === 'signup') {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password: pass }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Sign up failed'); setLoading(false); return }
    }

    const result = await signIn('credentials', {
      email, password: pass, redirect: false,
    })

    setLoading(false)
    if (result?.error) { setErr('Invalid email or password'); return }

    const callbackUrl = params.get('callbackUrl') || '/dashboard'
    router.push(callbackUrl)
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <nav className="h-14 border-b border-[#2a2f3e] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium text-[#e2e8f0]">{COMPANY.product}</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-[11px] text-[#5a6278]">{COMPANY.name}</p>
            <h1 className="text-xl font-medium text-[#e2e8f0] mt-1">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
          </div>

          <div className="flex bg-[#161b27] border border-[#2a2f3e] rounded-xl p-1 mb-5">
            {['login', 'signup'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setErr('') }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  tab === t ? 'bg-[#534AB7] text-[#EEEDFE]' : 'text-[#8892a4] hover:text-[#c8d0e0]'
                }`}>
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 flex flex-col gap-4">
            {err && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-400">
                {err}
              </div>
            )}

            {tab === 'signup' && (
              <div>
                <label className="text-[11px] text-[#8892a4] block mb-1">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name" required
                  className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
              </div>
            )}

            <div>
              <label className="text-[11px] text-[#8892a4] block mb-1">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-[#8892a4]">Password</label>
                {/* ── ADDED: Forgot password link ── */}
                {tab === 'login' && (
                  <Link href="/forgot-password"
                    className="text-[11px] text-[#534AB7] hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#534AB7] text-[#EEEDFE] text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create free account'}
            </button>

            {tab === 'login' && (
              <p className="text-[11px] text-[#8892a4] text-center">
                No account?{' '}
                <button type="button" onClick={() => setTab('signup')} className="text-[#7f77dd] hover:underline">
                  Sign up free
                </button>
              </p>
            )}
          </form>

          <p className="text-[10px] text-[#5a6278] text-center mt-4">
            By continuing you agree to our{' '}
            <Link href="/terms" className="text-[#534AB7] hover:underline">Terms</Link>
            {' '}&{' '}
            <Link href="/privacy" className="text-[#534AB7] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
