'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { COMPANY } from '../../lib/constants'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [form, setForm]       = useState({ courseId: '', lessonNo: '', title: '', duration: '', videoId: '', accessPlan: 'BASIC' })
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && session.user.role !== 'ADMIN') { router.push('/dashboard'); return }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    fetch('/api/admin/lessons').then((r) => r.json()).then((d) => {
      setCourses(d.courses || [])
      if (d.courses?.[0]) setForm((f) => ({ ...f, courseId: d.courses[0].id }))
    })
  }, [status, session])

  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })) }

  async function addLesson(e) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      setToast('Lesson saved! It is now live for subscribers.')
      setForm((f) => ({ ...f, lessonNo: '', title: '', duration: '', videoId: '' }))
      fetch('/api/admin/lessons').then((r) => r.json()).then((d) => setCourses(d.courses || []))
      setTimeout(() => setToast(''), 4000)
    } else {
      setToast('Error saving lesson. Check all fields.')
      setTimeout(() => setToast(''), 4000)
    }
  }

  async function deleteLesson(id) {
    if (!confirm('Delete this lesson?')) return
    await fetch('/api/admin/lessons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetch('/api/admin/lessons').then((r) => r.json()).then((d) => setCourses(d.courses || []))
  }

  const activeCourse = courses.find((c) => c.id === form.courseId)

  if (status === 'loading') return <div className="min-h-screen bg-[#0f1117]"><Navbar /></div>

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-xs text-[#5a6278] mb-1">{COMPANY.name} — Admin Panel</p>
          <h1 className="text-xl font-medium text-[#e2e8f0]">Manage video lessons</h1>
          <p className="text-xs text-[#8892a4] mt-1">Upload to Cloudflare Stream first, then paste the Video ID here</p>
        </div>

        {/* Cloudflare guide */}
        <div className="bg-[#161b27] border border-[#534AB7]/30 rounded-xl p-4 mb-6 text-xs">
          <p className="text-[#7f77dd] font-medium mb-2">How to get your Cloudflare Video ID</p>
          <ol className="text-[#8892a4] space-y-1 list-decimal list-inside">
            <li>Go to <span className="text-[#534AB7]">dash.cloudflare.com</span> → Stream</li>
            <li>Click <span className="font-medium text-[#c8d0e0]">Upload</span> and select your MP4 video file</li>
            <li>Wait for processing to complete (1–3 minutes)</li>
            <li>Click on the video → copy the <span className="font-medium text-[#c8d0e0]">Video ID</span> (e.g. a4ecd5a7b8c9d0e1)</li>
            <li>Paste it in the form below and click Save</li>
          </ol>
        </div>

        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-medium ${
            toast.includes('Error') ? 'bg-red-900/30 border border-red-700/50 text-red-400' :
            'bg-[#1e2a1e] border border-[#1D9E75]/50 text-[#1D9E75]'
          }`}>
            {toast}
          </div>
        )}

        {/* Add lesson form */}
        <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-[#e2e8f0] mb-4">Add a new lesson</h2>
          <form onSubmit={addLesson} className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">Course</label>
              <select value={form.courseId} onChange={set('courseId')}
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">Lesson number</label>
              <input type="number" value={form.lessonNo} onChange={set('lessonNo')} placeholder="e.g. 2" required min="1"
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">Lesson title</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Variables and Data Types" required
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">
                Cloudflare Stream Video ID
                <span className="ml-2 text-[#534AB7]">(paste from Cloudflare dashboard)</span>
              </label>
              <input type="text" value={form.videoId} onChange={set('videoId')}
                placeholder="e.g. a4ecd5a7b8c9d0e1f2g3" required
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60 font-mono" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">Duration</label>
              <input type="text" value={form.duration} onChange={set('duration')} placeholder="e.g. 12 min"
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8892a4]">Who can watch</label>
              <select value={form.accessPlan} onChange={set('accessPlan')}
                className="bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2 text-xs text-[#c8d0e0] focus:border-[#534AB7]/60">
                <option value="FREE">Free preview (anyone)</option>
                <option value="BASIC">Basic + Pro subscribers</option>
                <option value="PRO">Pro subscribers only</option>
              </select>
            </div>

            <div className="col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving}
                className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? 'Saving...' : 'Save and publish lesson'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing lessons table */}
        {courses.map((course) => (
          <div key={course.id} className="mb-6">
            <h3 className="text-sm font-medium text-[#e2e8f0] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: course.color }} />
              {course.title}
              <span className="text-[10px] text-[#5a6278] font-normal">{course.lessons.length} lessons</span>
            </h3>
            {course.lessons.length === 0 ? (
              <p className="text-xs text-[#5a6278] pl-4">No lessons yet. Add one above.</p>
            ) : (
              <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2f3e]">
                      {['#', 'Title', 'Video ID', 'Access', 'Duration', ''].map((h) => (
                        <th key={h} className="text-left text-[10px] text-[#5a6278] font-normal px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {course.lessons.map((l) => (
                      <tr key={l.id} className="border-b border-[#1a1d2a] last:border-none hover:bg-[#2a2f3e]/10 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] text-[#5a6278]">{l.lessonNo}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[#c8d0e0]">{l.title}</td>
                        <td className="px-4 py-2.5 text-[10px] text-[#534AB7] font-mono">{l.videoId.substring(0, 12)}...</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            l.accessPlan === 'FREE' ? 'bg-[#1e2a1e] text-[#1D9E75]' :
                            l.accessPlan === 'PRO'  ? 'bg-[#1e2a22] text-[#BA7517]' :
                            'bg-[#1e1e2a] text-[#7f77dd]'
                          }`}>{l.accessPlan}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-[#5a6278]">{l.duration}</td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => deleteLesson(l.id)}
                            className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
