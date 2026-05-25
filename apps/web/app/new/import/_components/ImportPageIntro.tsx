export function ImportPageIntro() {
  return (
    <>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-cream/80">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
        Step 2 of 3
      </div>
      <h1 className="mt-4 text-[clamp(32px,4.5vw,42px)] font-medium leading-[1.05] tracking-[-0.035em] text-brand-cream">
        Configure &amp; <span className="font-serif-display italic">deploy</span>
        <span className="text-brand-orange">.</span>
      </h1>
      <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-brand-muted-soft">
        Set up your build settings, then ship to the global edge.
      </p>
    </>
  );
}
