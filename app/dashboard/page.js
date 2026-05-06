'use client'
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
          <p className="text-sm text-[#5a6278]">Loading...</p>
        </div>
      </div>
    )
  }

  const totalDone = Object.values(progress).filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">{COMPANY.name}</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">
            Welcome back, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-[#8892a4] mt-1">Continue learning where you left off</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Courses enrolled',  value: courses.length },
            { label: 'Lessons completed', value: totalDone },
            { label: 'Current plan',      value: session?.user?.plan },
            { label: 'Streak (days)',      value: '7 🔥' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
              <p className="text-[11px] text-[#5a6278] mb-1">{label}</p>
              <p className="text-xl font-medium text-[#e2e8f0]">{value}</p>
            </div>
          ))}
        </div>

        {/* Plan upgrade banner for FREE users */}
        {session?.user?.plan === 'FREE' && (
          <div className="bg-[#1e1e2a] border border-[#534AB7]/40 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#7f77dd]">Upgrade to unlock all lessons</p>
              <p className="text-xs text-[#5a6278] mt-0.5">You are on the Free plan. Basic unlocks all videos + unlimited AI agent.</p>
            </div>
            <Link href="/#pricing" className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
              Upgrade now
            </Link>
          </div>
        )}

        {/* Courses grid */}
        <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Your courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-[#5a6278]">No courses available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => {
              const total    = course.lessons.length
              const done     = course.lessons.filter((l) => progress[l.id]).length
              const pct      = total > 0 ? Math.round((done / total) * 100) : 0
              const nextLesson = course.lessons.find((l) => !progress[l.id])

              return (
                <Link key={course.id} href={`/course/${course.id}`}
                  className="block bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 hover:border-[#534AB7]/50 transition-colors group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: course.color }} />
                    <span className="text-[11px] text-[#8892a4]">{course.language}</span>
                    <span className="ml-auto text-[10px] text-[#5a6278]">{pct}%</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#e2e8f0] mb-1 group-hover:text-[#7f77dd] transition-colors">
                    {course.title}
                  </h3>
                  {nextLesson && (
                    <p className="text-[11px] text-[#5a6278] mb-3">Next: {nextLesson.title}</p>
                  )}
                  <div className="h-1 bg-[#2a2f3e] rounded-full overflow-hidden mt-3">
                    <div className="h-1 bg-[#534AB7] rounded-full" style={{ width: `${pct}%` }} />
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
