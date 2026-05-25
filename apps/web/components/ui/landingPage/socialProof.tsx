const FRAMEWORKS = [
  'Next.js',
  'Django',
  'FastAPI',
  'React',
  'Express',
  'Laravel',
  'Rails',
  'Go',
  'Rust',
  'Nuxt',
];

export default function SocialProof() {
  return (
    <section className="relative border-y border-white/[0.06] bg-black py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">
          Trusted by teams building on
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {FRAMEWORKS.map((fw) => (
            <span
              key={fw}
              className="font-serif-display text-[22px] tracking-tight text-brand-cream/45 transition-colors duration-300 hover:text-brand-cream"
            >
              {fw}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
