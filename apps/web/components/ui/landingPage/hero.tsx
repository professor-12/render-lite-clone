'use client';

import Link from 'next/link';
import { ArrowUpRight, Play, Check } from 'lucide-react';

const STATS = [
  { value: '12k+', label: 'deployments / day' },
  { value: '99.98%', label: 'uptime SLA' },
  { value: '<3s', label: 'cold start' },
  { value: '140+', label: 'edge regions' },
];

const TERMINAL_LINES = [
  { type: 'cmd', text: 'rl deploy --prod' },
  { type: 'out', text: 'Detecting framework… Next.js 15' },
  { type: 'out', text: 'Building project…' },
  { type: 'out', text: 'Pushing to edge network…' },
  { type: 'success', text: 'Deployed → myapp.renderlite.app' },
  { type: 'success', text: 'Live in 2.4s', cursor: true },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center grain-overlay">
      {/* Soft warm glow centered behind hero */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-[55%] rounded-full warm-glow opacity-90" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Eyebrow badge */}
        <div className="mb-8 animate-fadeUp opacity-0" style={{ animationFillMode: 'forwards' }}>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-brand-cream/90 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-orange" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
            </span>
            Now in public beta — join the launch
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>

        {/* Headline — sans + italic serif accent */}
        <h1
          className="mb-7 animate-fadeUp text-[clamp(48px,7.2vw,88px)] font-medium leading-[1.02] tracking-[-0.04em] text-brand-cream opacity-0"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          Deploy anything,
          <br />
          <span className="font-serif-display italic text-brand-cream">
            instantly
          </span>
          <span className="text-brand-orange">.</span>
        </h1>

        {/* Subheading */}
        <p
          className="mx-auto mb-10 max-w-[600px] animate-fadeUp text-[clamp(16px,2vw,19px)] font-normal leading-[1.6] text-brand-muted-soft opacity-0"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          The minimalist cloud platform for shipping software at the speed of thought.
          From git push to live URL in seconds — no DevOps required.
        </p>

        {/* CTAs */}
        <div
          className="flex animate-fadeUp flex-wrap justify-center gap-3 opacity-0"
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          <Link
            href="/auth/login"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-cream px-6 py-3 text-[14px] font-medium text-black transition-all hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(245,244,238,0.4)]"
          >
            Start deploying free
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-[14px] font-medium text-brand-cream backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.07]"
          >
            <Play className="h-4 w-4" />
            Watch demo
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mt-16 flex animate-fadeUp flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-0"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-10">
              <div className="text-center">
                <strong className="block text-[24px] font-medium tracking-[-0.03em] text-brand-cream">
                  {s.value}
                </strong>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-muted">
                  {s.label}
                </span>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden h-8 w-px bg-white/10 sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal */}
      <div
        className="relative z-10 mt-20 w-full max-w-xl animate-fadeUp opacity-0"
        style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-1.5 border-b border-white/[0.05] bg-[#0a0a0a] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-brand-muted">
              ~/myapp · renderlite
            </span>
          </div>
          <div className="px-6 py-5 text-left font-mono text-[13px] leading-[1.85]">
            {TERMINAL_LINES.map((line, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {line.type === 'cmd' && (
                  <>
                    <span className="select-none text-brand-orange">›</span>
                    <span className="text-brand-cream">{line.text}</span>
                  </>
                )}
                {line.type === 'out' && (
                  <span className="pl-4 text-brand-muted">{line.text}</span>
                )}
                {line.type === 'success' && (
                  <span className="inline-flex items-center gap-2 pl-4 text-emerald-400/90">
                    <Check className="h-3.5 w-3.5" />
                    {line.text}
                    {line.cursor && (
                      <span className="ml-1 inline-block h-3.5 w-1.5 animate-blink bg-brand-orange align-middle" />
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
