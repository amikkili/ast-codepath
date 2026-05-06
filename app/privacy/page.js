// app/privacy/page.js
import LegalLayout from '../../components/LegalLayout'
import { COMPANY } from '../../lib/constants'

export const metadata = {
  title: `Privacy Policy — ${COMPANY.product} by ${COMPANY.name}`,
  description: 'How Anil Software Technologies collects, uses, and protects your personal data on the CodePath learning platform.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information on the CodePath platform."
      lastUpdated="May 2026"
    >

      <h2>1. Who we are</h2>
      <p>
        This Privacy Policy applies to <strong>CodePath</strong>, an online programming education platform
        operated by <strong>Anil Software Technologies</strong>, owned and managed by{' '}
        <strong>Anil Kumar Mikkili</strong> (CEO).
      </p>
      <div className="highlight">
        <strong>Anil Software Technologies</strong><br />
        Website: www.anilsofttech.com<br />
        Email: contact@anilsofttech.com<br />
        Phone: +91 9866376367<br />
        Platform: CodePath (codepath.anilsofttech.com)
      </div>

      <h2>2. What information we collect</h2>
      <p>We collect the following information when you use CodePath:</p>
      <ul>
        <li><strong>Account information:</strong> Your full name, email address, and password (stored as an encrypted hash — we cannot read your actual password).</li>
        <li><strong>Payment information:</strong> When you subscribe to a paid plan, your payment is processed by Stripe. We do not store your card number, CVV, or bank details on our servers.</li>
        <li><strong>Learning progress:</strong> Which lessons you have watched, which courses you are enrolled in, and how much of each video you have completed.</li>
        <li><strong>AI interaction data:</strong> Questions you ask the AI doubt-clearing agent during lessons, to provide relevant answers in context.</li>
        <li><strong>Usage data:</strong> Pages you visit, time spent on the platform, browser type, and device type — collected via analytics tools.</li>
        <li><strong>Communications:</strong> If you contact us by email or through the platform, we keep a record of that communication.</li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use your information for the following purposes:</p>
      <ul>
        <li>To create and manage your student account.</li>
        <li>To provide access to video lessons, AI doubt-clearing, and other platform features based on your subscription plan.</li>
        <li>To process subscription payments and send payment receipts.</li>
        <li>To send important account emails such as welcome messages, password resets, and course completion certificates.</li>
        <li>To track and display your learning progress on your dashboard.</li>
        <li>To improve the platform based on how students use it.</li>
        <li>To respond to your support requests and questions.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal data to any third party. We do not use your data for advertising purposes.</p>

      <h2>4. How we store and protect your data</h2>
      <p>
        Your data is stored in a secure <strong>PostgreSQL database</strong> hosted on Render.com, a cloud
        infrastructure provider with industry-standard security practices. All data is transmitted over
        HTTPS (encrypted connection).
      </p>
      <ul>
        <li><strong>Passwords:</strong> Stored using bcrypt hashing (one-way encryption). Even our team cannot read your password.</li>
        <li><strong>Payment data:</strong> Handled entirely by Stripe, which is PCI-DSS Level 1 certified — the highest level of payment security.</li>
        <li><strong>Videos:</strong> Hosted on Cloudflare Stream. Video links are private and require authentication to access.</li>
        <li><strong>Sessions:</strong> Login sessions are encrypted using secure JWT tokens managed by NextAuth.</li>
      </ul>

      <h2>5. Third-party services we use</h2>
      <p>We use the following trusted third-party services to operate CodePath. Each has their own privacy policy:</p>
      <ul>
        <li><strong>Stripe</strong> (stripe.com) — payment processing and subscription billing.</li>
        <li><strong>Cloudflare Stream</strong> (cloudflare.com) — secure video hosting and delivery.</li>
        <li><strong>Render</strong> (render.com) — cloud hosting for our application and database.</li>
        <li><strong>Anthropic</strong> (anthropic.com) — AI model powering the doubt-clearing agent. Your questions are sent to Anthropic's API to generate answers.</li>
        <li><strong>Resend</strong> (resend.com) — transactional email delivery (welcome emails, receipts).</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        CodePath uses essential cookies to keep you logged in between sessions. We use a session cookie
        managed by NextAuth. We do not use advertising or tracking cookies. By using our platform, you
        consent to these essential cookies.
      </p>

      <h2>7. Your rights</h2>
      <p>As a user of CodePath, you have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> You can request a copy of all personal data we hold about you.</li>
        <li><strong>Correction:</strong> You can ask us to correct inaccurate information.</li>
        <li><strong>Deletion:</strong> You can request that we delete your account and all associated data.</li>
        <li><strong>Data portability:</strong> You can request your progress data in a readable format.</li>
        <li><strong>Opt out of emails:</strong> You can unsubscribe from non-essential emails at any time using the unsubscribe link in any email.</li>
      </ul>
      <p>
        To exercise any of these rights, email us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we will respond within 7 working days.
      </p>

      <h2>8. Data retention</h2>
      <p>
        We retain your account data for as long as your account is active. If you delete your account,
        we remove your personal data within 30 days. Payment records may be retained for up to 7 years
        as required by Indian tax law (GST compliance).
      </p>

      <h2>9. Children's privacy</h2>
      <p>
        CodePath is intended for users aged 13 and above. We do not knowingly collect personal data from
        children under 13. If you believe a child under 13 has created an account, please contact us and
        we will delete the account immediately.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will update the "Last updated"
        date at the top of this page and notify registered students by email for significant changes.
        Continued use of the platform after changes constitutes acceptance of the updated policy.
      </p>

      <h2>11. Contact us</h2>
      <p>
        For any privacy-related questions, requests, or concerns, please contact:
      </p>
      <div className="highlight">
        <strong>Anil Kumar Mikkili</strong> — CEO, Anil Software Technologies<br />
        Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
        Phone: {COMPANY.phone}<br />
        Website: {COMPANY.website}
      </div>

    </LegalLayout>
  )
}
