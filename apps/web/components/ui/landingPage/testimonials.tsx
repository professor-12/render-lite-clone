"use client";

import { useRef, useEffect, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Migrated from Heroku in an afternoon. Render Lite is faster, cheaper, and the DX is honestly better than anything I've used.",
    name: "Amir Khalid",
    role: "Founder @ Stackflow",
    initials: "AK",
  },
  {
    quote:
      "Our deploy time went from 8 minutes to under 30 seconds. The edge caching alone paid for the plan in the first week.",
    name: "Sophie Laurent",
    role: "CTO @ Novu Labs",
    initials: "SL",
  },
  {
    quote:
      "Preview environments for every PR with zero config. My team now catches bugs before they ever hit production.",
    name: "James Mwangi",
    role: "Lead Engineer @ Halo Ops",
    initials: "JM",
  },
  {
    quote:
      "The rollback feature saved us at 2am on a Friday. One click, zero downtime. That alone is worth the subscription.",
    name: "Priya Nair",
    role: "Senior Dev @ Mosaic",
    initials: "PN",
  },
  {
    quote:
      "I've shipped 4 products this year. All on Render Lite. The managed Postgres is rock solid and the CLI is a joy.",
    name: "Tom Eriksen",
    role: "Indie Hacker",
    initials: "TE",
  },
  {
    quote:
      "We benchmarked Render Lite against three other platforms. Fastest cold starts, cheapest at scale, best docs.",
    name: "Zara Okonkwo",
    role: "DevOps Lead @ Lucid",
    initials: "ZO",
  },
];
type TestiCardProps = {
    quote:string,
    name:string,
    role:string,
    initials:string,
    delay:number,
}

function TestiCard({ quote, name, role, initials, delay }:TestiCardProps) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#111111] border border-white/[0.08] rounded-xl p-7 hover:border-white/[0.14] transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(18px)",
        transition: `opacity 0.5s ${delay}ms ease, transform 0.5s ${delay}ms ease, border-color 0.2s`,
      }}
    >
      <p className="text-[14px] text-[#f0f0f0] leading-[1.7] mb-5">
        <span className="text-[#e8ff57] text-[18px] leading-none align-[-3px] mr-0.5">"</span>
        {quote}
        <span className="text-[#e8ff57] text-[18px] leading-none align-[-3px] ml-0.5">"</span>
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#181818] border border-white/[0.14] flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white">{name}</p>
          <p className="font-mono text-[11px] text-[#888]">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-[1160px] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
            Reviews
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-white mb-3.5">
            Loved by developers.
          </h2>
          <p className="text-[#888] text-base max-w-[400px] mx-auto">
            From solo hackers to full product teams — here's what they say.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <TestiCard key={t.name} {...t} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}