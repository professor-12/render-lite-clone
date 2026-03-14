"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

const STATS = [
  { value: "99.98%", label: "Uptime this year",      accent: "text-[#e8ff57]" },
  { value: "12k+",   label: "Daily deployments",     accent: "text-white" },
  { value: "2021",   label: "Founded",               accent: "text-white" },
  { value: "140+",   label: "Edge regions",          accent: "text-[#57d9ff]" },
];

export default function About() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 px-6 bg-[#111111]">
      <div className="max-w-290 mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
        >
          {/* Left — copy */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
              About
            </span>

            <h2 className="text-[clamp(26px,3.5vw,40px)] font-bold tracking-[-0.03em] text-white mb-5 leading-[1.15]">
              Built by developers,<br />for developers.
            </h2>

            <p className="text-[#888] text-[15px] leading-[1.8] mb-4">
              Render Lite started as a frustration — deploying apps shouldn&apos;t require a dedicated DevOps team. We built the platform we always wanted: fast, honest, and entirely focused on developer experience.
            </p>
            <p className="text-[#888] text-[15px] leading-[1.8]">
              Today, thousands of teams use Render Lite to ship everything from weekend prototypes to production services handling millions of requests. We're independent, profitable, and obsessed with reliability.
            </p>

            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href="#"
                className="bg-white text-black text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e8e8e8] transition-all"
              >
                Read our story
              </Link>
              <Link
                href="#"
                className="text-[#f0f0f0] text-[13px] font-medium px-5 py-2.5 rounded-lg border border-white/[0.14] hover:border-white/30 hover:bg-white/5 transition-all"
              >
                Join the team →
              </Link>
            </div>
          </div>

          {/* Right — stat boxes */}
          <div
            className="grid grid-cols-2 gap-3.5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition: "opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-[#0a0a0a] border border-white/8 rounded-xl p-6 hover:border-white/[0.14] transition-colors"
              >
                <strong className={`block text-[30px] font-bold tracking-[-0.03em] mb-1 ${s.accent}`}>
                  {s.value}
                </strong>
                <span className="font-mono text-[12px] text-[#888]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}