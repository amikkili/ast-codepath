'use client'
// app/admin/students/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Admin page to: view all students, create new accounts, upgrade/downgrade
// plans, and delete students. Only accessible to users with role = ADMIN.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { COMPANY } from '../../../lib/constants'

const PLAN_COLORS = {
  FREE:  'bg-[#2a2f3e] text-[#8892a4]',
  BASIC: 'bg-[#1e1e2a] text-[#7f77dd]',
  PRO:   'bg-[#1e2a1e] text-[#1D9E75]',
}

const PLANS = ['FREE', 'BASIC', 'PRO']

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState({ msg: '', type: '' })
  const [search, setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)

  // New student form state
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'BASIC' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && session.user.role !== 'ADMIN') { router.push('/dashboard'); return }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') loadStudents()
  }, [status, session])

  async function loadStudents() {
    setLoading(true)
    const res  = await fetch('/api/admin/students')
    const data = await res.json()
    setStudents(data.students || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 3500)
  }

  async function changePlan(id, plan) {
    const res = await fetch(`/api/admin/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, plan } : s))
      showToast(`Plan updated to ${plan}`)
    } else {
      showToast('Failed to update plan', 'error')
    }
  }

  async function deleteStudent(id, name) {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== id))
      showToast(`${name} removed`)
    } else {
      const d = await res.json()
      showToast(d.error || 'Delete failed', 'error')
    }
  }

  async function createStudent(e) {
    e.preventDefault()
    setFormLoading(true)
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setFormLoading(false)
    if (res.ok) {
      await loadStudents()
      setForm({ name: '', email: '', password: '', plan: 'BASIC' })
      setShowForm(false)
      showToast(`Account created for ${form.name}`)
    } else {
      const d = await res.json()
      showToast(d.error || 'Failed to create account', 'error')
    }
  }

  const filtered = students.filter((s) => {
    const matchPlan   = planFilter === 'ALL' || s.plan === planFilter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.email.toLowerCase().includes(search.toLowerCase())
    return matchPlan && matchSearch
  })

  // Summary counts
  const counts = { ALL: students.length, FREE: 0, BASIC: 0, PRO: 0 }
  students.forEach((s) => { counts[s.plan] = (counts[s.plan] || 0) + 1 })

  if (status === 'loading') return <div className="min-h-screen bg-[#0f1117]" />

  return (
    <div className="min-h-screen bg-[#0f1117]">

      {/* Top nav */}
      <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
            <span className="text-[15px] font-medium text-[#e2e8f0]">CodePath</span>
          </Link>
          <span className="text-[#2a2f3e]">/</span>
          <Link href="/admin" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">Admin</Link>
          <span className="text-[#2a2f3e]">/</span>
          <span className="text-xs text-[#c8d0e0]">Students</span>
        </div>
        <span className="text-[10px] text-[#5a6278]">{COMPANY.name}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#e2e8f0]">Student management</h1>
            <p className="text-xs text-[#8892a4] mt-1">
              View all students, change their subscription plan, or create accounts manually
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            {showForm ? '✕ Cancel' : '+ Add student'}
          </button>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-900/30 border border-red-700/40 text-red-400'
              : 'bg-[#1e2a1e] border border-[#1D9E75]/40 text-[#1D9E75]'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Create student form */}
        {showForm && (
          <div className="bg-[#161b27] border border-[#534AB7]/40 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Create new student account</h2>
            <form onSubmit={createStudent} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8892a4]">Full name</label>
                <input type="text" placeholder="e.g. Rohit Kumar" required
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8892a4]">Email address</label>
                <input type="email" placeholder="student@gmail.com" required
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8892a4]">Temporary password</label>
                <input type="text" placeholder="Give them a password to start" required
                  value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8892a4]">Starting plan</label>
                <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                  className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60">
                  <option value="FREE">Free — limited access</option>
                  <option value="BASIC">Basic — all videos ($12/mo)</option>
                  <option value="PRO">Pro — all + live ($39/mo)</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3 mt-1">
                <button type="submit" disabled={formLoading}
                  className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {formLoading ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
            <p className="text-[11px] text-[#5a6278] mt-3">
              The student can log in immediately with these credentials. Share the email + password with them directly.
            </p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total students', value: counts.ALL, color: 'text-[#e2e8f0]' },
            { label: 'Free plan',      value: counts.FREE,  color: 'text-[#8892a4]' },
            { label: 'Basic plan',     value: counts.BASIC, color: 'text-[#7f77dd]' },
            { label: 'Pro plan',       value: counts.PRO,   color: 'text-[#1D9E75]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-1">{label}</p>
              <p className={`text-2xl font-medium ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-[#161b27] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] placeholder-[#5a6278] focus:border-[#534AB7]/60 flex-1 max-w-xs" />
          <div className="flex gap-2">
            {['ALL', 'FREE', 'BASIC', 'PRO'].map((p) => (
              <button key={p} onClick={() => setPlanFilter(p)}
                className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  planFilter === p
                    ? 'bg-[#534AB7] text-[#EEEDFE] border-[#534AB7]'
                    : 'bg-[#161b27] text-[#8892a4] border-[#2a2f3e] hover:border-[#534AB7]/40'
                }`}>
                {p} {p !== 'ALL' && `(${counts[p]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Students table */}
        <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs text-[#5a6278]">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#5a6278]">
              {search || planFilter !== 'ALL' ? 'No students match your filter.' : 'No students yet. Add one above.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2f3e]">
                  {['Student', 'Email', 'Plan', 'Lessons done', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-[10px] text-[#5a6278] font-normal px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[#1a1d2a] last:border-none hover:bg-[#2a2f3e]/10 transition-colors">

                    {/* Name + role */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1e1e2a] flex items-center justify-center text-[10px] font-medium text-[#7f77dd] flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#c8d0e0]">{s.name}</p>
                          {s.role === 'ADMIN' && (
                            <span className="text-[9px] text-[#BA7517]">Admin</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-[11px] text-[#8892a4]">{s.email}</td>

                    {/* Plan — clickable dropdown to change */}
                    <td className="px-4 py-3">
                      {s.role === 'ADMIN' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e2a22] text-[#BA7517]">ADMIN</span>
                      ) : (
                        <select
                          value={s.plan}
                          onChange={(e) => changePlan(s.id, e.target.value)}
                          className={`text-[10px] font-medium px-2 py-1 rounded-full border-none cursor-pointer ${PLAN_COLORS[s.plan]}`}
                          style={{ background: 'transparent' }}
                        >
                          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      )}
                    </td>

                    {/* Lessons done */}
                    <td className="px-4 py-3 text-[11px] text-[#8892a4]">
                      {s._count?.progress ?? 0} lessons
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-3 text-[11px] text-[#5a6278]">
                      {formatDate(s.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {s.role !== 'ADMIN' && (
                        <button onClick={() => deleteStudent(s.id, s.name)}
                          className="text-[10px] text-red-500/60 hover:text-red-400 transition-colors">
                          Remove
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Key for plan change */}
        <p className="text-[11px] text-[#5a6278] mt-3">
          Tip: Click the plan badge (FREE / BASIC / PRO) in the table to instantly change a student's access level.
        </p>

      </div>
    </div>
  )
}
