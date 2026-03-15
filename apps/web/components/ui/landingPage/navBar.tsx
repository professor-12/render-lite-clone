'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Docs', href: '#' },
];

function StarburstLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <line x1="14" y1="1" x2="14" y2="8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line
        x1="14"
        y1="20"
        x2="14"
        y2="27"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line x1="1" y1="14" x2="8" y2="14" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line
        x1="20"
        y1="14"
        x2="27"
        y2="14"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="4.22"
        y1="4.22"
        x2="9.17"
        y2="9.17"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="18.83"
        y1="18.83"
        x2="23.78"
        y2="23.78"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="23.78"
        y1="4.22"
        x2="18.83"
        y2="9.17"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="9.17"
        y1="18.83"
        x2="4.22"
        y2="23.78"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
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
          scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/8' : 'bg-transparent'
        }`}
      >
        <div className="max-w-290 mx-auto px-6 flex items-center justify-between h-15">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-[15px] tracking-tight text-white"
          >
            <StarburstLogo />
            renderlite
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[#888] hover:text-white text-[13.5px] font-normal px-3.5 py-1.5 rounded-lg transition-colors hover:bg-white/6"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/auth/login"
              className="text-[#f0f0f0] text-[13px] font-medium px-4 py-1.75 rounded-lg border border-white/[0.14] hover:border-white/30 hover:bg-white/5 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-black text-[13px] font-semibold px-5 py-2 rounded-lg hover:bg-[#e8e8e8] hover:-translate-y-px transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.25 p-1.5 cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5.5 h-[1.5px] bg-[#f0f0f0] rounded transition-transform duration-300 ${
                mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`block w-5.5 h-[1.5px] bg-[#f0f0f0] rounded transition-opacity duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5.5 h-[1.5px] bg-[#f0f0f0] rounded transition-transform duration-300 ${
                mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 top-25 z-40 bg-[#0a0a0a] border-b border-white/8 transition-all duration-300 overflow-hidden md:hidden ${
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-[#f0f0f0] text-[17px] font-medium py-4 border-b border-white/8"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 mt-6 mb-2">
            <Link
              href="/auth/login"
              className="text-center text-[#f0f0f0] text-[13px] font-medium px-4 py-3 rounded-lg border border-white/[0.14]"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="text-center bg-white text-black text-[13px] font-semibold px-4 py-3 rounded-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
