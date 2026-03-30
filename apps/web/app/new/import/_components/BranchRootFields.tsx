import { FiFolder, FiGitBranch } from 'react-icons/fi';
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
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
          <FiGitBranch className="text-[15px] text-[#555] shrink-0" />
          <input
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            placeholder="main"
            className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
          />
        </div>
      </div>
      <div>
        <SectionLabel>Root Directory</SectionLabel>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
          <FiFolder className="text-[15px] text-[#555] shrink-0" />
          <input
            type="text"
            value={rootDir}
            onChange={(e) => onRootDirChange(e.target.value)}
            placeholder="./"
            className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
