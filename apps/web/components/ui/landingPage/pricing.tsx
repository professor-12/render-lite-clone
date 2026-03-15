'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    cta: 'Get started free',
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
type Feature = {
  text: string;
  included: boolean;
};
type PriceObject = {
  monthly: number;
  annual: number;
};
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
type PlanCardProps = {
  plan: PlanProps;
  annual: boolean;
};

function PlanCard({ plan, annual }: PlanCardProps) {
  const price = annual ? plan.price.annual : plan.price.monthly;

  return (
    <div
      className={`relative rounded-xl p-8 border transition-all duration-300 hover:-translate-y-1
        ${
          plan.featured
            ? 'border-[rgba(232,255,87,0.4)] bg-linear-b from-[rgba(232,255,87,0.05)] to-[#111111] hover:border-[#e8ff57]'
            : 'border-white/8 bg-[#111111] hover:border-white/[0.14]'
        }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8ff57] text-black font-mono text-[10px] font-semibold tracking-[0.08em] uppercase px-3.5 py-1 rounded-full whitespace-nowrap">
          {plan.badge}
        </div>
      )}

      <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mb-3">
        {plan.name}
      </p>

      <div className="mb-1">
        <span className="text-[38px] font-bold text-white tracking-[-0.04em]">
          {price === 0 ? (
            'Free'
          ) : (
            <>
              <sup className="text-[20px] font-normal align-super">$</sup>
              {price}
              <sub className="text-[14px] text-[#888] font-normal">/mo</sub>
            </>
          )}
        </span>
      </div>
      {annual && price > 0 && (
        <p className="font-mono text-[11px] text-[#e8ff57] mb-2">
          Save ${(plan.price.monthly - price) * 12}/yr
        </p>
      )}

      <p className="text-[13px] text-[#888] mb-7">{plan.desc}</p>

      <ul className="space-y-0 mb-8">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className={`flex items-start gap-2.5 py-2 border-b border-white/6 text-[13.5px] last:border-b-0
              ${f.included ? 'text-[#888]' : 'text-[#555]'}`}
          >
            <span
              className={`mt-0.5 text-[12px] shrink-0 ${f.included ? 'text-[#e8ff57]' : 'text-white/20'}`}
            >
              {f.included ? '✓' : '—'}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={`block w-full text-center py-2.5 rounded-lg text-[13.5px] font-semibold border transition-all
          ${
            plan.featured
              ? 'bg-[#e8ff57] text-black border-[#e8ff57] hover:bg-[#d4eb4f]'
              : 'bg-transparent text-[#f0f0f0] border-white/[0.14] hover:border-white/30 hover:bg-white/5'
          }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-290 mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
            Pricing
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-white mb-3.5">
            Simple, honest pricing.
          </h2>
          <p className="text-[#888] text-base max-w-105 mx-auto mb-8">
            No hidden fees. Scale as you grow — start free, pay only for what you use.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#111111] border border-white/8 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                !annual ? 'bg-white text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                annual ? 'bg-white text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              Annual
              <span className="text-[10px] font-mono text-[#e8ff57] bg-[rgba(232,255,87,0.12)] px-1.5 py-0.5 rounded-full">
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-225 mx-auto">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} />
          ))}
        </div>

        <p className="text-center font-mono text-[12px] text-[#555] mt-8">
          All plans include SSL, CDN, and 99.9% uptime SLA · No credit card required to start
        </p>
      </div>
    </section>
  );
}
