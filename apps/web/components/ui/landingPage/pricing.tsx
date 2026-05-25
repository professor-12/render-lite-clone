'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus, ArrowUpRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Hobby',
    price: { monthly: 0, annual: 0 },
    desc: 'Perfect for side projects and prototypes.',
    features: [
      { text: '3 projects', included: true },
      { text: '100 GB bandwidth / mo', included: true },
      { text: 'Shared compute', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domains', included: false },
      { text: 'Team members', included: false },
    ],
    cta: 'Get started',
    href: '/auth/login',
    featured: false,
  },
  {
    name: 'Pro',
    price: { monthly: 18, annual: 14 },
    desc: 'For developers and small teams shipping fast.',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: '500 GB bandwidth / mo', included: true },
      { text: 'Dedicated compute', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom domains + SSL', included: true },
      { text: 'Up to 5 team members', included: true },
    ],
    cta: 'Start free trial',
    href: '/auth/login',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Team',
    price: { monthly: 49, annual: 39 },
    desc: 'For growing teams with production workloads.',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: '2 TB bandwidth / mo', included: true },
      { text: 'Autoscaling compute', included: true },
      { text: 'Slack + email support', included: true },
      { text: 'Custom domains + SSL', included: true },
      { text: 'Unlimited team members', included: true },
    ],
    cta: 'Contact sales',
    href: '/auth/login',
    featured: false,
  },
];

type Feature = { text: string; included: boolean };
type PriceObject = { monthly: number; annual: number };
type PlanProps = {
  name: string;
  price: PriceObject;
  desc: string;
  features: Feature[];
  cta: string;
  href: string;
  featured: boolean;
  badge?: string;
};
type PlanCardProps = { plan: PlanProps; annual: boolean };

function PlanCard({ plan, annual }: PlanCardProps) {
  const price = annual ? plan.price.annual : plan.price.monthly;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300
        ${
          plan.featured
            ? 'border border-brand-orange/30 bg-gradient-to-b from-brand-orange/[0.06] to-transparent shadow-[0_30px_60px_-30px_rgba(251,92,28,0.3)]'
            : 'border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]'
        }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-3.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white">
          {plan.badge}
        </div>
      )}

      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-muted-soft">
        {plan.name}
      </p>

      <div className="mb-1">
        <span className="text-[40px] font-medium tracking-[-0.04em] text-brand-cream">
          {price === 0 ? (
            'Free'
          ) : (
            <>
              <sup className="align-super text-[18px] font-normal text-brand-muted-soft">
                $
              </sup>
              {price}
              <sub className="text-[14px] font-normal text-brand-muted-soft">/mo</sub>
            </>
          )}
        </span>
      </div>
      {annual && price > 0 && (
        <p className="mb-2 font-mono text-[11px] text-brand-orange">
          Save ${(plan.price.monthly - price) * 12}/yr
        </p>
      )}

      <p className="mb-7 text-[13.5px] leading-relaxed text-brand-muted-soft">
        {plan.desc}
      </p>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className={`flex items-start gap-2.5 text-[13.5px]
              ${f.included ? 'text-brand-cream/85' : 'text-brand-muted/70 line-through decoration-white/10'}`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                f.included ? 'bg-brand-orange/15 text-brand-orange' : 'bg-white/[0.05] text-brand-muted'
              }`}
            >
              {f.included ? (
                <Check className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium transition-all
          ${
            plan.featured
              ? 'bg-brand-orange text-white hover:bg-brand-orange/90'
              : 'border border-white/[0.14] bg-white/[0.02] text-brand-cream hover:border-white/30 hover:bg-white/[0.06]'
          }`}
      >
        {plan.cta}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
      </Link>
    </div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-cream/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Pricing
          </span>
          <h2 className="mb-4 text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.05] tracking-[-0.035em] text-brand-cream">
            Simple,{' '}
            <span className="font-serif-display italic">honest</span> pricing
            <span className="text-brand-orange">.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-brand-muted-soft">
            No hidden fees. Scale as you grow — start free, pay only for what you use.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                !annual
                  ? 'bg-brand-cream text-black'
                  : 'text-brand-muted-soft hover:text-brand-cream'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                annual
                  ? 'bg-brand-cream text-black'
                  : 'text-brand-muted-soft hover:text-brand-cream'
              }`}
            >
              Annual
              <span className="rounded-full bg-brand-orange/15 px-1.5 py-0.5 font-mono text-[10px] text-brand-orange">
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} />
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[12px] text-brand-muted">
          All plans include SSL, CDN, and 99.9% uptime SLA · No credit card required
        </p>
      </div>
    </section>
  );
}
