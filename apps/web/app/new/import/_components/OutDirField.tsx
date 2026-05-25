import { Archive } from 'lucide-react';
import { HintText } from './HintText';
import { SectionLabel } from './SectionLabel';

type OutDirFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function OutDirField({ value, onChange }: OutDirFieldProps) {
  return (
    <div>
      <SectionLabel htmlFor="import-out-dir">Output directory</SectionLabel>
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
        <Archive className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden />
        <input
          id="import-out-dir"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="dist, .next, build"
          className="flex-1 bg-transparent text-[14px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
        />
      </div>
      <HintText>
        Where production assets are written after the build (framework-specific).
      </HintText>
    </div>
  );
}
