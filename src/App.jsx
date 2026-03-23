import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/components/PublicLayout'
import CookieConsent from '@/components/CookieConsent'
import Landing from '@/pages/Landing'
import PaymentPage from '@/pages/PaymentPage'
import PaymentSuccess from '@/pages/PaymentSuccess'
import PaymentFailed from '@/pages/PaymentFailed'
import Dashboard from '@/pages/Dashboard'
import Subscriptions from '@/pages/Subscriptions'
import PaymentHistory from '@/pages/PaymentHistory'
import PaymentMethods from '@/pages/PaymentMethods'
import Invoices from '@/pages/Invoices'
import AutoLoad from '@/pages/AutoLoad'

// Content pages
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import FAQ from '@/pages/FAQ'
import ServerStatus from '@/pages/ServerStatus'
import Testimonials from '@/pages/Testimonials'
import Sitemap from '@/pages/Sitemap'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/blog/BlogPost'

// Hosting pages
import SharedHosting from '@/pages/hosting/SharedHosting'
import WordPressHosting from '@/pages/hosting/WordPressHosting'
import VPSHosting from '@/pages/hosting/VPSHosting'
import DedicatedServers from '@/pages/hosting/DedicatedServers'

// Knowledge Base
import KnowledgeBase from '@/pages/KnowledgeBase'
import GettingStarted from '@/pages/kb/GettingStarted'
import DomainManagement from '@/pages/kb/DomainManagement'
import EmailHosting from '@/pages/kb/EmailHosting'
import KBWordPress from '@/pages/kb/WordPressHosting'
import SecuritySSL from '@/pages/kb/SecuritySSL'
import BillingAccount from '@/pages/kb/BillingAccount'

// Legal pages
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy'
import TermsOfService from '@/pages/legal/TermsOfService'
import RefundPolicy from '@/pages/legal/RefundPolicy'
import CookiePolicy from '@/pages/legal/CookiePolicy'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public pages with Header + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/server-status" element={<ServerStatus />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Hosting */}
          <Route path="/hosting/shared" element={<SharedHosting />} />
          <Route path="/hosting/wordpress" element={<WordPressHosting />} />
          <Route path="/hosting/vps" element={<VPSHosting />} />
          <Route path="/hosting/dedicated" element={<DedicatedServers />} />

          {/* Knowledge Base */}
          <Route path="/help" element={<KnowledgeBase />} />
          <Route path="/help/getting-started" element={<GettingStarted />} />
          <Route path="/help/domains" element={<DomainManagement />} />
          <Route path="/help/email" element={<EmailHosting />} />
          <Route path="/help/wordpress" element={<KBWordPress />} />
          <Route path="/help/security" element={<SecuritySSL />} />
          <Route path="/help/billing" element={<BillingAccount />} />

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Route>

        {/* Payment & Dashboard pages (no public header/footer) */}
        <Route path="/pay/:token" element={<PaymentPage />} />
        <Route path="/pay/success" element={<PaymentSuccess />} />
        <Route path="/pay/failed" element={<PaymentFailed />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/subscriptions" element={<Subscriptions />} />
        <Route path="/dashboard/history" element={<PaymentHistory />} />
        <Route path="/dashboard/methods" element={<PaymentMethods />} />
        <Route path="/dashboard/invoices" element={<Invoices />} />
        <Route path="/dashboard/auto-load" element={<AutoLoad />} />
      </Routes>
      <CookieConsent />
    </>
  )
}
