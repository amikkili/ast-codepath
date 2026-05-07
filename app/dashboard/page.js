'use client'
// app/dashboard/page.js  ← REPLACE your existing dashboard/page.js with this
// FIX: Shows upgrade banner for ALL non-PRO students, not just FREE users
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { COMPANY } from '../../lib/constants'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses]   = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/progress').then((r) => r.json()),
    ]).then(([courseData, progressData]) => {
      setCourses(courseData.courses || [])
      const map = {}
      for (const p of (progressData.progress || [])) map[p.lessonId] = p.done
      setProgress(map)
      setLoading(false)
    })
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const totalDone = Object.values(progress).filter(Boolean).length
  const plan      = session?.user?.plan || 'FREE'
  const firstName = session?.user?.name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">{COMPANY.name}</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-[#8892a4] mt-1">Continue learning where you left off</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Courses enrolled',  value: courses.length },
            { label: 'Lessons completed', value: totalDone },
            { label: 'Current plan',      value: plan },
            { label: 'Streak (days)',      value: '7 🔥' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-1">{label}</p>
              <p className="text-xl font-medium text-[#e2e8f0]">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Upgrade banners — shown for FREE and BASIC users ── */}

        {plan === 'FREE' && (
          <div className="bg-[#1e1e2a] border border-[#534AB7]/40 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#7f77dd]">
                🔒 Unlock all lessons — upgrade to Basic
              </p>
              <p className="text-xs text-[#5a6278] mt-0.5">
                You are on the Free plan. Basic gives you all videos + unlimited AI doubt agent for $12/month.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Upgrade now →
            </Link>
          </div>
        )}

        {/* ── FIX: Also show banner for BASIC users to upgrade to PRO ── */}
        {plan === 'BASIC' && (
          <div className="bg-[#1a2a1e] border border-[#1D9E75]/30 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1D9E75]">
                ⚡ Get live sessions — upgrade to Pro
              </p>
              <p className="text-xs text-[#5a6278] mt-0.5">
                You are on Basic. Pro adds weekly live classes, 1:1 mentor hours and job prep for $39/month.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="bg-[#1D9E75] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Upgrade to Pro →
            </Link>
          </div>
        )}

        {plan === 'PRO' && (
          <div className="bg-[#1e2a1e] border border-[#1D9E75]/20 rounded-xl p-3 mb-8 flex items-center gap-3">
            <span className="text-sm">🎉</span>
            <p className="text-xs text-[#1D9E75]">
              You are on the <strong>Pro plan</strong> — you have access to everything including live sessions.
            </p>
          </div>
        )}

        {/* Courses grid */}
        <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Your courses</h2>

        {courses.length === 0 ? (
          <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-10 text-center">
            <p className="text-sm text-[#5a6278]">No courses available yet.</p>
            <p className="text-xs text-[#5a6278] mt-1">Check back soon — new content is being added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => {
              const total      = course.lessons?.length || 0
              const done       = (course.lessons || []).filter((l) => progress[l.id]).length
              const pct        = total > 0 ? Math.round((done / total) * 100) : 0
              const nextLesson = (course.lessons || []).find((l) => !progress[l.id])

              return (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="block bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 hover:border-[#534AB7]/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: course.color }} />
                    <span className="text-[11px] text-[#8892a4]">{course.language}</span>
                    <span className="ml-auto text-[10px] text-[#5a6278]">{pct}%</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#e2e8f0] mb-1 group-hover:text-[#7f77dd] transition-colors">
                    {course.title}
                  </h3>
                  {nextLesson && (
                    <p className="text-[11px] text-[#5a6278] mb-3">
                      Next: {nextLesson.title}
                    </p>
                  )}
                  <div className="h-1 bg-[#2a2f3e] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-1 bg-[#534AB7] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a6278] mt-1.5">{done}/{total} lessons</p>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
