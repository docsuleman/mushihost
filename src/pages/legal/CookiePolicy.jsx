import PageHero from '@/components/PageHero'

const COOKIE_TYPES = [
  {
    type: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable core features such as security, session management, and accessibility. Essential cookies cannot be disabled.',
    examples: ['Session ID', 'Authentication tokens', 'Security tokens (CSRF)', 'Cookie consent preference'],
  },
  {
    type: 'Analytics Cookies',
    description: 'We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience. All analytics data is aggregated and anonymized.',
    examples: ['Page views and navigation patterns', 'Device and browser information', 'Referral sources', 'Time spent on pages'],
  },
  {
    type: 'Functional Cookies',
    description: 'Functional cookies remember your preferences and settings to provide a more personalized experience. Disabling these may affect certain features.',
    examples: ['Language and region preferences', 'Dashboard layout preferences', 'Theme settings (light/dark mode)'],
  },
  {
    type: 'Marketing Cookies',
    description: 'We may use marketing cookies to deliver relevant advertisements and measure campaign effectiveness. These cookies are optional and can be disabled without affecting core functionality.',
    examples: ['Ad platform identifiers', 'Campaign attribution data', 'Retargeting pixels'],
  },
]

const SECTIONS = [
  {
    title: 'What Are Cookies?',
    content: `Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and understand how you interact with the site. Cookies can be "persistent" (stored until expiry or manual deletion) or "session" cookies (deleted when you close your browser).`,
  },
  {
    title: 'Third-Party Cookies',
    content: `Some cookies on our website are set by third-party services we use, including Stripe (payment processing), Google Analytics (website analytics), and Cloudflare (performance and security). These third parties have their own cookie and privacy policies. We do not have control over their cookies but carefully select partners who adhere to privacy best practices.`,
  },
  {
    title: 'Managing Your Cookie Preferences',
    content: `You can control and delete cookies through your browser settings. Most browsers allow you to block or delete cookies, set preferences for specific websites, enable "Do Not Track" signals, and browse in private/incognito mode. Please note that disabling essential cookies may impair the functionality of our website and services.`,
  },
  {
    title: 'Browser-Specific Instructions',
    content: `To manage cookies, visit your browser's settings or preferences panel. Instructions vary by browser — refer to your browser's help documentation for specific steps (Chrome: Settings > Privacy > Cookies; Firefox: Settings > Privacy & Security; Safari: Preferences > Privacy; Edge: Settings > Cookies and site permissions).`,
  },
  {
    title: 'Changes to This Cookie Policy',
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. Any updates will be posted on this page with a revised "last updated" date.`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about our use of cookies, please contact us at privacy@mushihost.com.`,
  },
]

export default function CookiePolicy() {
  return (
    <>
      <PageHero title="Cookie Policy" subtitle="How we use cookies on our website" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated: January 15, 2026
        </p>
        <p className="mb-8 text-muted-foreground">
          This Cookie Policy explains how MushiHost uses cookies and similar tracking technologies
          when you visit our website and use our services.
        </p>

        {/* Cookie Types */}
        <h2 className="mb-6 text-xl font-semibold">Types of Cookies We Use</h2>
        <div className="mb-12 space-y-6">
          {COOKIE_TYPES.map((cookie) => (
            <div key={cookie.type} className="rounded-lg border border-border p-5">
              <h3 className="mb-2 font-semibold">{cookie.type}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{cookie.description}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {cookie.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Other Sections */}
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
