import Link from 'next/link';
import React from 'react';

function RenderLiteMark() {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-brand-cream" />
      <span className="absolute inset-[3px] rounded-full bg-black" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-brand-cream" />
    </span>
  );
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-black text-brand-cream grain-overlay">
      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full warm-glow opacity-60" />

      <header className="relative z-10 mx-auto flex w-[90%] shrink-0 items-center justify-between py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-brand-cream"
        >
          <RenderLiteMark />
          <span className="flex items-baseline gap-1">
            renderlite
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-center justify-center">
        {children}
      </main>

      <footer className="relative z-10 mx-auto flex w-[90%] shrink-0 items-center justify-center py-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-muted">
          © {new Date().getFullYear()} Render Lite
        </p>
      </footer>
    </div>
  );
};

export default Layout;
