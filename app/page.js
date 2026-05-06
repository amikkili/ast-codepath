import Link from 'next/link'
import Navbar from '../components/Navbar'
import { COMPANY, PLANS } from '../lib/constants'

const LANGUAGES = [
  { name: 'Python',     color: '#3572A5' },
  { name: 'JavaScript', color: '#F7DF1E' },
  { name: 'Java',       color: '#b07219' },
  { name: 'C++',        color: '#f34b7d' },
  { name: 'C#',         color: '#178600' },
  { name: 'HTML/CSS',   color: '#e34c26' },
  { name: 'SQL',        color: '#e38c00' },
  { name: 'Go',         color: '#00ADD8' },
]

const FEATURES = [
  { icon: '▶', title: 'Expert video lessons',    desc: 'Pre-recorded, high-quality lessons you can rewatch anytime at your own pace.',               accent: false },
  { icon: '◉', title: 'AI doubt agent',          desc: 'Stuck? Ask our AI tutor right inside the lesson. Instant context-aware answers.',             accent: true  },
  { icon: '⌨', title: 'In-browser code editor', desc: 'Write and run code without leaving the platform. No installs needed.',                         accent: false },
  { icon: '⬤', title: 'Live weekly sessions',    desc: 'Pro subscribers join live instructor-led classes every week with real-time Q&A.',              accent: false },
  { icon: '✦', title: 'Completion certificate',  desc: 'Earn a verified certificate on course completion, shareable on LinkedIn.',                     accent: false },
  { icon: '◈', title: 'Student community',       desc: 'Connect with fellow learners, share projects and stay motivated throughout your journey.',     accent: false },
]

const TESTIMONIALS = [
  { text: '"The AI doubt agent is the best feature I have ever seen in any online course. I get answers instantly without waiting for a forum reply."', name: 'Rohit Kumar',  role: 'Python student',       av: 'RK', color: 'bg-indigo-900/40 text-indigo-300' },
  { text: '"I tried Udemy and Coursera. CodePath by AST is the only one where I feel like I have a personal tutor available 24/7."',                  name: 'Sara Patel',   role: 'JavaScript student',   av: 'SP', color: 'bg-emerald-900/40 text-emerald-300' },
  { text: '"The live sessions in the Pro plan combined with the AI agent got me my first developer job within 3 months of joining."',                   name: 'Aman Mishra',  role: 'Java — Pro subscriber', av: 'AM', color: 'bg-green-900/40 text-green-300' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-16 text-center border-b border-[#2a2f3e]">
        <div className="inline-flex items-center gap-2 bg-[#161b27] border border-[#2a2f3e] rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
          <span className="text-[11px] text-[#8892a4]">AI-powered doubt clearing — available 24/7</span>
        </div>

        <h1 className="text-4xl font-medium leading-tight tracking-tight mb-4 max-w-2xl mx-auto">
          Learn programming with an{' '}
          <span className="text-[#7f77dd]">AI tutor by your side</span>
        </h1>

        <p className="text-sm text-[#8892a4] max-w-lg mx-auto mb-3 leading-relaxed">
          {COMPANY.tagline}. Expert video lessons + AI doubt clearing, all in one platform.
        </p>
        <p className="text-xs text-[#534AB7] mb-8 font-medium">
          Powered by {COMPANY.name}
        </p>

        <div className="flex items-center justify-center gap-3 mb-10">
          <Link href="/login?tab=signup" className="bg-[#534AB7] text-[#EEEDFE] text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Start for free
          </Link>
          <Link href="#courses" className="text-sm text-[#c8d0e0] border border-[#2a2f3e] px-6 py-2.5 rounded-lg hover:bg-[#2a2f3e]/30 transition-colors">
            Browse courses
          </Link>
        </div>

        <div className="flex items-center justify-center gap-10">
          {[['12,400+','Students enrolled'],['8','Languages covered'],['24/7','AI doubt support'],['4.9★','Average rating']].map(([n,l])=>(
            <div key={l} className="text-center">
              <div className="text-xl font-medium">{n}</div>
              <div className="text-[11px] text-[#5a6278] mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────── */}
      <section id="courses" className="px-6 py-12 border-b border-[#2a2f3e]">
        <p className="text-[10px] text-[#534AB7] uppercase tracking-widest text-center mb-2">Languages</p>
        <h2 className="text-xl font-medium text-center mb-6">Pick your language, start today</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {LANGUAGES.map(({ name, color }) => (
            <div key={name} className="flex items-center gap-2 bg-[#161b27] border border-[#2a2f3e] rounded-lg px-4 py-2 hover:border-[#534AB7]/50 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-sm text-[#c8d0e0] font-medium">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-12 border-b border-[#2a2f3e]">
        <p className="text-[10px] text-[#534AB7] uppercase tracking-widest text-center mb-2">Why CodePath</p>
        <h2 className="text-xl font-medium text-center mb-2">Everything you need to truly learn</h2>
        <p className="text-xs text-[#8892a4] text-center mb-8">Not just videos — a complete learning experience</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className={`bg-[#161b27] rounded-xl p-5 border ${f.accent ? 'border-[#534AB7]/60' : 'border-[#2a2f3e]'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3 ${f.accent ? 'bg-[#534AB7]/20 text-[#7f77dd]' : 'bg-[#2a2f3e]/50 text-[#8892a4]'}`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-medium text-[#e2e8f0] mb-1">{f.title}</h3>
              <p className="text-[11px] text-[#8892a4] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-12 border-b border-[#2a2f3e]">
        <p className="text-[10px] text-[#534AB7] uppercase tracking-widest text-center mb-2">Pricing</p>
        <h2 className="text-xl font-medium text-center mb-2">Simple, honest pricing</h2>
        <p className="text-xs text-[#8892a4] text-center mb-8">Cancel anytime. No hidden fees.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-[#161b27] rounded-xl p-6 relative ${plan.popular ? 'border-2 border-[#534AB7]' : 'border border-[#2a2f3e]'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#534AB7] text-[#EEEDFE] text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </div>
              )}
              <p className="text-xs text-[#8892a4] mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-medium">${plan.price}</span>
                <span className="text-xs text-[#8892a4]">{plan.per}</span>
              </div>
              <p className="text-[11px] text-[#8892a4] mb-4 leading-relaxed">{plan.desc}</p>
              <hr className="border-[#2a2f3e] mb-4" />
              <ul className="space-y-2.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-[11px]">
                    {f.ok ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#2a2f3e]/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] text-[#5a6278]">✕</span>
                    )}
                    <span className={f.ok ? 'text-[#8892a4]' : 'text-[#5a6278]/70'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login?tab=signup" className={`block w-full text-center text-xs font-medium py-2 rounded-lg transition-colors ${
                plan.popular ? 'bg-[#534AB7] text-[#EEEDFE] hover:opacity-90' :
                plan.id === 'PRO' ? 'border border-[#534AB7]/50 text-[#7f77dd] hover:bg-[#534AB7]/10' :
                'border border-[#2a2f3e] text-[#8892a4] hover:bg-[#2a2f3e]/30'
              }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="px-6 py-12 border-b border-[#2a2f3e]">
        <p className="text-[10px] text-[#534AB7] uppercase tracking-widest text-center mb-2">Students</p>
        <h2 className="text-xl font-medium text-center mb-8">What our learners say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
              <div className="text-[#BA7517] text-xs mb-3">★★★★★</div>
              <p className="text-[11px] text-[#8892a4] leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium ${t.color}`}>{t.av}</div>
                <div>
                  <p className="text-xs font-medium text-[#c8d0e0]">{t.name}</p>
                  <p className="text-[10px] text-[#5a6278]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-medium mb-3">Ready to start learning?</h2>
        <p className="text-xs text-[#8892a4] mb-6">Join thousands of students already building their programming skills</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login?tab=signup" className="bg-[#534AB7] text-[#EEEDFE] text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Start for free
          </Link>
          <Link href="#courses" className="text-sm text-[#c8d0e0] border border-[#2a2f3e] px-6 py-2.5 rounded-lg hover:bg-[#2a2f3e]/30 transition-colors">
            Browse courses
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-[#161b27] border-t border-[#2a2f3e] px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
                <span className="text-sm font-medium text-[#e2e8f0]">CodePath</span>
              </div>
              <p className="text-[11px] text-[#5a6278]">{COMPANY.name}</p>
              <p className="text-[11px] text-[#5a6278]">CEO: {COMPANY.ceo}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#5a6278]">{COMPANY.email}</p>
              <p className="text-[11px] text-[#5a6278]">{COMPANY.phone}</p>
              <p className="text-[11px] text-[#5a6278]">{COMPANY.website}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#2a2f3e] pt-4">
            <div className="flex gap-4">
              {['Privacy', 'Terms', 'Support', 'Contact'].map((l) => (
                <a key={l} href="#" className="text-[11px] text-[#5a6278] hover:text-[#8892a4] transition-colors">{l}</a>
              ))}
            </div>
            <p className="text-[11px] text-[#5a6278]">© 2026 {COMPANY.name}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
