import { FiGitBranch } from 'react-icons/fi';

type RepositorySummaryProps = {
  gitUrl: string;
  branch: string;
};

export function RepositorySummary({ gitUrl, branch }: RepositorySummaryProps) {
  if (!gitUrl) return null;

  return (
    <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-lg border border-white/8 bg-[#111111]">
      <FiGitBranch className="text-[17px] text-[#555] shrink-0" />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#f0f0f0] truncate">{gitUrl}</p>
        <p className="text-[11px] text-[#555] mt-0.5">Branch: {branch}</p>
      </div>
    </div>
  );
}
