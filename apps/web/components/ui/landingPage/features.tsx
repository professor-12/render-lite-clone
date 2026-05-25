'use client';

import { useRef, useEffect, useState, type ComponentType } from 'react';
import {
  Zap,
  Globe,
  Undo2,
  Key,
  Terminal,
  Database,
} from 'lucide-react';

type FeatureCardProps = {
  Icon: ComponentType<{ className?: string }>;
  name: string;
  desc: string;
};

const FEATURES: FeatureCardProps[] = [
  {
    Icon: Zap,
    name: 'Instant deployments',
    desc: 'Push to git and go live in seconds. Our build pipeline auto-detects every major framework — no config required.',
  },
  {
    Icon: Globe,
    name: 'Global edge network',
    desc: '140+ PoPs worldwide. Your app is served from the edge closest to your users, with single-digit ms latency.',
  },
  {
    Icon: Undo2,
    name: 'Atomic rollbacks',
    desc: 'Every deploy is versioned and immutable. One click to roll back to any previous build — zero downtime.',
  },
  {
    Icon: Key,
    name: 'Env & secrets',
    desc: 'Environment variables per project and per branch. Encrypted at rest, injected at build time — never leaked.',
  },
  {
    Icon: Terminal,
    name: 'Real-time logs',
    desc: 'Build logs, runtime logs, and request traces — streamed live to your dashboard. No third-party setup.',
  },
  {
    Icon: Database,
    name: 'Managed databases',
    desc: 'Postgres, Redis, and MySQL — provisioned in one click, auto-scaled, auto-backed-up, and zero-config.',
  },
];

function FeatureCard({ Icon, name, desc }: FeatureCardProps) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden bg-black p-8 transition-all duration-500 hover:bg-white/[0.02]
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-brand-orange transition-colors group-hover:border-brand-orange/30 group-hover:bg-brand-orange/[0.07]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2.5 text-[16px] font-medium tracking-tight text-brand-cream">
          {name}
        </h3>
        <p className="text-[13.5px] leading-[1.65] text-brand-muted-soft">{desc}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-cream/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Platform
          </span>
          <h2 className="mb-4 text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.05] tracking-[-0.035em] text-brand-cream">
            Everything you need.{' '}
            <span className="font-serif-display italic text-brand-cream/80">
              Nothing you don't.
            </span>
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-brand-muted-soft">
            A hosting platform built for speed — from your first commit to production scale.
          </p>
        </div>

        {/* Grid — bordered cells, no rounded outer */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] divide-x divide-y divide-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.name} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
