import { FiGithub, FiSearch } from 'react-icons/fi';

const REPO_SKELETON_ROWS = 6;

export default function GithubRepoSkeleton() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <FiGithub className="text-[17px] text-white/[0.12]" />
        <div className="h-3.5 w-36 rounded-md bg-white/[0.06]" />
      </div>

      {/* Search skeleton */}
      <div className="flex items-center gap-2 border border-white/[0.08] bg-[#0a0a0a] rounded-lg px-3 py-2 mb-3">
        <FiSearch className="text-white/[0.12] text-[15px] flex-shrink-0" />
        <div className="flex-1 h-4 rounded bg-white/[0.06] max-w-[180px] animate-pulse" />
      </div>

      {/* Repo list skeleton */}
      <ul className="divide-y divide-white/[0.05]">
        {Array.from({ length: REPO_SKELETON_ROWS }).map((_, i) => (
          <li key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-white/[0.08] animate-pulse" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 rounded bg-white/[0.08] w-[min(100%,theme(spacing.32))] animate-pulse" />
                <div className="flex items-center gap-1.5">
                  <div className="h-3 rounded bg-white/[0.06] w-14 animate-pulse" />
                  <span className="text-white/[0.04] text-[10px]">·</span>
                  <div className="h-3 rounded bg-white/[0.06] w-12 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="ml-3 h-7 w-16 rounded-md bg-white/[0.06] shrink-0 animate-pulse" />
          </li>
        ))}
      </ul>

      {/* Connect more skeleton */}
      <div className="mt-3 h-9 w-full rounded-lg bg-white/[0.04] border border-dashed border-white/[0.07]" />
    </div>
  );
}
