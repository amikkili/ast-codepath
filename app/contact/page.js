'use client'
// app/contact/page.js  ← NEW FILE
// Contact page with address, phone, email info cards
// + General Inquiry form + Request Demo form — like neoarc.ai
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { COMPANY } from '../../lib/constants'

const CONTACT_INFO = [
  {
    icon: '📍',
    title: 'Office Location',
    lines: ['Ponnur, Guntur (DT)', 'Andhra Pradesh, India — 522124'],
    color: 'text-[#534AB7]',
    bg: 'bg-[#1e1e2a]',
  },
  {
    icon: '📞',
    title: 'Call Us',
    lines: ['+91 9866376367', 'Mon – Fri, 10 AM – 6 PM IST'],
    color: 'text-[#1D9E75]',
    bg: 'bg-[#1e2a1e]',
  },
  {
    icon: '✉',
    title: 'Email Us',
    lines: ['contact@anilsofttech.com', 'We respond within 24 hours'],
    color: 'text-[#BA7517]',
    bg: 'bg-[#1e261a]',
  },
]

function ContactCard({ icon, title, lines, color, bg }) {
  return (
    <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 text-center hover:border-[#534AB7]/40 transition-colors">
      <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className={`text-sm font-medium mb-2 ${color}`}>{title}</h3>
      {lines.map((l, i) => (
        <p key={i} className={`text-xs ${i === 0 ? 'text-[#c8d0e0] font-medium' : 'text-[#5a6278]'} leading-relaxed`}>
          {l}
        </p>
      ))}
    </div>
  )
}

function useForm(initial) {
  const [form, setForm] = useState(initial)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const reset = () => setForm(initial)
  return { form, set, reset }
}

export default function ContactPage() {
  // ── General Inquiry form ──────────────────────────────────────────────────
  const inquiry = useForm({ name: '', email: '', subject: '', message: '' })
  const [inquiryState, setInquiryState] = useState({ loading: false, done: false, err: '' })

  // ── Request Demo form ─────────────────────────────────────────────────────
  const demo = useForm({ name: '', email: '', phone: '', company: '', enquiry: 'Course subscription' })
  const [demoState, setDemoState] = useState({ loading: false, done: false, err: '' })

  async function submitInquiry(e) {
    e.preventDefault()
    setInquiryState({ loading: true, done: false, err: '' })
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'inquiry', ...inquiry.form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInquiryState({ loading: false, done: true, err: '' })
      inquiry.reset()
    } catch (err) {
      setInquiryState({ loading: false, done: false, err: err.message || 'Failed to send' })
    }
  }

  async function submitDemo(e) {
    e.preventDefault()
    setDemoState({ loading: true, done: false, err: '' })
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'demo', ...demo.form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDemoState({ loading: false, done: true, err: '' })
      demo.reset()
    } catch (err) {
      setDemoState({ loading: false, done: false, err: err.message || 'Failed to send' })
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
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-3">Get in touch</p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">Contact Us</h1>
          <p className="text-sm text-[#8892a4] max-w-lg mx-auto leading-relaxed">
            We'd love to hear from you. Reach out for course inquiries, demo requests, or any questions about {COMPANY.product}.
          </p>
        </div>
      </section>

      {/* ── Contact info cards ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-b border-[#2a2f3e]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CONTACT_INFO.map((c) => <ContactCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* ── Forms ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
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
                <p className="text-xs text-[#8892a4] mt-1">We'll get back to you within 24 hours.</p>
                <button onClick={() => setInquiryState({ loading: false, done: false, err: '' })}
                  className="mt-3 text-xs text-[#534AB7] hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={submitInquiry} className="flex flex-col gap-4">
                {inquiryState.err && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-400">
                    {inquiryState.err}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Name</label>
                  <input type="text" placeholder="Your full name" required
                    value={inquiry.form.name} onChange={inquiry.set('name')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" placeholder="your@email.com" required
                    value={inquiry.form.email} onChange={inquiry.set('email')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Subject</label>
                  <input type="text" placeholder="Subject of your inquiry"
                    value={inquiry.form.subject} onChange={inquiry.set('subject')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Message</label>
                  <textarea placeholder="Your message..." required rows={4}
                    value={inquiry.form.message} onChange={inquiry.set('message')}
                    className={`${inputCls} resize-none`} />
                </div>
                <button type="submit" disabled={inquiryState.loading}
                  className="w-full bg-[#534AB7] text-[#EEEDFE] text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {inquiryState.loading ? 'Sending...' : <><span>Send Message</span><span>→</span></>}
                </button>
              </form>
            )}
          </div>

          {/* Request Demo */}
          <div className="bg-[#161b27] border border-[#534AB7]/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#1e1e2a] flex items-center justify-center text-base">📋</div>
              <h2 className="text-base font-medium text-[#e2e8f0]">Request a Demo</h2>
            </div>
            <p className="text-xs text-[#5a6278] mb-6 leading-relaxed">
              See how CodePath can help your students or team. Fill out the form and Anil Kumar Mikkili will personally schedule a demo for you.
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
              <form onSubmit={submitDemo} className="flex flex-col gap-4">
                {demoState.err && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2 text-xs text-red-400">
                    {demoState.err}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Name</label>
                  <input type="text" placeholder="Your full name" required
                    value={demo.form.name} onChange={demo.set('name')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" placeholder="your@email.com" required
                    value={demo.form.email} onChange={demo.set('email')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone (optional)</label>
                  <input type="tel" placeholder="+91 9876543210"
                    value={demo.form.phone} onChange={demo.set('phone')}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company / Institution (optional)</label>
                  <input type="text" placeholder="Your company or college name"
                    value={demo.form.company} onChange={demo.set('company')}
                    className={inputCls} />
                </div>
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
                  className="w-full bg-[#1D9E75] text-white text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {demoState.loading ? 'Sending...' : <><span>Request Demo</span><span>📅</span></>}
                </button>
              </form>
            )}
          </div>

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
    </div>
  )
}
