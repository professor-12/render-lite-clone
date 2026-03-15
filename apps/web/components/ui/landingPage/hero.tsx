'use client';

import Link from 'next/link';

const STATS = [
  { value: '12k+', label: 'deployments / day' },
  { value: '99.98%', label: 'uptime SLA' },
  { value: '<3s', label: 'cold start' },
  { value: '140+', label: 'edge regions' },
];

const TERMINAL_LINES = [
  { type: 'cmd', text: 'rl deploy --prod' },
  { type: 'out', text: '⠸ Detecting framework… Next.js 15' },
  { type: 'out', text: '⠸ Building project…' },
  { type: 'out', text: '⠸ Pushing to edge network…' },
  { type: 'success', text: '✓ Deployed → https://myapp.renderlite.app' },
  { type: 'success', text: '✓ Live in 2.4s', cursor: true },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(232,255,87,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[60%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(87,217,255,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-[800px] w-full">
        {/* Badge */}
        <div className="mb-7 animate-fadeUp opacity-0" style={{ animationFillMode: 'forwards' }}>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-[#e8ff57] bg-[rgba(232,255,87,0.08)] border border-[rgba(232,255,87,0.2)] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff57] animate-pulse" />
            Now in Public Beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(44px,7vw,80px)] font-extrabold leading-[1.0] tracking-[-0.04em] text-white mb-6 animate-fadeUp opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          Deploy faster.{' '}
          <span className="bg-gradient-to-r from-[#e8ff57] to-[#57d9ff] bg-clip-text text-transparent">
            Scale effortlessly.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-[clamp(16px,2vw,19px)] text-[#888] font-light max-w-[560px] mx-auto mb-10 leading-[1.7] animate-fadeUp opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          Render Lite gives your team instant cloud deployments — from git push to live URL in
          seconds. No DevOps needed.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap animate-fadeUp opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <Link
            href="/auth/login"
            className="bg-white text-black text-[14.5px] font-semibold px-7 py-3.5 rounded-[10px] hover:bg-[#e8e8e8] hover:-translate-y-px transition-all"
          >
            Start deploying free →
          </Link>
          <Link
            href="#how-it-works"
            className="text-[#f0f0f0] text-[14.5px] font-medium px-7 py-3.5 rounded-[10px] border border-white/[0.14] hover:border-white/30 hover:bg-white/[0.05] transition-all"
          >
            See how it works
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 animate-fadeUp opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6">
              <div className="text-center">
                <strong className="block text-[26px] font-bold text-white tracking-[-0.03em]">
                  {s.value}
                </strong>
                <span className="text-[12px] text-[#888] font-mono">{s.label}</span>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal */}
      <div className="relative z-10 mt-16 w-full max-w-[560px] animate-fadeUp opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        {/* Terminal bar */}
        <div className="bg-[#181818] border border-white/[0.08] border-b-0 rounded-t-xl px-3.5 py-2.5 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="font-mono text-[11px] text-[#888] ml-1">bash — renderlite deploy</span>
        </div>
        {/* Terminal body */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-b-xl px-5 py-4 font-mono text-[13px] leading-[1.8] text-left">
          {TERMINAL_LINES.map((line, i) => (
            <div key={i} className="flex gap-2.5">
              {line.type === 'cmd' && (
                <>
                  <span className="text-[#e8ff57] select-none">$</span>
                  <span className="text-[#f0f0f0]">{line.text}</span>
                </>
              )}
              {line.type === 'out' && <span className="text-[#888] pl-4">{line.text}</span>}
              {line.type === 'success' && (
                <span className="text-[#4ade80] pl-4">
                  {line.text}
                  {line.cursor && (
                    <span className="inline-block w-2 h-3.5 bg-[#e8ff57] ml-1 align-middle animate-blink" />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
