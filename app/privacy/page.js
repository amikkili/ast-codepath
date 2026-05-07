// app/privacy/page.js  ← NEW FILE
import Link   from 'next/link'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'Privacy Policy — CodePath by Anil Software Technologies',
  description: 'Privacy policy for CodePath online learning platform by Anil Software Technologies.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">

        <div className="mb-8 md:mb-12">
          <p className="text-[11px] text-[#534AB7] uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-2xl md:text-3xl font-medium text-[#e2e8f0] mb-3">Privacy Policy</h1>
          <p className="text-sm text-[#5a6278]">Last updated: May 2026 · Anil Software Technologies</p>
        </div>

        <div className="space-y-8 text-sm text-[#8892a4] leading-relaxed">

          <Section title="1. Who we are">
            <p>CodePath is an online programming education platform operated by <strong className="text-[#c8d0e0]">Anil Software Technologies</strong>, headquartered in India. Our contact email is <a href="mailto:contact@anilsofttech.com" className="text-[#534AB7] hover:underline">contact@anilsofttech.com</a> and our phone number is +91 9866376367.</p>
          </Section>

          <Section title="2. Information we collect">
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#c8d0e0]">Account information:</strong> Your name and email address when you sign up.</li>
              <li><strong className="text-[#c8d0e0]">Payment information:</strong> Processed securely by Stripe or Razorpay. We never store your card number.</li>
              <li><strong className="text-[#c8d0e0]">Learning data:</strong> Which lessons you have completed and your progress through courses.</li>
              <li><strong className="text-[#c8d0e0]">AI interaction data:</strong> Questions you ask the AI doubt agent — used to improve answers.</li>
              <li><strong className="text-[#c8d0e0]">Usage data:</strong> Pages visited, time spent, browser type — collected via analytics.</li>
            </ul>
          </Section>

          <Section title="3. How we use your information">
            <ul className="space-y-2 list-disc list-inside">
              <li>To provide and improve our learning platform and AI tutoring service.</li>
              <li>To send you important emails — welcome, password reset, payment receipts and course updates.</li>
              <li>To process your subscription payments via Stripe (international) or Razorpay (India).</li>
              <li>To track your learning progress and generate completion certificates.</li>
              <li>To send occasional product updates and learning tips (you can unsubscribe anytime).</li>
            </ul>
          </Section>

          <Section title="4. Data sharing">
            <p className="mb-3">We do not sell your personal data. We share data only with the following trusted service providers:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#c8d0e0]">Stripe / Razorpay</strong> — payment processing</li>
              <li><strong className="text-[#c8d0e0]">Anthropic</strong> — AI doubt agent (your questions are processed by Claude)</li>
              <li><strong className="text-[#c8d0e0]">Cloudflare</strong> — video streaming</li>
              <li><strong className="text-[#c8d0e0]">Resend</strong> — email delivery</li>
              <li><strong className="text-[#c8d0e0]">Render</strong> — cloud hosting</li>
            </ul>
          </Section>

          <Section title="5. Data retention">
            <p>We retain your account data as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days. Payment records are retained for 7 years as required by Indian tax law.</p>
          </Section>

          <Section title="6. Your rights">
            <ul className="space-y-2 list-disc list-inside">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data in your profile.</li>
              <li>Request deletion of your account and data.</li>
              <li>Opt out of marketing emails at any time via the unsubscribe link.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:contact@anilsofttech.com" className="text-[#534AB7] hover:underline">contact@anilsofttech.com</a>.</p>
          </Section>

          <Section title="7. Cookies">
            <p>We use essential cookies for login sessions and optional analytics cookies to understand how students use the platform. You can disable cookies in your browser settings, though this may affect site functionality.</p>
          </Section>

          <Section title="8. Security">
            <p>All data is transmitted over HTTPS. Passwords are encrypted using bcrypt and are never stored in plain text. Payment data is handled exclusively by PCI-compliant payment processors (Stripe and Razorpay).</p>
          </Section>

          <Section title="9. Children's privacy">
            <p>CodePath is intended for users aged 13 and above. We do not knowingly collect data from children under 13. If you believe a child has created an account, please contact us and we will delete it immediately.</p>
          </Section>

          <Section title="10. Contact us">
            <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4 mt-2">
              <p className="text-[#c8d0e0] font-medium mb-2">Anil Software Technologies</p>
              <p>CEO: Anil Kumar Mikkili</p>
              <p>Email: <a href="mailto:contact@anilsofttech.com" className="text-[#534AB7] hover:underline">contact@anilsofttech.com</a></p>
              <p>Phone: +91 9866376367</p>
              <p>Website: <a href="https://www.anilsofttech.com" className="text-[#534AB7] hover:underline">www.anilsofttech.com</a></p>
            </div>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#2a2f3e] flex items-center gap-4 text-xs text-[#5a6278]">
          <Link href="/terms" className="hover:text-[#534AB7] transition-colors">Terms of Service</Link>
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
