import { FiBox } from 'react-icons/fi';
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
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
        <FiBox className="text-[15px] text-[#555] shrink-0" aria-hidden />
        <input
          id="import-out-dir"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="dist, .next, build"
          className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
        />
      </div>
      <HintText>Where production assets are written after the build (framework-specific).</HintText>
    </div>
  );
}
