'use client'
// app/profile/page.js  ← REPLACE or CREATE this file
// Student profile — update name, change password, view plan, certificates

import { useEffect, useState } from 'react'
import { useSession }          from 'next-auth/react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [plan, setPlan]       = useState('FREE')
  const [certs, setCerts]     = useState([])
  const [loading, setLoading] = useState(true)

  // Name form
  const [nameMsg, setNameMsg]       = useState('')
  const [nameLoading, setNameLoad]  = useState(false)

  // Password form
  const [oldPass, setOldPass]       = useState('')
  const [newPass, setNewPass]       = useState('')
  const [confPass, setConfPass]     = useState('')
  const [passMsg, setPassMsg]       = useState({ text: '', ok: false })
  const [passLoading, setPassLoad]  = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Load data
  useEffect(() => {
    if (status !== 'authenticated') return
    setName(session.user.name  || '')
    setEmail(session.user.email || '')

    Promise.all([
      fetch('/api/user/plan').then(r => r.json()),
      fetch('/api/certificate').then(r => r.json()),
    ]).then(([planData, certData]) => {
      setPlan(planData.plan || 'FREE')
      setCerts(certData.certificates || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [status, session])

  async function saveName(e) {
    e.preventDefault()
    setNameLoad(true)
    setNameMsg('')
    const res  = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    setNameLoad(false)
    if (res.ok) { setNameMsg('Name updated successfully!'); await update() }
    else setNameMsg(data.error || 'Update failed')
  }

  async function savePassword(e) {
    e.preventDefault()
    setPassMsg({ text: '', ok: false })
    if (newPass !== confPass) { setPassMsg({ text: 'Passwords do not match', ok: false }); return }
    if (newPass.length < 6)   { setPassMsg({ text: 'Password must be at least 6 characters', ok: false }); return }
    setPassLoad(true)
    const res  = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass }),
    })
    const data = await res.json()
    setPassLoad(false)
    if (res.ok) {
      setPassMsg({ text: 'Password updated successfully!', ok: true })
      setOldPass(''); setNewPass(''); setConfPass('')
    } else {
      setPassMsg({ text: data.error || 'Update failed', ok: false })
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
            <span className="text-[15px] font-medium text-[#e2e8f0]">CodePath</span>
          </Link>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
          <div className="h-3 bg-[#2a2f3e] rounded w-32 mb-2" />
          <div className="h-7 bg-[#2a2f3e] rounded w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl h-48" />
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl h-44" />
              <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl h-56" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const planColor = plan === 'PRO'   ? 'text-[#1D9E75] bg-[#1e2a1e]' :
                    plan === 'BASIC' ? 'text-[#7f77dd] bg-[#1e1e2a]' :
                                      'text-[#8892a4] bg-[#2a2f3e]'

  const inputCls = 'w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60 transition-colors'
  const labelCls = 'text-[11px] text-[#8892a4] block mb-1.5 font-medium'

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">

      {/* Minimal navbar */}
      <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium">CodePath</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">Anil Software Technologies</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">My Profile</h1>
          <p className="text-xs text-[#8892a4] mt-1">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left column: avatar + plan + certs ── */}
          <div className="flex flex-col gap-4">

            {/* Avatar card */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#534AB7] to-[#1D9E75] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {name.charAt(0).toUpperCase() || 'S'}
              </div>
              <p className="text-sm font-medium text-[#e2e8f0] mb-0.5">{name}</p>
              <p className="text-[11px] text-[#5a6278]">{email}</p>
              <span className={`inline-block mt-2 text-[10px] font-medium px-3 py-1 rounded-full ${planColor}`}>
                {plan} Plan
              </span>
            </div>

            {/* Subscription card */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-2">Subscription</p>
              <p className={`text-lg font-medium mb-1 ${plan === 'PRO' ? 'text-[#1D9E75]' : plan === 'BASIC' ? 'text-[#7f77dd]' : 'text-[#8892a4]'}`}>
                {plan} Plan
              </p>
              {plan === 'FREE' && (
                <Link href="/upgrade" className="inline-block mt-1 text-xs bg-[#534AB7] text-[#EEEDFE] font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  Upgrade now →
                </Link>
              )}
              {plan === 'BASIC' && (
                <Link href="/upgrade" className="inline-block mt-1 text-xs bg-[#1D9E75] text-white font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  Upgrade to Pro →
                </Link>
              )}
              {plan === 'PRO' && (
                <p className="text-[11px] text-[#5a6278] mt-1">Full access to all features.</p>
              )}
            </div>

            {/* Certificates */}
            {certs.length > 0 && (
              <div className="bg-[#161b27] border border-[#1D9E75]/20 rounded-xl p-4">
                <p className="text-[11px] text-[#5a6278] mb-3">🏆 Certificates earned</p>
                {certs.map(cert => (
                  <div key={cert.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-none border-[#2a2f3e]">
                    <p className="text-xs font-medium text-[#c8d0e0]">{cert.courseName}</p>
                    <p className="text-[10px] text-[#5a6278] mt-0.5">
                      {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {certs.length === 0 && (
              <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">🏆</p>
                <p className="text-xs text-[#5a6278]">Complete a course to earn your first certificate</p>
              </div>
            )}
          </div>

          {/* ── Right column: forms ── */}
          <div className="md:col-span-2 flex flex-col gap-5">

            {/* Update name */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-5">Personal information</h2>
              <form onSubmit={saveName} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <input type="email" value={email} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
                  <p className="text-[10px] text-[#5a6278] mt-1">Email cannot be changed.</p>
                </div>
                {nameMsg && (
                  <p className={`text-xs ${nameMsg.includes('success') ? 'text-[#1D9E75]' : 'text-red-400'}`}>{nameMsg}</p>
                )}
                <button type="submit" disabled={nameLoading}
                  className="self-start bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {nameLoading ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-5">Change password</h2>
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
                  <input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="Repeat new password" required className={inputCls} />
                </div>
                {passMsg.text && (
                  <p className={`text-xs ${passMsg.ok ? 'text-[#1D9E75]' : 'text-red-400'}`}>{passMsg.text}</p>
                )}
                <button type="submit" disabled={passLoading}
                  className="self-start bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {passLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>

            {/* Quick links */}
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Quick links</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/dashboard', label: '📊 Dashboard'    },
                  { href: '/upgrade',   label: '⬆ Upgrade plan'  },
                  { href: '/contact',   label: '💬 Contact us'    },
                  { href: '/about',     label: 'ℹ About us'       },
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
