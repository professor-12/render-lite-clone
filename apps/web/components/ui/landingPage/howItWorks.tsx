'use client';

import { useRef, useEffect, useState } from 'react';

type StepsProps = {
  num: string;
  title: string;
  desc: string;
  delay?: number;
};

const STEPS: StepsProps[] = [
  {
    num: '01',
    title: 'Connect your repo',
    desc: 'Link your GitHub account and select a repository. We detect your framework and configure build settings automatically.',
  },
  {
    num: '02',
    title: 'Configure & build',
    desc: 'Set environment variables, build commands, and target regions. We handle Docker, Node, Python, Go, and more natively.',
  },
  {
    num: '03',
    title: 'Go live instantly',
    desc: 'Your app gets a public URL the moment the build completes. Add a custom domain in one click — SSL included, always.',
  },
];

function Step({ num, title, desc, delay }: StepsProps) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease`,
      }}
    >
      <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-black">
        <span className="absolute inset-0 rounded-full bg-brand-orange/[0.06]" />
        <span className="relative font-serif-display text-[18px] italic text-brand-orange">
          {num}
        </span>
      </div>
      <h3 className="mb-3 text-[17px] font-medium tracking-tight text-brand-cream">
        {title}
      </h3>
      <p className="mx-auto max-w-[260px] text-[13.5px] leading-[1.7] text-brand-muted-soft">
        {desc}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-brand-cream px-6 py-28 text-brand-ink"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-ink/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            How it works
          </span>
          <h2 className="mb-4 text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.05] tracking-[-0.035em]">
            Deploy in three{' '}
            <span className="font-serif-display italic">steps</span>
            <span className="text-brand-orange">.</span>
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-brand-muted">
            No YAML. No Kubernetes expertise. Just push and ship.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Connector line — desktop only */}
          <div className="absolute top-7 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] hidden h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent md:block" />

          {STEPS.map((s, i) => (
            <Step key={s.num} {...s} delay={i * 120} />
          ))}
        </div>

        {/* Code snippet card */}
        <div className="mx-auto mt-20 max-w-2xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-brand-beige/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-brand-muted">
              renderlite.config.ts
            </span>
          </div>
          <pre className="overflow-x-auto px-6 py-5 font-mono text-[13px] leading-[1.85] text-brand-ink">
{`/** @type {import('renderlite').Config} */
const config = {
  name: `}
            <span className="text-brand-orange">"my-app"</span>
            {`,
  region: `}
            <span className="text-brand-orange">["iad1", "cdg1", "sin1"]</span>
            {`,
  env: {
    NODE_ENV: `}
            <span className="text-brand-orange">"production"</span>
            {`,
  },
  build: {
    command: `}
            <span className="text-brand-orange">"pnpm build"</span>
            {`,
    output:  `}
            <span className="text-brand-orange">".next"</span>
            {`,
  },
};

`}
            <span className="text-brand-muted">export default</span>
            {` config;`}
          </pre>
        </div>
      </div>
    </section>
  );
}
