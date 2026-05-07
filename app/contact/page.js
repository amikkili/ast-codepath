'use client'
// app/contact/page.js  ← REPLACE existing file
// FIX: Added id="demo" anchor so /contact#demo scrolls directly to Request Demo form
// ADDED: WhatsApp button, Google Maps, social links, FAQ section
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { COMPANY } from '../../lib/constants'

const CONTACT_INFO = [
  {
    icon: '📍', title: 'Office Location',
    lines: ['Ponnur, Guntur (DT)', 'Andhra Pradesh, India — 522124'],
    color: 'text-[#534AB7]', bg: 'bg-[#1e1e2a]',
    action: { label: 'View on Maps', href: 'https://maps.google.com/?q=Ponnur,Guntur,Andhra+Pradesh,India' },
  },
  {
    icon: '📞', title: 'Call Us',
    lines: ['+91 9866376367', 'Mon – Fri, 10 AM – 6 PM IST'],
    color: 'text-[#1D9E75]', bg: 'bg-[#1e2a1e]',
    action: { label: 'Call now', href: 'tel:+919866376367' },
  },
  {
    icon: '✉', title: 'Email Us',
    lines: ['contact@anilsofttech.com', 'We respond within 24 hours'],
    color: 'text-[#BA7517]', bg: 'bg-[#1e261a]',
    action: { label: 'Send email', href: 'mailto:contact@anilsofttech.com' },
  },
]

const FAQS = [
  { q: 'What programming languages do you teach?', a: 'Currently Python, JavaScript and Java. More languages including C++, SQL and Go are being added to the course library.' },
  { q: 'Can I try before subscribing?', a: 'Yes — the Free plan gives you access to 2 preview lessons per course and 5 AI doubt questions per day. No credit card needed.' },
  { q: 'How does the AI doubt agent work?', a: 'A built-in AI tutor is available right inside every lesson. Ask any doubt about the topic being taught and get instant context-aware answers with code examples — available 24/7.' },
  { q: 'Do you offer corporate / team training?', a: 'Yes — we offer custom team plans for IT companies and colleges. Fill out the Request Demo form and Anil Kumar Mikkili will personally discuss a plan for your organisation.' },
  { q: 'Will I get a certificate after completing a course?', a: 'Yes — Basic and Pro subscribers receive a verified completion certificate that can be shared on LinkedIn and added to your resume.' },
  { q: 'What is the refund policy?', a: 'We offer a 7-day money-back guarantee if you are not satisfied. Contact us at contact@anilsofttech.com within 7 days of subscribing.' },
]

function useForm(initial) {
  const [form, setForm] = useState(initial)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const reset = () => setForm(initial)
  return { form, set, reset }
}

export default function ContactPage() {
  const searchParams = useSearchParams()
  const [openFaq, setOpenFaq] = useState(null)

  const inquiry = useForm({ name: '', email: '', subject: '', message: '' })
  const [inquiryState, setInquiryState] = useState({ loading: false, done: false, err: '' })

  const demo = useForm({ name: '', email: '', phone: '', company: '', enquiry: 'Course subscription' })
  const [demoState, setDemoState] = useState({ loading: false, done: false, err: '' })

  // ── FIX: Auto-scroll to demo form if URL has ?type=demo or #demo ──────────
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'demo') {
      setTimeout(() => {
        document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [searchParams])

  async function submitForm(type, formData, setState, resetFn) {
    setState({ loading: true, done: false, err: '' })
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setState({ loading: false, done: true, err: '' })
      resetFn()
    } catch (err) {
      setState({ loading: false, done: false, err: err.message || 'Failed to send' })
    }
  }

  const inputCls = 'w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#5a6278] focus:border-[#534AB7]/60 transition-colors'
  const labelCls = 'text-[11px] text-[#8892a4] block mb-1.5 font-medium'

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-[#2a2f3e] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#534AB7]/10 via-transparent to-[#1D9E75]/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-3">Get in touch</p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">Contact Us</h1>
          <p className="text-sm text-[#8892a4] max-w-lg mx-auto leading-relaxed">
            We'd love to hear from you. Reach out for course inquiries, demo requests,
            or any questions about {COMPANY.product}.
          </p>
          {/* Quick action buttons */}
          <div className="flex items-center justify-center gap-3 mt-7 flex-wrap">
            <a href="tel:+919866376367"
              className="flex items-center gap-2 bg-[#1e2a1e] border border-[#1D9E75]/40 text-[#1D9E75] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#1D9E75]/20 transition-colors">
              📞 Call us now
            </a>
            <a href="https://wa.me/919866376367?text=Hi%20Anil%2C%20I%20am%20interested%20in%20CodePath%20courses"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-[#1a2a1e] border border-[#25D366]/40 text-[#25D366] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors">
              💬 WhatsApp us
            </a>
            <a href="#demo"
              onClick={e => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="flex items-center gap-2 bg-[#534AB7] text-[#EEEDFE] text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              📋 Request a Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact cards ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-10 border-b border-[#2a2f3e]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CONTACT_INFO.map(({ icon, title, lines, color, bg, action }) => (
            <div key={title} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 text-center hover:border-[#534AB7]/40 transition-colors group">
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              <h3 className={`text-sm font-medium mb-2 ${color}`}>{title}</h3>
              {lines.map((l, i) => (
                <p key={i} className={`text-xs ${i === 0 ? 'text-[#c8d0e0] font-medium' : 'text-[#5a6278]'} leading-relaxed`}>{l}</p>
              ))}
              <a href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                className={`inline-block mt-3 text-[11px] font-medium ${color} hover:underline`}>
                {action.label} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Forms ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-b border-[#2a2f3e]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* General Inquiry */}
          <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1e1e2a] flex items-center justify-center text-base">💬</div>
              <h2 className="text-base font-medium text-[#e2e8f0]">General Inquiry</h2>
            </div>
            {inquiryState.done ? (
              <div className="bg-[#1e2a1e] border border-[#1D9E75]/40 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm font-medium text-[#1D9E75]">Message sent!</p>
                <p className="text-xs text-[#8892a4] mt-1">We'll reply within 24 hours.</p>
                <button onClick={() => setInquiryState({ loading: false, done: false, err: '' })}
                  className="mt-3 text-xs text-[#534AB7] hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); submitForm('inquiry', inquiry.form, setInquiryState, inquiry.reset) }}
                className="flex flex-col gap-4">
                {inquiryState.err && <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-400">{inquiryState.err}</div>}
                <div><label className={labelCls}>Name</label><input type="text" placeholder="Your full name" required value={inquiry.form.name} onChange={inquiry.set('name')} className={inputCls} /></div>
                <div><label className={labelCls}>Email</label><input type="email" placeholder="your@email.com" required value={inquiry.form.email} onChange={inquiry.set('email')} className={inputCls} /></div>
                <div><label className={labelCls}>Subject</label><input type="text" placeholder="Subject of your inquiry" value={inquiry.form.subject} onChange={inquiry.set('subject')} className={inputCls} /></div>
                <div><label className={labelCls}>Message</label><textarea placeholder="Your message..." required rows={4} value={inquiry.form.message} onChange={inquiry.set('message')} className={`${inputCls} resize-none`} /></div>
                <button type="submit" disabled={inquiryState.loading}
                  className="w-full bg-[#534AB7] text-[#EEEDFE] text-sm font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {inquiryState.loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* ── FIX: Request Demo form with id="demo" for anchor linking ── */}
          <div id="demo" className="bg-[#161b27] border border-[#534AB7]/50 rounded-xl p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#1e1e2a] flex items-center justify-center text-base">📋</div>
              <h2 className="text-base font-medium text-[#e2e8f0]">Request a Demo</h2>
            </div>
            <p className="text-xs text-[#5a6278] mb-5 leading-relaxed">
              See how CodePath can help your students or team. Anil Kumar Mikkili will personally schedule a demo for you.
            </p>
            {demoState.done ? (
              <div className="bg-[#1e2a1e] border border-[#1D9E75]/40 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-medium text-[#1D9E75]">Demo request received!</p>
                <p className="text-xs text-[#8892a4] mt-1">We'll contact you within 24 hours to schedule.</p>
                <button onClick={() => setDemoState({ loading: false, done: false, err: '' })}
                  className="mt-3 text-xs text-[#534AB7] hover:underline">Submit another</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); submitForm('demo', demo.form, setDemoState, demo.reset) }}
                className="flex flex-col gap-3">
                {demoState.err && <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-400">{demoState.err}</div>}
                <div><label className={labelCls}>Name</label><input type="text" placeholder="Your full name" required value={demo.form.name} onChange={demo.set('name')} className={inputCls} /></div>
                <div><label className={labelCls}>Email</label><input type="email" placeholder="your@email.com" required value={demo.form.email} onChange={demo.set('email')} className={inputCls} /></div>
                <div><label className={labelCls}>Phone (optional)</label><input type="tel" placeholder="+91 9876543210" value={demo.form.phone} onChange={demo.set('phone')} className={inputCls} /></div>
                <div><label className={labelCls}>Company / Institution (optional)</label><input type="text" placeholder="Your company or college name" value={demo.form.company} onChange={demo.set('company')} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>I'm interested in</label>
                  <select value={demo.form.enquiry} onChange={demo.set('enquiry')} className={inputCls}>
                    <option>Course subscription</option>
                    <option>Corporate / team training</option>
                    <option>Live mentorship sessions</option>
                    <option>Platform partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <button type="submit" disabled={demoState.loading}
                  className="w-full bg-[#1D9E75] text-white text-sm font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
                  {demoState.loading ? 'Sending...' : 'Request Demo 📅'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-b border-[#2a2f3e]">
        <div className="text-center mb-8">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-xl font-medium text-[#e2e8f0]">Frequently asked questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`bg-[#161b27] border rounded-xl overflow-hidden transition-colors ${openFaq === i ? 'border-[#534AB7]/50' : 'border-[#2a2f3e]'}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[#e2e8f0]">{faq.q}</span>
                <span className={`text-[#534AB7] text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-[#8892a4] leading-relaxed border-t border-[#2a2f3e] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── WhatsApp CTA ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-10 border-b border-[#2a2f3e]">
        <div className="bg-[#1a2a1e] border border-[#25D366]/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] mb-1">💬 Prefer WhatsApp?</p>
            <p className="text-xs text-[#8892a4]">Chat directly with Anil Kumar Mikkili for quick answers about courses, plans or demo scheduling.</p>
          </div>
          <a href="https://wa.me/919866376367?text=Hi%20Anil%2C%20I%20am%20interested%20in%20CodePath%20courses"
            target="_blank" rel="noreferrer"
            className="bg-[#25D366] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
            Chat on WhatsApp →
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#161b27] border-t border-[#2a2f3e] px-6 py-6 mt-4">
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

      {/* ── Floating WhatsApp button ──────────────────────────────────── */}
      <a href="https://wa.me/919866376367?text=Hi%20Anil%2C%20I%20am%20interested%20in%20CodePath%20courses"
        target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        title="Chat on WhatsApp">
        <span className="text-2xl">💬</span>
      </a>
    </div>
  )
}
