import PageHero from '@/components/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Clock, MapPin, MessageCircle } from 'lucide-react'

const CONTACT_INFO = [
  { icon: Mail, title: 'Email', detail: 'support@mushihost.com', sub: 'We reply within 2 hours' },
  { icon: MessageCircle, title: 'Live Chat', detail: 'Available on our website', sub: 'Average response: 5 minutes' },
  { icon: Clock, title: 'Support Hours', detail: '24/7/365', sub: 'Always here when you need us' },
  { icon: MapPin, title: 'Office', detail: '2100 Cloud Avenue, Suite 400', sub: 'San Francisco, CA 94105' },
]

export default function Contact() {
  return (
    <>
      <PageHero title="Contact Us" subtitle="We'd love to hear from you. Get in touch with our team." />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const data = new FormData(e.target)
                  const subject = encodeURIComponent(data.get('subject') || 'Website Inquiry')
                  const body = encodeURIComponent(
                    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`,
                  )
                  window.location.href = `mailto:support@mushihost.com?subject=${subject}&body=${body}`
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="How can we help?" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell us more about your inquiry..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Get in Touch</h2>
            <p className="text-muted-foreground">
              Whether you have a question about our hosting plans, need technical assistance,
              or want to explore a partnership, our team is ready to help.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CONTACT_INFO.map((info) => (
                <Card key={info.title}>
                  <CardContent className="flex gap-3 p-4">
                    <info.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold">{info.title}</h3>
                      <p className="text-sm font-medium">{info.detail}</p>
                      <p className="text-xs text-muted-foreground">{info.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
