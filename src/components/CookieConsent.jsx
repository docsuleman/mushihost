import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'mushihost_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to improve your experience. By continuing to use our site, you agree to our{' '}
          <Link to="/cookie-policy" className="text-primary underline">
            Cookie Policy
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="cursor-pointer shrink-0">
          Accept Cookies
        </Button>
      </div>
    </div>
  )
}
