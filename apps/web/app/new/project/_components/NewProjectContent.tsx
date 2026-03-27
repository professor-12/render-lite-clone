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
    <main className="bg-[#0a0a0a] min-h-screen py-12 pt-20">
      <div className="max-w-5xl w-full mx-auto px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Let&apos;s build something new.
        </h1>
        <p className="mt-2 text-[14px] text-[#888]">
          Paste a GitHub URL or pick a template to deploy in seconds.
        </p>

        <DeployUrlInput />

        <div className="mt-14 border border-white/[0.08] rounded-xl overflow-hidden bg-[#111111] divide-x divide-white/[0.06] flex min-h-[420px]">
          <div className="flex-1 min-w-0">
            <Suspense fallback={<GithubRepoSkeleton />}>
              <GithubRepo searchParams={searchParams} />
            </Suspense>
          </div>
          <div className="flex-1 min-w-0">
            <Template />
          </div>
        </div>

        <p className="mt-5 text-center text-[12px] text-[#444] font-mono">
          Deployments run on Render Lite&apos;s global edge — SSL and CDN included automatically.
        </p>
      </div>
    </main>
  );
}
