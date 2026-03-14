const FRAMEWORKS = [
  "Next.js", "Django", "FastAPI", "React", "Express",
  "Laravel", "Rails", "Go", "Rust", "Nuxt",
];

export default function SocialProof() {
  return (
    <section className="border-y border-white/[0.08] py-12">
      <div className="max-w-[1160px] mx-auto px-6">
        <p className="text-center font-mono text-[11px] tracking-[0.1em] uppercase text-[#888] mb-7">
          Trusted by teams building on
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
          {FRAMEWORKS.map((fw) => (
            <span key={fw} className="font-mono text-[13px] text-[#f0f0f0] tracking-[0.05em] font-medium">
              {fw}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}