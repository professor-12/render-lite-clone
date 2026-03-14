"use client";

import { useRef, useEffect, useState } from "react";

type FeatureCardProps = {
    icon:string,
    name:string,
    desc:string
}
const FEATURES = [
  {
    icon: "⚡",
    name: "Instant Deployments",
    desc: "Push to git and go live in seconds. Our build pipeline auto-detects and configures every major framework out of the box.",
  },
  {
    icon: "🌍",
    name: "Global Edge Network",
    desc: "140+ PoPs worldwide. Your app is served from the edge closest to your users, cutting latency to single-digit milliseconds.",
  },
  {
    icon: "🔁",
    name: "Auto Rollbacks",
    desc: "Every deploy is versioned. Something breaks? One click to roll back to any previous deployment — zero downtime.",
  },
  {
    icon: "🔐",
    name: "Env & Secrets",
    desc: "Manage environment variables per project and per branch. Encrypted at rest, injected at build time — never leaked.",
  },
  {
    icon: "📊",
    name: "Real-time Logs",
    desc: "Build logs, runtime logs, and request traces live in your dashboard. No third-party logging setup required.",
  },
  {
    icon: "🗄️",
    name: "Managed Databases",
    desc: "Postgres, Redis, and MySQL — provisioned in one click, auto-scaled, auto-backed-up, and zero-config.",
  },
];

function FeatureCard({ icon, name, desc }:FeatureCardProps) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative bg-[#0a0a0a] p-8 overflow-hidden transition-all duration-500 hover:bg-[#111111]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ transition: "opacity 0.5s ease, transform 0.5s ease, background 0.3s" }}
    >
      {/* hover accent glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(232,255,87,0.04)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="w-11 h-11 rounded-[10px] bg-[#181818] border border-white/[0.14] flex items-center justify-center text-[20px] mb-5">
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold text-white mb-2.5">{name}</h3>
        <p className="text-[13.5px] text-[#888] leading-[1.65]">{desc}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
            Platform
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-white mb-3.5">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="text-[#888] text-base max-w-115 mx-auto">
            A hosting platform built for speed — from your first commit to production scale.
          </p>
        </div>

        {/* Grid — 3 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-white/8 border border-white/8 rounded-xl overflow-hidden">
          {FEATURES.map((f) => (
            <FeatureCard key={f.name} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}