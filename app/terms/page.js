// app/terms/page.js
import LegalLayout from '../../components/LegalLayout'
import { COMPANY } from '../../lib/constants'

export const metadata = {
  title: `Terms of Service — ${COMPANY.product} by ${COMPANY.name}`,
  description: 'Terms and conditions for using the CodePath online programming education platform by Anil Software Technologies.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using CodePath. By creating an account, you agree to these terms."
      lastUpdated="May 2026"
    >

      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using <strong>CodePath</strong> (the "Platform"), operated by{' '}
        <strong>Anil Software Technologies</strong> ("we", "us", "our"), you agree to be bound by these
        Terms of Service. If you do not agree to these terms, do not use the Platform.
      </p>
      <div className="highlight">
        Platform: CodePath at www.anilsofttech.com<br />
        Operated by: Anil Software Technologies<br />
        CEO: Anil Kumar Mikkili<br />
        Contact: contact@anilsofttech.com | +91 9866376367
      </div>

      <h2>2. Description of service</h2>
      <p>
        CodePath is an online programming education platform that provides video-based courses, an
        AI-powered doubt-clearing agent, progress tracking, and completion certificates. The platform
        is available on a subscription basis with the following plans:
      </p>
      <ul>
        <li><strong>Free plan:</strong> Limited access to preview lessons and restricted AI agent usage.</li>
        <li><strong>Basic plan ($12/month):</strong> Full access to all pre-recorded video lessons, unlimited AI doubt agent, and completion certificates.</li>
        <li><strong>Pro plan ($39/month):</strong> Everything in Basic, plus weekly live sessions, 1:1 mentor office hours, and job preparation resources.</li>
      </ul>

      <h2>3. Account registration</h2>
      <p>To use CodePath, you must create an account with a valid email address and password. You agree to:</p>
      <ul>
        <li>Provide accurate, current, and complete information during registration.</li>
        <li>Keep your password secure and not share it with anyone.</li>
        <li>Not create more than one account per person.</li>
        <li>Immediately notify us if you suspect unauthorised access to your account.</li>
        <li>Be at least 13 years of age to create an account.</li>
      </ul>
      <p>
        You are responsible for all activity that occurs under your account. Anil Software Technologies
        is not liable for any loss resulting from unauthorised use of your account.
      </p>

      <h2>4. Subscriptions and payments</h2>
      <p>
        Paid subscriptions are billed monthly on the date you first subscribed. Payments are processed
        securely by <strong>Stripe</strong>. By subscribing, you authorise Stripe to charge your
        payment method on a recurring monthly basis until you cancel.
      </p>
      <ul>
        <li>All prices are in US Dollars (USD) unless otherwise stated.</li>
        <li>Subscription fees are non-refundable except as described in our Refund Policy (Section 5).</li>
        <li>We reserve the right to change subscription prices with 30 days' notice via email.</li>
        <li>If a payment fails, we will retry the charge. If payment remains unsuccessful after 3 attempts, your account will be downgraded to the Free plan.</li>
      </ul>

      <h2>5. Refund policy</h2>
      <p>
        We offer a <strong>7-day money-back guarantee</strong> on new subscriptions. If you are not
        satisfied with your paid subscription within the first 7 days, contact us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we will issue a full refund.
      </p>
      <ul>
        <li>Refund requests after 7 days will not be accepted.</li>
        <li>Refunds apply only to the first subscription payment. Subsequent monthly renewals are non-refundable.</li>
        <li>Refunds are processed within 5–10 business days back to your original payment method.</li>
      </ul>

      <h2>6. Cancellation</h2>
      <p>
        You may cancel your subscription at any time. Upon cancellation, your subscription remains
        active until the end of the current billing period. You will not be charged for the following
        month. After cancellation, your account reverts to the Free plan.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree to use CodePath only for lawful, personal learning purposes. You must not:</p>
      <ul>
        <li><strong>Share your login credentials</strong> — one account is for one person only.</li>
        <li><strong>Share, record, or redistribute course videos</strong> — all video content is protected by copyright.</li>
        <li><strong>Download or copy course content</strong> — lessons are for streaming only.</li>
        <li>Use the AI doubt agent to generate harmful, offensive, or illegal content.</li>
        <li>Attempt to reverse-engineer, scrape, or copy any part of the platform.</li>
        <li>Use the platform to harass, defame, or harm other users or our staff.</li>
        <li>Use automated bots or tools to access the platform.</li>
      </ul>
      <p>
        Violation of these terms may result in immediate account termination without refund.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        All course content on CodePath — including videos, lesson notes, AI-generated responses in
        context, code examples, and platform design — is the intellectual property of{' '}
        <strong>Anil Software Technologies</strong> and is protected under Indian copyright law and
        international copyright treaties.
      </p>
      <p>
        Your subscription grants you a personal, non-transferable, non-exclusive licence to access
        and view the content for your own learning. No ownership is transferred.
      </p>

      <h2>9. AI doubt agent — disclaimer</h2>
      <p>
        The AI doubt-clearing agent is powered by an artificial intelligence model (Anthropic Claude).
        While we strive to provide accurate and helpful responses, we do not guarantee that all AI
        responses are correct. You should verify critical technical information independently.
        The AI agent is a learning aid, not a substitute for professional advice.
      </p>

      <h2>10. Certificates</h2>
      <p>
        Completion certificates are issued when all lessons in a course are marked as complete.
        Certificates confirm completion of our course content and do not represent any official
        academic qualification, government certification, or professional licence.
      </p>

      <h2>11. Platform availability</h2>
      <p>
        We aim to keep CodePath available 24/7 but do not guarantee uninterrupted service. We may
        take the platform down for maintenance, upgrades, or in response to circumstances beyond our
        control. We are not liable for any loss caused by platform downtime.
      </p>

      <h2>12. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Anil Software Technologies is not liable
        for any indirect, incidental, or consequential damages arising from your use of CodePath,
        including but not limited to loss of earnings, loss of data, or loss of career opportunities.
        Our maximum liability to you shall not exceed the amount you paid us in the 3 months
        preceding any claim.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes arising from these Terms shall
        be subject to the exclusive jurisdiction of the courts of India. By using CodePath, you
        consent to this jurisdiction.
      </p>

      <h2>14. Changes to terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you by email at least 14 days
        before significant changes take effect. Continued use of CodePath after the effective date
        of changes constitutes your acceptance of the revised Terms.
      </p>

      <h2>15. Contact us</h2>
      <p>For any questions about these Terms, please contact:</p>
      <div className="highlight">
        <strong>Anil Kumar Mikkili</strong> — CEO, Anil Software Technologies<br />
        Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
        Phone: {COMPANY.phone}<br />
        Website: {COMPANY.website}
      </div>

    </LegalLayout>
  )
}
