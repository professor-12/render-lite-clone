import { Link2 } from 'lucide-react';
import { SectionLabel } from './SectionLabel';

type GitUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GitUrlField({ value, onChange }: GitUrlFieldProps) {
  return (
    <div>
      <SectionLabel>Repository URL</SectionLabel>
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
        <Link2 className="h-4 w-4 shrink-0 text-brand-muted" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="flex-1 bg-transparent text-[14px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
