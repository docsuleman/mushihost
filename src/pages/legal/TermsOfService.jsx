import PageHero from '@/components/PageHero'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using MushiHost services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services. These terms apply to all visitors, users, and customers of MushiHost.`,
  },
  {
    title: '2. Account Responsibilities',
    content: `You are responsible for maintaining the confidentiality of your account credentials, all activities that occur under your account, ensuring your contact and billing information is accurate and up-to-date, and complying with all applicable local, state, national, and international laws. You must notify us immediately of any unauthorized use of your account. MushiHost is not liable for any loss arising from unauthorized access to your account.`,
  },
  {
    title: '3. Service Description',
    content: `MushiHost provides web hosting services including shared hosting, WordPress hosting, VPS hosting, and dedicated server solutions. Services are provided "as is" and "as available." We reserve the right to modify, suspend, or discontinue any service with reasonable notice.`,
  },
  {
    title: '4. Acceptable Use Policy',
    content: `You agree not to use our services to host, transmit, or distribute illegal content or malware, send unsolicited bulk email (spam), infringe upon intellectual property rights, conduct phishing or fraudulent activities, launch attacks against other systems (DDoS, port scanning, etc.), host content that promotes violence or discrimination, or mine cryptocurrency without explicit authorization. Violation of this policy may result in immediate account suspension or termination.`,
  },
  {
    title: '5. Resource Usage',
    content: `Shared hosting accounts are subject to fair-use resource limits. Accounts that consume excessive CPU, memory, or bandwidth may be throttled or migrated. We will contact you before taking action and offer upgrade options when applicable.`,
  },
  {
    title: '6. Payment Terms',
    content: `All prices are in US Dollars unless otherwise stated. Payment is due at the time of purchase or renewal. We accept major credit cards and PayPal. Recurring services will automatically renew unless cancelled before the renewal date. Taxes may apply based on your location and will be added to the total. Failed payments may result in service suspension after a 7-day grace period.`,
  },
  {
    title: '7. Service Level Agreement (SLA)',
    content: `MushiHost guarantees 99.9% network uptime for all hosting services. If we fail to meet this guarantee in any calendar month, you may request a credit proportional to the downtime experienced. Scheduled maintenance windows (announced at least 48 hours in advance) are excluded from uptime calculations. Credits must be requested within 30 days of the incident.`,
  },
  {
    title: '8. Data Backups',
    content: `While MushiHost performs regular automated backups, it is ultimately your responsibility to maintain independent backups of your data. MushiHost is not liable for data loss. We recommend using our backup tools in conjunction with your own off-site backup strategy.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by law, MushiHost shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities. Our total liability for any claim shall not exceed the amount paid by you for the service in the 12 months preceding the claim.`,
  },
  {
    title: '10. Indemnification',
    content: `You agree to indemnify and hold MushiHost, its officers, directors, employees, and agents harmless from any claims, damages, losses, liabilities, and expenses arising out of your use of our services, your violation of these terms, or your violation of any rights of a third party.`,
  },
  {
    title: '11. Termination',
    content: `Either party may terminate service at any time. You may cancel your account through the dashboard or by contacting support. MushiHost may terminate or suspend accounts that violate these terms, with or without notice depending on severity. Upon termination, your data will be retained for 30 days before permanent deletion.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.`,
  },
  {
    title: '13. Changes to Terms',
    content: `We reserve the right to update these Terms of Service at any time. Material changes will be communicated via email or a prominent notice on our website at least 30 days before taking effect. Continued use of our services after changes become effective constitutes acceptance.`,
  },
  {
    title: '14. Contact',
    content: `Questions about these Terms of Service should be directed to legal@mushihost.com or MushiHost, Legal Department, 2100 Cloud Avenue, Suite 400, San Francisco, CA 94105, United States.`,
  },
]

export default function TermsOfService() {
  return (
    <>
      <PageHero title="Terms of Service" subtitle="Please read these terms carefully before using our services" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: January 15, 2026 &mdash; Effective immediately
        </p>
        <p className="mb-8 text-muted-foreground">
          Welcome to MushiHost. These Terms of Service govern your use of our web hosting services, website,
          and related products. By using our services, you agree to these terms in their entirety.
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
