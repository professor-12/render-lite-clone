import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Status', 'Roadmap'],
  },
  {
    heading: 'Developers',
    links: ['Documentation', 'API Reference', 'CLI', 'Templates', 'Integrations'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Privacy', 'Terms'],
  },
];

function RenderLiteMark() {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-brand-cream" />
      <span className="absolute inset-[3px] rounded-full bg-black" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-brand-cream" />
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black px-6 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-brand-cream"
            >
              <RenderLiteMark />
              <span className="flex items-baseline gap-1">
                renderlite
                <span className="font-serif-display text-brand-orange text-[15px] leading-none">
                  .
                </span>
              </span>
            </Link>
            <p className="mb-6 max-w-[240px] text-[13.5px] leading-[1.7] text-brand-muted-soft">
              Deploy anything, instantly. The cloud platform built for the speed of modern
              development.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-brand-muted-soft transition-colors hover:border-white/20 hover:text-brand-cream"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="X / Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-brand-muted-soft transition-colors hover:border-white/20 hover:text-brand-cream"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="Discord"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-brand-muted-soft transition-colors hover:border-white/20 hover:text-brand-cream"
              >
                <SiDiscord className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-muted">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[13.5px] text-brand-muted-soft transition-colors hover:text-brand-cream"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 font-mono text-[12px] text-brand-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Render Lite, Inc. All rights reserved.</span>
          <span>Crafted with obsession for developer experience.</span>
        </div>
      </div>
    </footer>
  );
}
