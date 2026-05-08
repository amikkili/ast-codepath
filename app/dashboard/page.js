'use client'
// app/dashboard/page.js  ← REPLACE existing file
// UPDATED: Shows completed courses with 🏆 badge + Download Certificate button
import { useEffect, useState } from 'react'
import { useSession }          from 'next-auth/react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import Navbar                  from '../../components/Navbar'
import { COMPANY }             from '../../lib/constants'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [courses, setCourses]           = useState([])
  const [progress, setProgress]         = useState({})
  const [realPlan, setRealPlan]         = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/user/plan').then(r => r.json()),
      fetch('/api/certificate').then(r => r.json()),
    ]).then(([courseData, progressData, planData, certData]) => {
      setCourses(courseData.courses || [])
      const map = {}
      for (const p of (progressData.progress || [])) map[p.lessonId] = p.done
      setProgress(map)
      if (planData.plan) setRealPlan(planData.plan)
      setCertificates(certData.certificates || [])
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
  const plan      = realPlan || session?.user?.plan || 'FREE'
  const firstName = session?.user?.name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">{COMPANY.name}</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">Welcome back, {firstName}</h1>
          <p className="text-xs text-[#8892a4] mt-1">Continue learning where you left off</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Courses enrolled',   value: courses.length },
            { label: 'Lessons completed',  value: totalDone },
            { label: 'Current plan',       value: plan },
            { label: 'Certificates',       value: certificates.length + ' 🏆' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-1">{label}</p>
              <p className="text-xl font-medium text-[#e2e8f0]">{value}</p>
            </div>
          ))}
        </div>

        {/* Plan banners */}
        {plan === 'FREE' && (
          <div className="bg-[#1e1e2a] border border-[#534AB7]/40 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#7f77dd]">🔒 Unlock all lessons — upgrade to Basic</p>
              <p className="text-xs text-[#5a6278] mt-0.5">Basic unlocks all videos + unlimited AI + completion certificate.</p>
            </div>
            <Link href="/upgrade" className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 flex-shrink-0">Upgrade now →</Link>
          </div>
        )}

        {plan === 'BASIC' && (
          <div className="bg-[#1a2a1e] border border-[#1D9E75]/30 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1D9E75]">⚡ Get live sessions — upgrade to Pro</p>
              <p className="text-xs text-[#5a6278] mt-0.5">Pro adds weekly live classes, 1:1 mentor hours and job prep.</p>
            </div>
            <Link href="/upgrade" className="bg-[#1D9E75] text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 flex-shrink-0">Upgrade to Pro →</Link>
          </div>
        )}

        {/* Certificates section */}
        {certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">🏆 Your certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-[#161b27] border border-[#1D9E75]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1e2a1e] rounded-full flex items-center justify-center text-xl flex-shrink-0">🏆</div>
                    <div>
                      <p className="text-xs font-medium text-[#c8d0e0]">{cert.courseName}</p>
                      <p className="text-[10px] text-[#5a6278] mt-0.5">
                        Completed {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      // Re-generate and download certificate
                      const res  = await fetch('/api/certificate', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ courseId: cert.courseId }),
                      })
                      const data = await res.json()
                      if (data.certificate) {
                        alert('Certificate sent to your email! Check ' + session.user.email)
                      }
                    }}
                    className="w-full text-xs font-medium py-1.5 rounded-lg bg-[#1e2a1e] text-[#1D9E75] border border-[#1D9E75]/30 hover:bg-[#1D9E75]/20 transition-colors">
                    📧 Re-send certificate to email
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Your courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-[#5a6278]">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => {
              const total   = course.lessons?.length || 0
              const done    = (course.lessons || []).filter(l => progress[l.id]).length
              const pct     = total > 0 ? Math.round((done / total) * 100) : 0
              const completed = pct === 100
              const next    = (course.lessons || []).find(l => !progress[l.id])
              const hasCert = certificates.some(c => c.courseId === course.id)

              return (
                <Link key={course.id} href={`/course/${course.id}`}
                  className="block bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 hover:border-[#534AB7]/50 transition-colors group relative">
                  {completed && (
                    <div className="absolute top-3 right-3 bg-[#1e2a1e] text-[#1D9E75] text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      🏆 Completed
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: course.color }} />
                    <span className="text-[11px] text-[#8892a4]">{course.language}</span>
                    <span className="ml-auto text-[10px] text-[#5a6278]">{pct}%</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#e2e8f0] mb-1 group-hover:text-[#7f77dd] transition-colors pr-16">{course.title}</h3>
                  {next && <p className="text-[11px] text-[#5a6278] mb-3">Next: {next.title}</p>}
                  <div className="h-1 bg-[#2a2f3e] rounded-full overflow-hidden mt-3">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: completed ? '#1D9E75' : '#534AB7' }} />
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
