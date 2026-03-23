import { useState } from 'react'
import PageHero from '@/components/PageHero'
import CTASection from '@/components/CTASection'
import { FAQ_CATEGORIES } from '@/data/faqData'
import { ChevronDown } from 'lucide-react'

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium cursor-pointer hover:text-primary transition-colors"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0)

  return (
    <>
      <PageHero title="Frequently Asked Questions" subtitle="Find answers to common questions about our hosting services" />

      <section className="mx-auto max-w-3xl px-4 py-16">
        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FAQ_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                activeCategory === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="rounded-lg border border-border">
          <div className="px-4">
            {FAQ_CATEGORIES[activeCategory].items.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        heading="Still Have Questions?"
        description="Our support team is available 24/7 to help you."
        buttonText="Contact Support"
        buttonLink="/contact"
      />
    </>
  )
}
