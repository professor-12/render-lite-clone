'use client';

import { useRef, useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "Migrated from Heroku in an afternoon. Render Lite is faster, cheaper, and the DX is honestly better than anything I've used.",
    name: 'Amir Khalid',
    role: 'Founder · Stackflow',
    initials: 'AK',
  },
  {
    quote:
      'Our deploy time went from 8 minutes to under 30 seconds. The edge caching alone paid for the plan in the first week.',
    name: 'Sophie Laurent',
    role: 'CTO · Novu Labs',
    initials: 'SL',
  },
  {
    quote:
      'Preview environments for every PR with zero config. My team now catches bugs before they ever hit production.',
    name: 'James Mwangi',
    role: 'Lead Engineer · Halo Ops',
    initials: 'JM',
  },
  {
    quote:
      'The rollback feature saved us at 2am on a Friday. One click, zero downtime. That alone is worth the subscription.',
    name: 'Priya Nair',
    role: 'Senior Dev · Mosaic',
    initials: 'PN',
  },
  {
    quote:
      "I've shipped 4 products this year. All on Render Lite. The managed Postgres is rock solid and the CLI is a joy.",
    name: 'Tom Eriksen',
    role: 'Indie Hacker',
    initials: 'TE',
  },
  {
    quote:
      'We benchmarked Render Lite against three other platforms. Fastest cold starts, cheapest at scale, best docs.',
    name: 'Zara Okonkwo',
    role: 'DevOps Lead · Lucid',
    initials: 'ZO',
  },
];

type TestiCardProps = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  delay: number;
};

function TestiCard({ quote, name, role, initials, delay }: TestiCardProps) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.04]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity 0.5s ${delay}ms ease, transform 0.5s ${delay}ms ease, border-color 0.2s, background-color 0.2s`,
      }}
    >
      <Quote className="mb-4 h-5 w-5 text-brand-orange/80" />
      <p className="mb-6 flex-1 text-[14.5px] leading-[1.7] text-brand-cream/90">
        {quote}
      </p>
      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-[12px] font-medium text-brand-orange ring-1 ring-brand-orange/20">
          {initials}
        </div>
        <div>
          <p className="text-[13px] font-medium text-brand-cream">{name}</p>
          <p className="font-mono text-[11px] text-brand-muted-soft">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-cream/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Reviews
          </span>
          <h2 className="mb-4 text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.05] tracking-[-0.035em] text-brand-cream">
            Loved by{' '}
            <span className="font-serif-display italic">developers</span>
            <span className="text-brand-orange">.</span>
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-brand-muted-soft">
            From solo hackers to full product teams — here&apos;s what they say.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestiCard key={t.name} {...t} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
