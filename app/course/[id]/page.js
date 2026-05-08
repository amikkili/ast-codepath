'use client'
// app/course/[id]/page.js  ← REPLACE existing file
// ADDED: In-browser code editor below the video player
import { useEffect, useState, useRef } from 'react'
import { useSession }                  from 'next-auth/react'
import { useRouter }                   from 'next/navigation'
import Link                            from 'next/link'
import dynamic                         from 'next/dynamic'
import VideoPlayer                     from '../../../components/VideoPlayer'
import { canAccess }                   from '../../../lib/constants'

// Load code editor only when needed (it's large)
const CodeEditor = dynamic(() => import('../../../components/CodeEditor'), {
  ssr:     false,
  loading: () => (
    <div className="h-40 bg-[#1e1e1e] border border-[#2a2f3e] rounded-xl flex items-center justify-center">
      <p className="text-xs text-[#5a6278]">Loading code editor...</p>
    </div>
  ),
})

export default function CoursePage({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [course, setCourse]       = useState(null)
  const [progress, setProgress]   = useState({})
  const [activeLesson, setActive] = useState(null)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [userPlan, setUserPlan]   = useState(null)
  const [showEditor, setShowEditor] = useState(false)  // toggle editor
  const bottomRef                 = useRef(null)

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
      const plan = planData.plan || 'FREE'
      setUserPlan(plan)
      const first = found.lessons?.[0]
      if (first) {
        setActive(first)
        setMessages([{ role: 'ai', text: `Hi ${session.user.name?.split(' ')[0]}! You are on "${first.title}". Ask me any doubt — I am here 24/7.` }])
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
    } finally { setAiLoading(false) }
  }

  function selectLesson(lesson) {
    if (!canAccess(userPlan || 'FREE', lesson.accessPlan)) return
    setActive(lesson)
    setMessages([{ role: 'ai', text: `Switched to "${lesson.title}". Ask me anything!` }])
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

  // Map course language to editor language
  const editorLang = course.language?.toLowerCase().includes('java') &&
    !course.language?.toLowerCase().includes('javascript') ? 'java'
    : course.language?.toLowerCase().includes('javascript') ? 'javascript'
    : course.language?.toLowerCase().includes('python') ? 'python'
    : course.language?.toLowerCase().includes('c++') ? 'cpp'
    : 'python'

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden">

      {/* Top bar */}
      <nav className="h-12 bg-[#161b27] border-b border-[#2a2f3e] flex items-center px-4 gap-4 flex-shrink-0">
        <Link href="/dashboard" className="text-xs text-[#8892a4] hover:text-[#e2e8f0]">← Dashboard</Link>
        <span className="text-[#2a2f3e]">|</span>
        <span className="text-xs text-[#c8d0e0] font-medium">{course.title}</span>
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
          userPlan === 'PRO' ? 'bg-[#1e2a1e] text-[#1D9E75]' :
          userPlan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
          'bg-[#2a2f3e] text-[#8892a4]'}`}>{userPlan}</span>
        <div className="ml-auto flex items-center gap-3">
          {/* Toggle code editor button */}
          <button onClick={() => setShowEditor(s => !s)}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-all ${
              showEditor ? 'bg-[#534AB7] text-[#EEEDFE]' : 'bg-[#2a2f3e]/50 text-[#8892a4] hover:bg-[#2a2f3e]'
            }`}>
            ⌨ {showEditor ? 'Hide editor' : 'Open editor'}
          </button>
          <div className="h-1 w-20 bg-[#2a2f3e] rounded-full overflow-hidden">
            <div className="h-1 bg-[#1D9E75] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-[#5a6278]">{doneLessons}/{totalLessons}</span>
        </div>
      </nav>

      {/* 3-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-52 bg-[#161b27] border-r border-[#2a2f3e] flex flex-col overflow-y-auto flex-shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-[#5a6278] px-4 py-3">{course.language} course</p>
          {course.lessons.map((lesson) => {
            const accessible = canAccess(userPlan, lesson.accessPlan)
            return (
              <button key={lesson.id} onClick={() => accessible && selectLesson(lesson)}
                className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                  activeLesson?.id === lesson.id ? 'border-[#534AB7] bg-[#1e2235]' : 'border-transparent hover:bg-[#2a2f3e]/20'
                } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

        {/* Main panel: video + code editor */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Video */}
          <div className="bg-black flex-shrink-0" style={{ height: showEditor ? '40%' : '55%', transition: 'height .3s' }}>
            {hasAccess ? (
              <VideoPlayer videoId={activeLesson?.videoId} title={activeLesson?.title} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-14 h-14 rounded-full bg-[#1e1e2a] border border-[#534AB7]/50 flex items-center justify-center text-2xl">🔒</div>
                <p className="text-sm font-medium text-[#e2e8f0]">This lesson requires {activeLesson?.accessPlan} plan</p>
                <p className="text-xs text-[#8892a4] text-center max-w-xs">
                  You are on the <span className="text-[#7f77dd] font-medium">{userPlan}</span> plan. Upgrade to unlock.
                </p>
                <Link href="/upgrade" className="bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2 rounded-lg hover:opacity-90">
                  Upgrade plan
                </Link>
              </div>
            )}
          </div>

          {/* ── Code Editor (shown when toggled) ──────────────────────── */}
          {showEditor && (
            <div className="border-t border-[#2a2f3e] bg-[#0f1117] flex-shrink-0 p-3" style={{ height: '40%' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-medium text-[#7f77dd]">
                  ⌨ Practice what you just learned — write and run code
                </p>
                <span className="text-[10px] text-[#5a6278]">Ctrl+Enter to run</span>
              </div>
              <div style={{ height: 'calc(100% - 28px)' }}>
                <CodeEditor defaultLanguage={editorLang} lessonTitle={activeLesson?.title} />
              </div>
            </div>
          )}

          {/* Lesson info */}
          {!showEditor && (
            <div className="flex-1 overflow-y-auto p-4 border-t border-[#2a2f3e]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium text-[#e2e8f0]">{activeLesson?.title}</h2>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e2a] font-medium" style={{ color: course.color }}>{course.language}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2f3e]/50 text-[#8892a4]">{course.level}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2f3e]/50 text-[#8892a4]">{activeLesson?.duration}</span>
                    {progress[activeLesson?.id] && <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e2a1e] text-[#1D9E75]">✓ Completed</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {hasAccess && !progress[activeLesson?.id] && (
                    <button onClick={markDone} className="text-xs bg-[#1D9E75] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90">Mark done ✓</button>
                  )}
                  <button onClick={() => {
                    const idx = course.lessons.findIndex(l => l.id === activeLesson?.id)
                    const next = course.lessons[idx + 1]
                    if (next && canAccess(userPlan, next.accessPlan)) selectLesson(next)
                  }} className="text-xs bg-[#534AB7] text-[#EEEDFE] px-3 py-1.5 rounded-lg font-medium hover:opacity-90">Next →</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* AI panel */}
        <aside className="w-64 bg-[#161b27] border-l border-[#2a2f3e] flex flex-col flex-shrink-0">
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
                  msg.role === 'user' ? 'bg-[#2a2f3e]/60 text-[#c8d0e0] rounded-tr-sm' : 'bg-[#0f1117] border border-[#2a2f3e] text-[#8892a4] rounded-tl-sm'
                }`}>
                  {msg.text}
                  {msg.code && <pre className="mt-2 bg-black/70 border border-[#2a2f3e] rounded-lg p-2 text-[10px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap">{msg.code}</pre>}
                </div>
              </div>
            ))}
            {aiLoading && <div className="bg-[#0f1117] border border-[#2a2f3e] rounded-xl rounded-tl-sm px-3 py-2 text-[11px] text-[#5a6278]">Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {['Give me an example', 'Explain simply', 'Show the syntax'].map(q => (
              <button key={q} onClick={() => setInput(q)} className="text-[9px] text-[#8892a4] bg-[#2a2f3e]/40 border border-[#2a2f3e] rounded-full px-2 py-1 hover:bg-[#2a2f3e]/70">{q}</button>
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
            <p className="text-[9px] text-[#5a6278] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
