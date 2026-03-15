import Link from 'next/link';

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

function StarburstLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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

export default function Footer() {
  return (
    <footer className="border-t border-white/8 pt-14 pb-8 px-6">
      <div className="max-w-290 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-[15px] tracking-tight text-white mb-3.5"
            >
              <StarburstLogo />
              renderlite
            </Link>
            <p className="text-[13px] text-[#888] leading-[1.7] max-w-55">
              Deploy anything, instantly. The cloud platform built for the speed of modern
              development.
            </p>
          </div>

          {/* Cols */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-[11px] uppercase tracking-widesttext-[#888] mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[13.5px] text-[#888] hover:text-white transition-colors"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/8 font-mono text-[12px] text-[#555]">
          <span>© {new Date().getFullYear()} Render Lite, Inc. All rights reserved.</span>
          <span>Made with obsession for developer experience.</span>
        </div>
      </div>
    </footer>
  );
}
