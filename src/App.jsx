import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
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
  )
}
