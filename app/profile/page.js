'use client'
// app/profile/page.js  ← NEW FILE
import { useEffect, useState } from 'react'
import { useSession }          from 'next-auth/react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import Navbar                  from '../../components/Navbar'
import { COMPANY }             from '../../lib/constants'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [realPlan, setPlan]   = useState(null)
  const [certs, setCerts]     = useState([])
  const [nameLoading, setNameLoading]   = useState(false)
  const [nameMsg, setNameMsg]           = useState('')
  const [oldPass, setOldPass]           = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirmPass]   = useState('')
  const [passLoading, setPassLoading]   = useState(false)
  const [passMsg, setPassMsg]           = useState({ text: '', ok: false })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setName(session.user.name || '')
    setEmail(session.user.email || '')
    Promise.all([
      fetch('/api/user/plan').then(r => r.json()),
      fetch('/api/certificate').then(r => r.json()),
    ]).then(([planData, certData]) => {
      setPlan(planData.plan || 'FREE')
      setCerts(certData.certificates || [])
    })
  }, [status, session])

  async function saveName(e) {
    e.preventDefault()
    setNameLoading(true)
    setNameMsg('')
    const res  = await fetch('/api/user/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    setNameLoading(false)
    if (res.ok) { setNameMsg('Name updated!'); await update() }
    else setNameMsg(data.error || 'Failed to update')
  }

  async function savePassword(e) {
    e.preventDefault()
    setPassMsg({ text: '', ok: false })
    if (newPass !== confirmPass) { setPassMsg({ text: 'Passwords do not match', ok: false }); return }
    if (newPass.length < 6) { setPassMsg({ text: 'Password must be at least 6 characters', ok: false }); return }
    setPassLoading(true)
    const res  = await fetch('/api/user/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass }),
    })
    const data = await res.json()
    setPassLoading(false)
    if (res.ok) {
      setPassMsg({ text: 'Password updated successfully!', ok: true })
      setOldPass(''); setNewPass(''); setConfirmPass('')
    } else {
      setPassMsg({ text: data.error || 'Failed to update', ok: false })
    }
  }

  if (status === 'loading' || !realPlan) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <Navbar />
        <ProfileSkeleton />
      </div>
    )
  }

  const plan = realPlan || session?.user?.plan || 'FREE'
  const planColor = plan === 'PRO' ? 'text-[#1D9E75] bg-[#1e2a1e]' : plan === 'BASIC' ? 'text-[#7f77dd] bg-[#1e1e2a]' : 'text-[#8892a4] bg-[#2a2f3e]'
  const inputCls  = 'w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60 transition-colors'
  const labelCls  = 'text-[11px] text-[#8892a4] block mb-1.5 font-medium'

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">{COMPANY.name}</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">My Profile</h1>
          <p className="text-xs text-[#8892a4] mt-1">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left: avatar + plan */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#534AB7] to-[#1D9E75] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {(name || session?.user?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-[#e2e8f0]">{name || session?.user?.name}</p>
              <p className="text-[11px] text-[#5a6278] mt-0.5">{email}</p>
              <span className={`inline-block mt-2 text-[10px] font-medium px-3 py-1 rounded-full ${planColor}`}>
                {plan} Plan
              </span>
            </div>

            {/* Plan card */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-2">Current subscription</p>
              <p className={`text-lg font-medium ${plan === 'PRO' ? 'text-[#1D9E75]' : plan === 'BASIC' ? 'text-[#7f77dd]' : 'text-[#8892a4]'}`}>
                {plan} Plan
              </p>
              {plan !== 'PRO' && (
                <Link href="/upgrade" className="inline-block mt-3 text-xs bg-[#534AB7] text-[#EEEDFE] font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  Upgrade plan →
                </Link>
              )}
              {plan === 'PRO' && (
                <p className="text-[11px] text-[#5a6278] mt-2">You have full access to all features.</p>
              )}
            </div>

            {/* Certificates */}
            {certs.length > 0 && (
              <div className="bg-[#161b27] border border-[#1D9E75]/20 rounded-xl p-4">
                <p className="text-[11px] text-[#5a6278] mb-3">🏆 Certificates ({certs.length})</p>
                {certs.map(cert => (
                  <div key={cert.id} className="mb-2 last:mb-0">
                    <p className="text-xs text-[#c8d0e0] font-medium">{cert.courseName}</p>
                    <p className="text-[10px] text-[#5a6278]">{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: forms */}
          <div className="md:col-span-2 flex flex-col gap-5">

            {/* Update name */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Personal information</h2>
              <form onSubmit={saveName} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <input type="email" value={email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
                  <p className="text-[10px] text-[#5a6278] mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>
                {nameMsg && <p className="text-xs text-[#1D9E75]">{nameMsg}</p>}
                <button type="submit" disabled={nameLoading}
                  className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity self-start px-5">
                  {nameLoading ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Change password</h2>
              <form onSubmit={savePassword} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Current password</label>
                  <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>New password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="At least 6 characters" required minLength={6} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm new password</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" required className={inputCls} />
                </div>
                {passMsg.text && <p className={`text-xs ${passMsg.ok ? 'text-[#1D9E75]' : 'text-red-400'}`}>{passMsg.text}</p>}
                <button type="submit" disabled={passLoading}
                  className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity self-start px-5">
                  {passLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>

            {/* Quick links */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Quick links</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/dashboard',     label: '📊 Dashboard' },
                  { href: '/upgrade',       label: '⬆ Upgrade plan' },
                  { href: '/contact',       label: '💬 Contact support' },
                  { href: '/about',         label: 'ℹ About us' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href}
                    className="text-xs text-[#8892a4] hover:text-[#c8d0e0] bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-center hover:border-[#534AB7]/40 transition-all">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-5 bg-[#2a2f3e] rounded w-32 mb-2" />
      <div className="h-7 bg-[#2a2f3e] rounded w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 h-48" />
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 h-48" />
          <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 h-56" />
        </div>
      </div>
    </div>
  )
}
