import { FiGlobe } from 'react-icons/fi';
import { SectionLabel } from './SectionLabel';

type GitUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GitUrlField({ value, onChange }: GitUrlFieldProps) {
  return (
    <div>
      <SectionLabel>Repository URL</SectionLabel>
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
        <FiGlobe className="text-[15px] text-[#555] shrink-0" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
        />
      </div>
    </div>
  );
}
