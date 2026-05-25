import { Github, Search } from 'lucide-react';

const REPO_SKELETON_ROWS = 6;

export default function GithubRepoSkeleton() {
  return (
    <div className="animate-in fade-in p-6 duration-300">
      {/* Section heading */}
      <div className="mb-5 flex items-center gap-2">
        <Github className="h-4 w-4 text-white/[0.18]" />
        <div className="h-3.5 w-40 rounded-full bg-white/[0.06]" />
      </div>

      {/* Search skeleton */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
        <Search className="h-3.5 w-3.5 flex-shrink-0 text-white/[0.18]" />
        <div className="h-3.5 max-w-[180px] flex-1 animate-pulse rounded bg-white/[0.06]" />
      </div>

      {/* Repo list skeleton */}
      <ul className="divide-y divide-white/[0.05]">
        {Array.from({ length: REPO_SKELETON_ROWS }).map((_, i) => (
          <li key={i} className="flex items-center justify-between py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-[min(100%,theme(spacing.32))] animate-pulse rounded bg-white/[0.08]" />
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-14 animate-pulse rounded bg-white/[0.06]" />
                  <span className="text-[10px] text-white/[0.04]">·</span>
                  <div className="h-3 w-12 animate-pulse rounded bg-white/[0.06]" />
                </div>
              </div>
            </div>
            <div className="ml-3 h-7 w-16 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
          </li>
        ))}
      </ul>

      {/* Connect more skeleton */}
      <div className="mt-4 h-10 w-full rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02]" />
    </div>
  );
}
