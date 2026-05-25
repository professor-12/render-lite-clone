import { Suspense } from 'react';
import GithubRepo from './GithubRepo';
import GithubRepoSkeleton from './GithubRepoSkeleton';
import DeployUrlInput from './DeployUrlInput';
import Template from './Template';

export default function NewProjectContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black py-16 pt-24">
      {/* Warm glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full warm-glow opacity-50" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand-cream/80">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
          Step 1 of 3
        </div>

        <h1 className="mt-5 text-[clamp(32px,4.5vw,48px)] font-medium leading-[1.05] tracking-[-0.035em] text-brand-cream">
          Let&apos;s build{' '}
          <span className="font-serif-display italic">something new</span>
          <span className="text-brand-orange">.</span>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-brand-muted-soft">
          Paste a GitHub URL or pick a template to deploy in seconds — SSL, CDN, and edge
          routing included.
        </p>

        <DeployUrlInput />

        <div className="mt-14 flex min-h-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] divide-x divide-white/[0.06]">
          <div className="min-w-0 flex-1">
            <Suspense fallback={<GithubRepoSkeleton />}>
              <GithubRepo searchParams={searchParams} />
            </Suspense>
          </div>
          <div className="min-w-0 flex-1">
            <Template />
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[11.5px] uppercase tracking-[0.14em] text-brand-muted">
          Deployments run on Render Lite&apos;s global edge — SSL & CDN included automatically.
        </p>
      </div>
    </main>
  );
}
