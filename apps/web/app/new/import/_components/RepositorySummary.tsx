import { GitBranch, Github } from 'lucide-react';

type RepositorySummaryProps = {
  gitUrl: string;
  branch: string;
};

export function RepositorySummary({ gitUrl, branch }: RepositorySummaryProps) {
  if (!gitUrl) return null;

  return (
    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-brand-cream">
        <Github className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[12.5px] text-brand-cream">{gitUrl}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-brand-muted-soft">
          <GitBranch className="h-3 w-3" />
          {branch}
        </p>
      </div>
    </div>
  );
}
