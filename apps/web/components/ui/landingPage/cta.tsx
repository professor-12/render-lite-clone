import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-black px-6 py-28 text-center grain-overlay">
      {/* Warm radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full warm-glow" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-5 text-[clamp(38px,5.5vw,68px)] font-medium leading-[1.02] tracking-[-0.04em] text-brand-cream">
          Ready to{' '}
          <span className="font-serif-display italic">ship</span>
          <span className="text-brand-orange">?</span>
        </h2>
        <p className="mx-auto mb-10 max-w-md text-[16px] leading-relaxed text-brand-muted-soft">
          Join thousands of developers deploying with Render Lite today.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/login"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-cream px-7 py-3.5 text-[14.5px] font-medium text-black transition-all hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(245,244,238,0.4)]"
          >
            Start deploying — it&apos;s free
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-[14.5px] font-medium text-brand-cream backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.07]"
          >
            Read the docs
          </Link>
        </div>

        <p className="mt-6 font-mono text-[12px] text-brand-muted">
          No credit card required · Free tier forever · Cancel anytime
        </p>
      </div>
    </section>
  );
}
