// components/LegalLayout.js
// Shared layout for Privacy Policy and Terms of Service pages

import Link from 'next/link'
import { COMPANY } from '../lib/constants'

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">

      {/* Nav */}
      <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-[15px] font-medium">{COMPANY.product}</span>
          <span className="text-[10px] text-[#5a6278] hidden md:block">by {COMPANY.name}</span>
        </Link>
        <div className="flex gap-4 text-xs text-[#8892a4]">
          <Link href="/privacy" className="hover:text-[#e2e8f0] transition-colors">Privacy</Link>
          <Link href="/terms"   className="hover:text-[#e2e8f0] transition-colors">Terms</Link>
          <Link href="/"        className="hover:text-[#e2e8f0] transition-colors">Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#161b27] border-b border-[#2a2f3e] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] text-[#534AB7] uppercase tracking-widest mb-2">{COMPANY.name}</p>
          <h1 className="text-2xl font-medium mb-2">{title}</h1>
          <p className="text-sm text-[#8892a4]">{subtitle}</p>
          <p className="text-[11px] text-[#5a6278] mt-3">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="legal-content">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#161b27] border-t border-[#2a2f3e] px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-[11px] text-[#5a6278]">
            {COMPANY.name} | {COMPANY.email} | {COMPANY.phone}
          </div>
          <div className="flex gap-4 text-[11px] text-[#5a6278]">
            <Link href="/privacy" className="hover:text-[#8892a4] transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-[#8892a4] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Legal content styles */}
      <style>{`
        .legal-content h2 {
          font-size: 15px;
          font-weight: 500;
          color: #e2e8f0;
          margin: 2rem 0 0.75rem;
          padding-top: 1.5rem;
          border-top: 0.5px solid #2a2f3e;
        }
        .legal-content h2:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        .legal-content p  { font-size: 13px; color: #8892a4; line-height: 1.8; margin-bottom: 0.75rem; }
        .legal-content ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .legal-content li { font-size: 13px; color: #8892a4; line-height: 1.8; margin-bottom: 0.25rem; }
        .legal-content strong { color: #c8d0e0; font-weight: 500; }
        .legal-content a  { color: #7f77dd; text-decoration: underline; }
        .legal-content .highlight {
          background: #1e1e2a;
          border: 0.5px solid #2a2f3e;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 1rem 0;
          font-size: 13px;
          color: #c8d0e0;
          line-height: 1.7;
        }
      `}</style>
    </div>
  )
}
