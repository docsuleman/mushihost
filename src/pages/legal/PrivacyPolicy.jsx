import PageHero from '@/components/PageHero'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly when creating an account, purchasing services, or contacting support. This includes your name, email address, billing address, payment information, and any communications you send us. We also automatically collect technical data such as IP addresses, browser type, device information, and usage patterns through server logs and cookies.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected information to provide and maintain our hosting services, process payments and transactions, send service-related communications (billing, maintenance, security alerts), improve our services and develop new features, comply with legal obligations, and detect and prevent fraud or abuse of our services.`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information to third parties. We may share information with trusted service providers who assist in operating our services (payment processors, data center operators), when required by law or to respond to legal process, to protect the rights, property, or safety of MushiHost, our users, or the public, and in connection with a merger, acquisition, or sale of assets (with prior notice).`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL) and at rest, regular security audits and vulnerability assessments, access controls and authentication requirements, redundant backups across geographically distributed data centers, and DDoS mitigation and firewall protection.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. After account closure, we may retain certain data for up to 90 days for backup purposes and as required to comply with legal obligations, resolve disputes, and enforce agreements.`,
  },
  {
    title: '6. Your Rights (GDPR & CCPA)',
    content: `Depending on your location, you may have the right to access, correct, or delete your personal data, port your data to another service, restrict or object to processing, withdraw consent at any time, and lodge a complaint with a supervisory authority. To exercise these rights, contact us at privacy@mushihost.com. We will respond to requests within 30 days.`,
  },
  {
    title: '7. Cookies',
    content: `We use essential cookies to provide core functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings. See our Cookie Policy for full details.`,
  },
  {
    title: '8. Third-Party Services',
    content: `Our services may integrate with third-party tools for payment processing (Stripe, PayPal), analytics, and service delivery. These providers have their own privacy policies, and we encourage you to review them. We only share the minimum data necessary for these integrations to function.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information promptly.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting a notice on our website or sending an email. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us at privacy@mushihost.com or write to MushiHost, Data Protection Team, 2100 Cloud Avenue, Suite 400, San Francisco, CA 94105, United States.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle="How we collect, use, and protect your data" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: January 15, 2026 &mdash; Effective immediately
        </p>
        <p className="mb-8 text-muted-foreground">
          At MushiHost, we take your privacy seriously. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our web hosting services and website.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
