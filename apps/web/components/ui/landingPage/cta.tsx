import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative py-24 px-6 bg-[#111111] border-t border-white/8 overflow-hidden text-center">
      {/* Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-200 rounded-full bg-[radial-gradient(circle,rgba(232,255,87,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-160 mx-auto">
        <h2 className="text-[clamp(32px,5vw,58px)] font-extrabold tracking-[-0.04em] text-white mb-4">
          Ready to ship?
        </h2>
        <p className="text-[#888] text-[16px] mb-10">
          Join thousands of developers deploying with Render Lite today.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/auth/login"
            className="bg-white text-black text-[14.5px] font-semibold px-7 py-3.5 rounded-[10px] hover:bg-[#e8e8e8] hover:-translate-y-px transition-all"
          >
            Start deploying — it's free
          </Link>
          <Link
            href="#"
            className="text-[#f0f0f0] text-[14.5px] font-medium px-7 py-3.5 rounded-[10px] border border-white/[0.14] hover:border-white/30 hover:bg-white/5 transition-all"
          >
            Read the docs
          </Link>
        </div>

        <p className="mt-5 font-mono text-[12px] text-[#555]">
          No credit card required · Free tier forever · Cancel anytime
        </p>
      </div>
    </section>
  );
}
