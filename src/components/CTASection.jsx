import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function CTASection({
  heading = 'Ready to Get Started?',
  description = 'Launch your website today with our reliable hosting solutions.',
  buttonText = 'View Plans',
  buttonLink = '/#pricing',
}) {
  return (
    <section className="bg-gradient-to-r from-primary to-purple-700 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>
        <p className="mt-3 text-white/80">{description}</p>
        <Button size="lg" variant="secondary" className="mt-8 cursor-pointer px-8" asChild>
          <Link to={buttonLink}>{buttonText}</Link>
        </Button>
      </div>
    </section>
  )
}
