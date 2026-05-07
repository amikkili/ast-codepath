'use client'
// app/forgot-password/page.js  ← NEW FILE
import { useState }    from 'react'
import Link            from 'next/link'
import { COMPANY }     from '../../lib/constants'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
      setSent(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <nav className="h-14 border-b border-[#2a2f3e] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium text-[#e2e8f0]">{COMPANY.product}</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-[11px] text-[#5a6278]">{COMPANY.name}</p>
            <h1 className="text-xl font-medium text-[#e2e8f0] mt-1">Reset your password</h1>
          </div>

          {sent ? (
            <div className="bg-[#1e2a1e] border border-[#1D9E75]/50 rounded-xl p-6 text-center">
              <p className="text-2xl mb-3">📧</p>
              <p className="text-sm font-medium text-[#1D9E75] mb-2">Check your email</p>
              <p className="text-xs text-[#8892a4] leading-relaxed">
                We sent a password reset link to <strong className="text-[#c8d0e0]">{email}</strong>.
                The link expires in 30 minutes.
              </p>
              <p className="text-[11px] text-[#5a6278] mt-3">
                Did not receive it? Check spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-[#534AB7] hover:underline">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6">
              <p className="text-xs text-[#8892a4] mb-4 leading-relaxed">
                Enter the email you used to sign up. We will send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-400 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] text-[#8892a4] block mb-1">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#534AB7] text-[#EEEDFE] text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </div>
          )}

          <p className="text-[11px] text-[#5a6278] text-center mt-4">
            Remember your password?{' '}
            <Link href="/login" className="text-[#534AB7] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
