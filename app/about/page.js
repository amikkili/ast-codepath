// app/about/page.js  ← NEW FILE
// About Anil Software Technologies page
// CEO: Anil Kumar Mikkili | 13 years IT experience
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { COMPANY } from '../../lib/constants'

const STATS = [
  { value: '15+',  label: 'Years in IT Industry' },
  { value: '100+', label: 'Students mentored' },
  { value: '3',    label: 'Course languages' },
  { value: '24/7', label: 'AI doubt support' },
]

const EXPERTISE = [
  {
    icon: '🔗',
    title: 'Integration',
    desc: 'Deep expertise in enterprise integration patterns, API design, middleware, and connecting complex systems across platforms.',
    bg: 'bg-[#1e1e2a]',
    color: 'text-[#7f77dd]',
  },
  {
    icon: '☁',
    title: 'Cloud Technologies',
    desc: 'Hands-on experience with AWS, Azure, and Google Cloud. Cloud architecture, DevOps, CI/CD pipelines and infrastructure as code.',
    bg: 'bg-[#1e2a1e]',
    color: 'text-[#1D9E75]',
  },
  {
    icon: '🤖',
    title: 'AI / ML Ideology',
    desc: 'Building AI-powered applications, integrating LLMs into products, and applying machine learning concepts to real business problems.',
    bg: 'bg-[#1a2a1e]',
    color: 'text-[#BA7517]',
  },
]

const TIMELINE = [
  { year: '2011', event: 'Started IT career — specialised in enterprise integration and middleware' },
  { year: '2015', event: 'Expanded into cloud technologies — AWS and Azure certifications' },
  { year: '2019', event: 'Began working with AI/ML applications in production environments' },
  { year: '2022', event: 'Founded Anil Software Technologies to share 13 years of industry knowledge' },
  { year: '2024', event: 'Launched CodePath — online programming coaching with AI doubt-clearing agent' },
  { year: '2026', event: 'Expanding course library: Python, JavaScript, Java and more languages' },
]

const VALUES = [
  { icon: '🎯', title: 'Practical first',    desc: 'Every lesson is grounded in real industry experience — not just theory.' },
  { icon: '🤝', title: 'Always accessible',  desc: 'AI doubt agent available 24/7 so no student is ever left stuck.' },
  { icon: '📈', title: 'Career focused',     desc: 'Courses designed around what IT companies actually hire for.' },
  { icon: '💡', title: 'Keep it simple',      desc: 'Complex concepts explained in clear, beginner-friendly language.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-[#2a2f3e] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#534AB7]/10 via-transparent to-[#1D9E75]/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-3">Our story</p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">
            About {COMPANY.name}
          </h1>
          <p className="text-sm text-[#8892a4] max-w-xl mx-auto leading-relaxed">
            Driving innovation through expertise and dedication. Teaching programming the way the IT industry actually works.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="border-b border-[#2a2f3e]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 text-center hover:border-[#534AB7]/40 transition-colors">
                <p className="text-3xl font-medium text-[#e2e8f0] mb-1">{value}</p>
                <p className="text-[11px] text-[#5a6278]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CEO Section ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-b border-[#2a2f3e]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* CEO card */}
          <div className="bg-[#161b27] border border-[#534AB7]/40 rounded-2xl p-7">
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#534AB7] to-[#1D9E75] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                AK
              </div>
              <div>
                <h2 className="text-base font-medium text-[#e2e8f0]">{COMPANY.ceo}</h2>
                <p className="text-xs text-[#534AB7] font-medium mt-0.5">CEO &amp; Founder</p>
                <p className="text-[11px] text-[#5a6278] mt-0.5">{COMPANY.name}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {['Integration', 'Cloud', 'AI/ML', '13 Years IT'].map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#1e1e2a] text-[#7f77dd] border border-[#534AB7]/20">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#8892a4]">
                <span className="text-[#1D9E75]">📍</span>
                Ponnur, Guntur, Andhra Pradesh, India
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8892a4]">
                <span className="text-[#534AB7]">📞</span>
                +91 9866376367
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8892a4]">
                <span className="text-[#BA7517]">✉</span>
                {COMPANY.email}
              </div>
            </div>
          </div>

          {/* Bio text */}
          <div>
            <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-3">Meet the founder</p>
            <h3 className="text-xl font-medium text-[#e2e8f0] mb-4 leading-snug">
              Empowering the next generation of IT professionals
            </h3>
            <div className="space-y-3 text-sm text-[#8892a4] leading-relaxed">
              <p>
                Anil Kumar Mikkili brings over <strong className="text-[#c8d0e0]">13 years of hands-on IT industry experience</strong> across Integration, Cloud technologies, and AI/ML — working with enterprise systems, cloud platforms, and cutting-edge AI applications.
              </p>
              <p>
                Having worked across diverse projects and technologies, Anil understood a key gap: <strong className="text-[#c8d0e0]">students learn theory but struggle with real-world application</strong>. Traditional online courses offer videos but leave students stuck when they have doubts.
              </p>
              <p>
                That insight led to the creation of <strong className="text-[#c8d0e0]">CodePath</strong> — a platform that combines expert video lessons with a <strong className="text-[#c8d0e0]">24/7 AI doubt-clearing agent</strong>, so no student is ever left stuck in the middle of learning.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/contact"
                className="inline-block bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                Get in touch with Anil →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Areas of expertise ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-b border-[#2a2f3e]">
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Expertise</p>
          <h2 className="text-xl font-medium text-[#e2e8f0]">Built on 13 years of industry knowledge</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EXPERTISE.map(({ icon, title, desc, bg, color }) => (
            <div key={title} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 hover:border-[#534AB7]/40 transition-colors">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center text-xl mb-4`}>{icon}</div>
              <h3 className={`text-sm font-medium mb-2 ${color}`}>{title}</h3>
              <p className="text-xs text-[#8892a4] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our journey timeline ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-b border-[#2a2f3e]">
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Journey</p>
          <h2 className="text-xl font-medium text-[#e2e8f0]">Our leadership story</h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-[#2a2f3e]" />
          <div className="flex flex-col gap-6">
            {TIMELINE.map(({ year, event }, i) => (
              <div key={year} className="flex items-start gap-5 pl-1">
                <div className="w-10 h-10 rounded-full bg-[#1e1e2a] border-2 border-[#534AB7] flex items-center justify-center flex-shrink-0 relative z-10">
                  <span className="text-[9px] font-bold text-[#7f77dd]">{year.slice(2)}</span>
                </div>
                <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl px-4 py-3 flex-1 hover:border-[#534AB7]/30 transition-colors">
                  <span className="text-[10px] text-[#534AB7] font-medium">{year}</span>
                  <p className="text-xs text-[#c8d0e0] mt-0.5 leading-relaxed">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our values ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-b border-[#2a2f3e]">
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Values</p>
          <h2 className="text-xl font-medium text-[#e2e8f0]">What we stand for</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5 text-center hover:border-[#534AB7]/40 transition-colors">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="text-xs font-medium text-[#e2e8f0] mb-2">{title}</h3>
              <p className="text-[11px] text-[#5a6278] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-medium mb-3">Ready to learn with us?</h2>
        <p className="text-sm text-[#8892a4] mb-7 max-w-md mx-auto">
          Join students who are learning programming the right way — with expert guidance and AI-powered support.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/login?tab=signup"
            className="bg-[#534AB7] text-[#EEEDFE] text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Start learning free →
          </Link>
          <Link href="/contact"
            className="text-sm text-[#c8d0e0] border border-[#2a2f3e] px-6 py-2.5 rounded-lg hover:bg-[#2a2f3e]/30 transition-colors">
            Contact us
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#161b27] border-t border-[#2a2f3e] px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
            <span className="text-sm font-medium">{COMPANY.product}</span>
            <span className="text-[11px] text-[#5a6278]">by {COMPANY.name}</span>
          </div>
          <div className="flex gap-4 text-[11px] text-[#5a6278]">
            {['Privacy', 'Terms', 'Contact', 'About'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} className="hover:text-[#8892a4] transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[11px] text-[#5a6278]">© 2026 {COMPANY.name}</p>
        </div>
      </footer>
    </div>
  )
}
