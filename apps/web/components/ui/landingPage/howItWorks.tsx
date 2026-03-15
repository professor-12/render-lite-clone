'use client';

import { useRef, useEffect, useState } from 'react';

type StepsProps = {
  num: string;
  title: string;
  desc: string;
  delay?: number;
};
const STEPS = [
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
    desc: 'Your app gets a public URL the moment the build completes. Add your custom domain in one click — SSL included, always.',
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
      <div className="w-14 h-14 rounded-full border border-white/[0.14] bg-[#0a0a0a] flex items-center justify-center mx-auto mb-5 font-mono text-[13px] font-medium text-[#e8ff57]">
        {num}
      </div>
      <h3 className="text-[15px] font-semibold text-white mb-2.5">{title}</h3>
      <p className="text-[13.5px] text-[#888] leading-[1.65] max-w-65 mx-auto">{desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#111111]">
      <div className="max-w-290 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
            How it works
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em] text-white mb-3.5">
            Deploy in three steps.
          </h2>
          <p className="text-[#888] text-base max-w-105 mx-auto">
            No YAML files. No Kubernetes expertise. Just push and ship.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-7 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px bg-linear-r from-[#e8ff57] to-[#57d9ff] opacity-20" />

          {STEPS.map((s, i) => (
            <Step key={s.num} {...s} delay={i * 120} />
          ))}
        </div>

        {/* Code snippet */}
        <div className="mt-16 bg-[#0a0a0a] border border-white/8 rounded-xl overflow-hidden max-w-145 mx-auto">
          <div className="bg-[#181818] px-4 py-2.5 flex items-center gap-1.5 border-b border-white/8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="font-mono text-[11px] text-[#888] ml-1">renderlite.config.js</span>
          </div>
          <pre className="font-mono text-[13px] text-[#f0f0f0] px-5 py-5 leading-[1.85] overflow-x-auto">
            {`/** @type {import('renderlite').Config} */
const config = {
  name: `}
            <span className="text-[#e8ff57]">"my-app"</span>
            {`,
  region: `}
            <span className="text-[#57d9ff]">["iad1", "cdg1", "sin1"]</span>
            {`,
  env: {
    NODE_ENV: `}
            <span className="text-[#e8ff57]">"production"</span>
            {`,
  },
  build: {
    command: `}
            <span className="text-[#e8ff57]">"pnpm build"</span>
            {`,
    output:  `}
            <span className="text-[#e8ff57]">".next"</span>
            {`,
  },
};

`}
            <span className="text-[#888]">export default</span>
            {` config;`}
          </pre>
        </div>
      </div>
    </section>
  );
}
