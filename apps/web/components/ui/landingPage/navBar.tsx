'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, X, Menu } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Platform', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Docs', href: '#' },
];

function RenderLiteMark() {
  // ElevenLabs-style circular dot mark with a refined ring
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-brand-cream" />
      <span className="absolute inset-[3px] rounded-full bg-black" />
      <span className="relative h-2 w-2 rounded-full bg-brand-cream" />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-brand-cream"
          >
            <RenderLiteMark />
            <span className="flex items-baseline gap-1">
              renderlite
              <span className="font-serif-display text-brand-orange text-[15px] leading-none">
                .
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-1.5 text-[13.5px] font-normal text-brand-muted-soft transition-colors hover:bg-white/[0.05] hover:text-brand-cream"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-[13px] font-medium text-brand-cream transition-colors hover:bg-white/[0.06]"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-1.5 rounded-full bg-brand-cream px-4 py-2 text-[13px] font-medium text-black transition-all hover:bg-white"
            >
              Get started
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="flex items-center justify-center rounded-full p-1.5 text-brand-cream md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 top-16 z-40 overflow-hidden border-b border-white/[0.06] bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/[0.06] py-4 text-[16px] font-medium text-brand-cream"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-6 mb-2 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              className="rounded-full border border-white/[0.14] px-4 py-3 text-center text-[13px] font-medium text-brand-cream"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-brand-cream px-4 py-3 text-center text-[13px] font-semibold text-black"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
