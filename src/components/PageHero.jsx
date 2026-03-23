export default function PageHero({ title, subtitle }) {
  return (
    <section className="bg-gradient-to-br from-primary/90 to-purple-800 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-white/80">{subtitle}</p>}
      </div>
    </section>
  )
}
