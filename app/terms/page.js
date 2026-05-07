// app/terms/page.js  ← NEW FILE
import Link   from 'next/link'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'Terms of Service — CodePath by Anil Software Technologies',
  description: 'Terms of service for CodePath online learning platform by Anil Software Technologies.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">

        <div className="mb-8 md:mb-12">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-2xl md:text-3xl font-medium text-[#e2e8f0] mb-3">Terms of Service</h1>
          <p className="text-sm text-[#5a6278]">Last updated: May 2026 · Anil Software Technologies</p>
        </div>

        <div className="bg-[#1e2a1e] border border-[#1D9E75]/30 rounded-xl p-4 mb-8 text-xs text-[#1D9E75] leading-relaxed">
          By creating an account or making a purchase on CodePath, you agree to these terms. Please read them carefully.
        </div>

        <div className="space-y-8 text-sm text-[#8892a4] leading-relaxed">

          <Section title="1. About CodePath">
            <p>CodePath is an online programming education platform provided by <strong className="text-[#c8d0e0]">Anil Software Technologies</strong>, India. These Terms govern your access to and use of our platform, courses, and AI tutoring service.</p>
          </Section>

          <Section title="2. Account registration">
            <ul className="space-y-2 list-disc list-inside">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for keeping your password secure. Do not share your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>One account per person. Creating multiple accounts to abuse free trials is prohibited.</li>
            </ul>
          </Section>

          <Section title="3. Subscriptions and payments">
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#c8d0e0]">Plans:</strong> We offer Free, Basic ($12/month or ₹999/month), and Pro ($39/month or ₹3,299/month) plans.</li>
              <li><strong className="text-[#c8d0e0]">Billing:</strong> Subscriptions are billed monthly and renew automatically until cancelled.</li>
              <li><strong className="text-[#c8d0e0]">Cancellation:</strong> You can cancel your subscription at any time. Access continues until the end of the paid period.</li>
              <li><strong className="text-[#c8d0e0]">Refunds:</strong> We offer a 7-day money-back guarantee for new subscribers. Contact us at contact@anilsofttech.com within 7 days of payment.</li>
              <li><strong className="text-[#c8d0e0]">Price changes:</strong> We will give 30 days notice before changing subscription prices.</li>
            </ul>
          </Section>

          <Section title="4. Course content and access">
            <ul className="space-y-2 list-disc list-inside">
              <li>Course access is granted for personal, non-commercial use only.</li>
              <li>You may not share your account, download videos, or redistribute course content.</li>
              <li>We reserve the right to update, modify or remove course content at any time.</li>
              <li>Free plan users have access to 2 preview lessons per course only.</li>
            </ul>
          </Section>

          <Section title="5. AI doubt agent">
            <ul className="space-y-2 list-disc list-inside">
              <li>The AI doubt agent is powered by Anthropic's Claude and is provided as a learning aid.</li>
              <li>AI responses are for educational purposes and may occasionally be inaccurate. Always verify critical information.</li>
              <li>Free plan users are limited to 5 AI questions per day. Basic and Pro plans have unlimited access.</li>
              <li>Do not attempt to misuse the AI agent for purposes unrelated to learning.</li>
            </ul>
          </Section>

          <Section title="6. Acceptable use">
            <p className="mb-3">You agree NOT to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Share your login credentials with others or allow multiple people to use one account.</li>
              <li>Screen-record, download or redistribute any video content.</li>
              <li>Attempt to hack, scrape or disrupt the platform.</li>
              <li>Post offensive, harmful or illegal content in Q&A sections or community areas.</li>
              <li>Use the AI agent to generate harmful content or attempt to bypass its guidelines.</li>
            </ul>
          </Section>

          <Section title="7. Intellectual property">
            <p>All course content, videos, AI responses, and platform design are owned by Anil Software Technologies. You may not reproduce or distribute any content without written permission. Your completion certificates are personal documents issued to you specifically and may not be sold or transferred.</p>
          </Section>

          <Section title="8. Certificates">
            <p>Completion certificates are issued when a student completes all lessons in a course. Certificates are for personal use and LinkedIn/resume display. We do not guarantee employment outcomes from completing our courses.</p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>CodePath is provided "as is". Anil Software Technologies is not liable for any indirect, incidental or consequential damages arising from your use of the platform. Our maximum liability to you is the amount you paid us in the last 3 months.</p>
          </Section>

          <Section title="10. Governing law">
            <p>These terms are governed by the laws of India. Any disputes will be resolved in the courts of India. If you have a concern, please contact us first at contact@anilsofttech.com — we will do our best to resolve it fairly and quickly.</p>
          </Section>

          <Section title="11. Changes to these terms">
            <p>We may update these terms occasionally. When we make significant changes, we will notify you by email. Continued use of CodePath after notification constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="12. Contact">
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4 mt-2">
              <p className="text-[#c8d0e0] font-medium mb-2">Anil Software Technologies</p>
              <p>CEO: Anil Kumar Mikkili</p>
              <p>Email: <a href="mailto:contact@anilsofttech.com" className="text-[#534AB7] hover:underline">contact@anilsofttech.com</a></p>
              <p>Phone: +91 9866376367</p>
            </div>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#2a2f3e] flex items-center gap-4 text-xs text-[#5a6278]">
          <Link href="/privacy" className="hover:text-[#534AB7] transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-[#534AB7] transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-medium text-[#e2e8f0] mb-3">{title}</h2>
      {children}
    </div>
  )
}
