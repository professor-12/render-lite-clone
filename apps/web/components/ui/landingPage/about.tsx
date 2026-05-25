'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const STATS = [
  { value: '99.98%', label: 'Uptime this year', accent: true },
  { value: '12k+', label: 'Daily deployments', accent: false },
  { value: '2021', label: 'Founded', accent: false },
  { value: '140+', label: 'Edge regions', accent: true },
];

export default function About() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-brand-cream px-6 py-28 text-brand-ink"
    >
      <div className="mx-auto max-w-6xl">
        <div
          ref={ref}
          className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24"
        >
          {/* Left — copy */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-ink/70">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              About
            </span>

            <h2 className="mb-6 text-[clamp(28px,3.8vw,46px)] font-medium leading-[1.1] tracking-[-0.035em]">
              Built by developers,
              <br />
              <span className="font-serif-display italic">for developers</span>
              <span className="text-brand-orange">.</span>
            </h2>

            <p className="mb-4 text-[15.5px] leading-[1.75] text-brand-muted">
              Render Lite started as a frustration — deploying apps shouldn&apos;t require a
              dedicated DevOps team. We built the platform we always wanted: fast, honest,
              and entirely focused on developer experience.
            </p>
            <p className="text-[15.5px] leading-[1.75] text-brand-muted">
              Today, thousands of teams use Render Lite to ship everything from weekend
              prototypes to production services handling millions of requests. We&apos;re
              independent, profitable, and obsessed with reliability.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-[13px] font-medium text-brand-cream transition-all hover:bg-brand-ink-soft"
              >
                Read our story
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-transparent px-5 py-2.5 text-[13px] font-medium text-brand-ink transition-all hover:border-black/30 hover:bg-black/[0.04]"
              >
                Join the team
              </Link>
            </div>
          </div>

          {/* Right — stat boxes */}
          <div
            className="grid grid-cols-2 gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease',
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-black/[0.08] bg-white p-7 transition-colors hover:border-black/[0.16]"
              >
                <strong
                  className={`mb-2 block text-[34px] font-medium tracking-[-0.035em] ${s.accent ? 'text-brand-orange' : 'text-brand-ink'}`}
                >
                  {s.value}
                </strong>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-muted">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
