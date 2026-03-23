import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'

const SECTIONS = [
  {
    title: '30-Day Money-Back Guarantee',
    content: `MushiHost offers a 30-day money-back guarantee on all new shared hosting and WordPress hosting plans. If you are not completely satisfied with our service within the first 30 days of your initial purchase, you may request a full refund — no questions asked.`,
  },
  {
    title: 'Eligible Services',
    items: [
      'Shared Hosting plans (Starter, Business, Enterprise)',
      'WordPress Hosting plans',
      'Annual and monthly billing cycles',
    ],
  },
  {
    title: 'Non-Refundable Services',
    items: [
      'VPS Hosting (due to dedicated resource allocation)',
      'Dedicated Servers (due to hardware provisioning)',
      'Domain name registrations and transfers',
      'SSL certificates (third-party issued)',
      'Setup fees and migration services',
      'Renewal payments (only initial purchase is eligible)',
    ],
  },
  {
    title: 'How to Request a Refund',
    items: [
      'Log in to your MushiHost dashboard',
      'Navigate to Billing & Subscriptions',
      'Click "Request Refund" on the eligible service',
      'Alternatively, email billing@mushihost.com with your account details',
    ],
  },
  {
    title: 'Processing Time',
    content: `Refund requests are reviewed within 1-2 business days. Once approved, the refund will be issued to your original payment method. Credit card refunds typically appear within 5-10 business days. PayPal refunds are usually processed within 3-5 business days. You will receive an email confirmation once the refund has been initiated.`,
  },
  {
    title: 'Cancellation Policy',
    content: `You may cancel your hosting services at any time. For monthly plans, cancellation takes effect at the end of the current billing period. For annual plans, if cancelled after the 30-day guarantee period, the service will remain active until the end of the billing cycle — no partial refunds are issued for the remaining term.`,
  },
  {
    title: 'Chargebacks',
    content: `We encourage you to contact our billing team before initiating a chargeback with your bank or payment provider. We are committed to resolving any disputes fairly and promptly. Unauthorized chargebacks may result in account suspension and collection actions.`,
  },
  {
    title: 'Contact Billing Support',
    content: `For refund requests or billing questions, email billing@mushihost.com or use the live chat on our website. Our billing team is available Monday through Friday, 9:00 AM - 6:00 PM PST.`,
  },
]

export default function RefundPolicy() {
  return (
    <>
      <PageHero title="Refund Policy" subtitle="Our commitment to your satisfaction" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: January 15, 2026
        </p>
        <p className="mb-8 text-muted-foreground">
          At MushiHost, customer satisfaction is our top priority. We stand behind our services with a transparent
          refund policy so you can purchase with confidence.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}
              {section.items && (
                <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      <CTASection
        heading="Have Billing Questions?"
        description="Our support team is here to help with any payment or refund inquiries."
        buttonText="Contact Support"
        buttonLink="/contact"
      />
    </>
  )
}
