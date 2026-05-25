import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NewProjectContent from './_components/NewProjectContent';

export const metadata: Metadata = {
  title: 'New project | Render Lite',
};

function RenderLiteMark() {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-brand-cream" />
      <span className="absolute inset-[3px] rounded-full bg-black" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-brand-cream" />
    </span>
  );
}

export default function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <div className="min-h-screen bg-black text-brand-cream">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/[0.06] bg-black/80 px-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[14px] font-medium tracking-tight text-brand-cream"
          >
            <RenderLiteMark />
            <span className="flex items-baseline gap-1">
              renderlite
              <span className="font-serif-display text-[15px] leading-none text-brand-orange">
                .
              </span>
            </span>
          </Link>
          <span className="h-5 w-px bg-white/10" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] text-brand-muted-soft transition-colors hover:bg-white/[0.05] hover:text-brand-cream"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>

        <h1 className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-muted">
          New project
        </h1>

        <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-orange/15 ring-1 ring-brand-orange/25 transition-all hover:ring-brand-orange/50">
          <span className="text-[11px] font-medium text-brand-orange">XS</span>
        </button>
      </header>

      <div className="pt-14">
        <NewProjectContent searchParams={searchParams} />
      </div>
    </div>
  );
}
