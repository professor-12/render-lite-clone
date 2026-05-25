import { Folder, GitBranch } from 'lucide-react';
import { SectionLabel } from './SectionLabel';

type BranchRootFieldsProps = {
  branch: string;
  rootDir: string;
  onBranchChange: (value: string) => void;
  onRootDirChange: (value: string) => void;
};

export function BranchRootFields({
  branch,
  rootDir,
  onBranchChange,
  onRootDirChange,
}: BranchRootFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <SectionLabel>Branch</SectionLabel>
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
          <GitBranch className="h-4 w-4 shrink-0 text-brand-muted" />
          <input
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            placeholder="main"
            className="flex-1 bg-transparent text-[14px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
          />
        </div>
      </div>
      <div>
        <SectionLabel>Root directory</SectionLabel>
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
          <Folder className="h-4 w-4 shrink-0 text-brand-muted" />
          <input
            type="text"
            value={rootDir}
            onChange={(e) => onRootDirChange(e.target.value)}
            placeholder="./"
            className="flex-1 bg-transparent text-[14px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
