'use client'
// app/reset-password/page.js  ← NEW FILE
import { useState }           from 'react'
import { useSearchParams }    from 'next/navigation'
import Link                   from 'next/link'
import { COMPANY }            from '../../lib/constants'

export default function ResetPasswordPage() {
  const searchParams       = useSearchParams()
  const token              = searchParams.get('token')
  const [pass, setPass]    = useState('')
  const [confirm, setConf] = useState('')
  const [loading, setLoad] = useState(false)
  const [done, setDone]    = useState(false)
  const [error, setError]  = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (pass.length < 6) { setError('Password must be at least 6 characters'); return }
    if (pass !== confirm) { setError('Passwords do not match'); return }

    setLoad(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password: pass }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'Reset failed'); setLoad(false); return }
      setDone(true)
    } catch {
      setError('Network error — please try again')
      setLoad(false)
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
            <h1 className="text-xl font-medium text-[#e2e8f0] mt-1">Set new password</h1>
          </div>

          {!token ? (
            <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-6 text-center">
              <p className="text-sm text-red-400 mb-2">Invalid reset link</p>
              <p className="text-xs text-[#8892a4]">This link is missing a token. Please request a new reset link.</p>
              <Link href="/forgot-password"
                className="inline-block mt-4 text-xs text-[#534AB7] hover:underline">
                Request new link →
              </Link>
            </div>
          ) : done ? (
            <div className="bg-[#1e2a1e] border border-[#1D9E75]/50 rounded-xl p-6 text-center">
              <p className="text-2xl mb-3">✅</p>
              <p className="text-sm font-medium text-[#1D9E75] mb-2">Password updated!</p>
              <p className="text-xs text-[#8892a4] mb-4">You can now sign in with your new password.</p>
              <Link href="/login"
                className="inline-block bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90">
                Sign in now →
              </Link>
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6">
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-400 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] text-[#8892a4] block mb-1">New password</label>
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                    placeholder="At least 6 characters" required minLength={6}
                    className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
                </div>
                <div>
                  <label className="text-[11px] text-[#8892a4] block mb-1">Confirm new password</label>
                  <input type="password" value={confirm} onChange={(e) => setConf(e.target.value)}
                    placeholder="Repeat the password" required
                    className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#534AB7] text-[#EEEDFE] text-sm font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
