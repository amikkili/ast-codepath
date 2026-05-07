'use client'
// app/course/[id]/page.js  ← REPLACE existing file
// MOBILE: Sidebar becomes a slide-in drawer. AI agent becomes a bottom sheet.
//         Video takes full width on mobile. All 3 panels accessible via buttons.
import { useEffect, useState, useRef } from 'react'
import { useSession }                  from 'next-auth/react'
import { useRouter }                   from 'next/navigation'
import Link                            from 'next/link'
import VideoPlayer                     from '../../../components/VideoPlayer'
import { canAccess }                   from '../../../lib/constants'

export default function CoursePage({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [course, setCourse]         = useState(null)
  const [progress, setProgress]     = useState({})
  const [activeLesson, setActive]   = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [userPlan, setUserPlan]     = useState(null)
  // Mobile panel state
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAI, setShowAI]           = useState(false)
  const bottomRef                     = useRef(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/user/plan').then(r => r.json()),
    ]).then(([courseData, progressData, planData]) => {
      const found = (courseData.courses || []).find(c => c.id === params.id)
      if (!found) { router.push('/dashboard'); return }
      setCourse(found)
      const map = {}
      for (const p of (progressData.progress || [])) map[p.lessonId] = p.done
      setProgress(map)
      setUserPlan(planData.plan || 'FREE')
      const first = found.lessons?.[0]
      if (first) {
        setActive(first)
        setMessages([{ role: 'ai', text: `Hi ${session.user.name?.split(' ')[0]}! You are on "${first.title}". Ask me any doubt!` }])
      }
    })
  }, [status, params.id, router, session])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function markDone() {
    if (!activeLesson) return
    await fetch('/api/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: activeLesson.id, done: true }),
    })
    setProgress(p => ({ ...p, [activeLesson.id]: true }))
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || aiLoading) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setAiLoading(true)
    try {
      const res  = await fetch('/api/ai-agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, lesson: activeLesson?.title, course: course?.title, language: course?.language }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.answer, code: data.code }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, try again in a moment.' }])
    } finally {
      setAiLoading(false)
    }
  }

  function selectLesson(lesson) {
    if (!canAccess(userPlan || 'FREE', lesson.accessPlan)) return
    setActive(lesson)
    setMessages([{ role: 'ai', text: `Switched to "${lesson.title}". Ask me any doubt!` }])
    setShowSidebar(false) // close sidebar on mobile after selection
  }

  if (status === 'loading' || !course || userPlan === null) {
    return (
      <div className="h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#5a6278]">Loading course...</p>
        </div>
      </div>
    )
  }

  const hasAccess    = activeLesson ? canAccess(userPlan, activeLesson.accessPlan) : false
  const doneLessons  = course.lessons.filter(l => progress[l.id]).length
  const totalLessons = course.lessons.length
  const pct          = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <nav className="h-12 bg-[#161b27] border-b border-[#2a2f3e] flex items-center px-3 md:px-4 gap-2 md:gap-4 flex-shrink-0">
        <Link href="/dashboard" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors whitespace-nowrap">
          ← Back
        </Link>
        <span className="text-[#2a2f3e] hidden md:block">|</span>
        <span className="text-xs text-[#c8d0e0] font-medium truncate flex-1">{course.title}</span>

        {/* Mobile action buttons */}
        <div className="flex items-center gap-2 md:hidden flex-shrink-0">
          <button onClick={() => { setShowSidebar(!showSidebar); setShowAI(false) }}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
              showSidebar ? 'bg-[#534AB7] text-[#EEEDFE] border-[#534AB7]' : 'border-[#2a2f3e] text-[#8892a4]'}`}>
            Lessons
          </button>
          <button onClick={() => { setShowAI(!showAI); setShowSidebar(false) }}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
              showAI ? 'bg-[#534AB7] text-[#EEEDFE] border-[#534AB7]' : 'border-[#2a2f3e] text-[#8892a4]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
            AI
          </button>
        </div>

        {/* Desktop progress */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
            userPlan === 'PRO' ? 'bg-[#1e2a1e] text-[#1D9E75]' :
            userPlan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' : 'bg-[#2a2f3e] text-[#8892a4]'}`}>
            {userPlan}
          </span>
          <div className="h-1 w-20 bg-[#2a2f3e] rounded-full overflow-hidden">
            <div className="h-1 bg-[#1D9E75] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-[#5a6278]">{doneLessons}/{totalLessons}</span>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── DESKTOP sidebar (always visible ≥ md) ─────────────── */}
        <aside className="hidden md:flex w-52 bg-[#161b27] border-r border-[#2a2f3e] flex-col overflow-y-auto flex-shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-[#5a6278] px-4 py-3">{course.language}</p>
          {course.lessons.map(lesson => {
            const accessible = canAccess(userPlan, lesson.accessPlan)
            return (
              <button key={lesson.id} onClick={() => accessible && selectLesson(lesson)}
                className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                  activeLesson?.id === lesson.id ? 'border-[#534AB7] bg-[#1e2235]' : 'border-transparent hover:bg-[#2a2f3e]/20'
                } ${!accessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {progress[lesson.id] && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />}
                  {!accessible && <span className="text-[9px]">🔒</span>}
                  <p className="text-[10px] text-[#5a6278]">Lesson {lesson.lessonNo}</p>
                </div>
                <p className={`text-xs font-medium leading-tight ${activeLesson?.id === lesson.id ? 'text-[#e2e8f0]' : 'text-[#c8d0e0]'}`}>
                  {lesson.title}
                </p>
                <p className="text-[10px] text-[#5a6278] mt-0.5">{lesson.duration}</p>
              </button>
            )
          })}
        </aside>

        {/* ── MOBILE sidebar drawer (slides over content) ───────── */}
        {showSidebar && (
          <div className="md:hidden absolute top-0 left-0 bottom-0 w-72 bg-[#161b27] border-r border-[#2a2f3e] z-40 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3e]">
              <p className="text-[10px] uppercase tracking-widest text-[#5a6278]">{course.language} · {doneLessons}/{totalLessons} done</p>
              <button onClick={() => setShowSidebar(false)} className="text-[#8892a4] text-lg leading-none">✕</button>
            </div>
            {course.lessons.map(lesson => {
              const accessible = canAccess(userPlan, lesson.accessPlan)
              return (
                <button key={lesson.id} onClick={() => accessible && selectLesson(lesson)}
                  className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                    activeLesson?.id === lesson.id ? 'border-[#534AB7] bg-[#1e2235]' : 'border-transparent'
                  } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {progress[lesson.id] && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />}
                    {!accessible && <span className="text-[9px]">🔒</span>}
                    <p className="text-[10px] text-[#5a6278]">Lesson {lesson.lessonNo}</p>
                  </div>
                  <p className={`text-xs font-medium ${activeLesson?.id === lesson.id ? 'text-[#e2e8f0]' : 'text-[#c8d0e0]'}`}>
                    {lesson.title}
                  </p>
                  <p className="text-[10px] text-[#5a6278] mt-0.5">{lesson.duration}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Center: video + lesson info ───────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Video */}
          <div className="bg-black flex-shrink-0" style={{ height: showAI ? '40%' : '55%' }}>
            {hasAccess ? (
              <VideoPlayer videoId={activeLesson?.videoId} title={activeLesson?.title} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-12 h-12 rounded-full bg-[#1e1e2a] border border-[#534AB7]/50 flex items-center justify-center text-xl">🔒</div>
                <p className="text-sm font-medium text-[#e2e8f0] text-center">Requires {activeLesson?.accessPlan} plan</p>
                <p className="text-xs text-[#8892a4] text-center max-w-xs">You are on {userPlan}. Upgrade to unlock all lessons.</p>
                <Link href="/upgrade" className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90">
                  Upgrade plan
                </Link>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 border-t border-[#2a2f3e]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-[#e2e8f0] truncate">{activeLesson?.title}</h2>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e2a] font-medium" style={{ color: course.color }}>{course.language}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2f3e]/50 text-[#8892a4]">{activeLesson?.duration}</span>
                  {progress[activeLesson?.id] && <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e2a1e] text-[#1D9E75]">✓ Done</span>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {hasAccess && !progress[activeLesson?.id] && (
                  <button onClick={markDone} className="text-[10px] md:text-xs bg-[#1D9E75] text-[#E1F5EE] px-2 md:px-3 py-1.5 rounded-lg font-medium hover:opacity-90 whitespace-nowrap">
                    ✓ Done
                  </button>
                )}
                <button onClick={() => {
                  const idx = course.lessons.findIndex(l => l.id === activeLesson?.id)
                  const next = course.lessons[idx + 1]
                  if (next && canAccess(userPlan, next.accessPlan)) selectLesson(next)
                }} className="text-[10px] md:text-xs bg-[#534AB7] text-[#EEEDFE] px-2 md:px-3 py-1.5 rounded-lg font-medium hover:opacity-90 whitespace-nowrap">
                  Next →
                </button>
              </div>
            </div>

            {/* Mobile progress bar */}
            <div className="md:hidden mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#5a6278]">Course progress</span>
                <span className="text-[10px] text-[#5a6278]">{doneLessons}/{totalLessons} lessons</span>
              </div>
              <div className="h-1 bg-[#2a2f3e] rounded-full overflow-hidden">
                <div className="h-1 bg-[#534AB7] rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </main>

        {/* ── DESKTOP AI panel ─────────────────────────────────── */}
        <aside className="hidden md:flex w-64 bg-[#161b27] border-l border-[#2a2f3e] flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-[#2a2f3e]">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#e2e8f0]">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />AI Doubt Agent
              </div>
              <span className="text-[10px] text-[#1D9E75]">Online</span>
            </div>
            <p className="text-[10px] text-[#5a6278]">Ask anything about this lesson</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'ai' && <p className="text-[9px] text-[#534AB7] font-medium mb-1 ml-1">CodePath AI</p>}
                <div className={`max-w-[92%] text-[11px] leading-relaxed px-3 py-2 rounded-xl ${
                  msg.role === 'user' ? 'bg-[#2a2f3e]/60 text-[#c8d0e0] rounded-tr-sm' : 'bg-[#0f1117] border border-[#2a2f3e] text-[#8892a4] rounded-tl-sm'}`}>
                  {msg.text}
                  {msg.code && <pre className="mt-2 bg-black/70 border border-[#2a2f3e] rounded-lg p-2 text-[10px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap">{msg.code}</pre>}
                </div>
              </div>
            ))}
            {aiLoading && <div className="flex"><div className="bg-[#0f1117] border border-[#2a2f3e] rounded-xl rounded-tl-sm px-3 py-2 text-[11px] text-[#5a6278]">Thinking...</div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {['Give me an example', 'Explain simply', 'Show syntax'].map(q => (
              <button key={q} onClick={() => setInput(q)} className="text-[9px] text-[#8892a4] bg-[#2a2f3e]/40 border border-[#2a2f3e] rounded-full px-2 py-1 hover:bg-[#2a2f3e]/70 transition-colors">{q}</button>
            ))}
          </div>
          <div className="p-3 border-t border-[#2a2f3e]">
            <div className="flex items-end gap-2 bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type your doubt..." rows={2}
                className="flex-1 bg-transparent text-[11px] text-[#c8d0e0] placeholder-[#5a6278] resize-none leading-relaxed" />
              <button onClick={sendMessage} disabled={!input.trim() || aiLoading}
                className="w-7 h-7 rounded-md bg-[#534AB7] flex items-center justify-center hover:opacity-90 disabled:opacity-40">
                <span className="text-white text-xs">↑</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE AI bottom sheet ────────────────────────────── */}
      {showAI && (
        <div className="md:hidden flex flex-col bg-[#161b27] border-t border-[#2a2f3e] flex-shrink-0" style={{ height: '45%' }}>
          <div className="px-4 py-2 border-b border-[#2a2f3e] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#e2e8f0]">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />AI Doubt Agent
            </div>
            <button onClick={() => setShowAI(false)} className="text-[#8892a4] text-sm">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'ai' && <p className="text-[9px] text-[#534AB7] font-medium mb-1 ml-1">CodePath AI</p>}
                <div className={`max-w-[90%] text-[11px] leading-relaxed px-3 py-2 rounded-xl ${
                  msg.role === 'user' ? 'bg-[#2a2f3e]/60 text-[#c8d0e0] rounded-tr-sm' : 'bg-[#0f1117] border border-[#2a2f3e] text-[#8892a4] rounded-tl-sm'}`}>
                  {msg.text}
                  {msg.code && <pre className="mt-2 bg-black/70 border border-[#2a2f3e] rounded-lg p-2 text-[10px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap">{msg.code}</pre>}
                </div>
              </div>
            ))}
            {aiLoading && <div className="flex"><div className="bg-[#0f1117] border border-[#2a2f3e] rounded-xl px-3 py-2 text-[11px] text-[#5a6278]">Thinking...</div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-[#2a2f3e]">
            <div className="flex items-center gap-2 bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
                placeholder="Ask a doubt..."
                className="flex-1 bg-transparent text-[11px] text-[#c8d0e0] placeholder-[#5a6278]" />
              <button onClick={sendMessage} disabled={!input.trim() || aiLoading}
                className="w-7 h-7 rounded-md bg-[#534AB7] flex items-center justify-center disabled:opacity-40">
                <span className="text-white text-xs">↑</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
