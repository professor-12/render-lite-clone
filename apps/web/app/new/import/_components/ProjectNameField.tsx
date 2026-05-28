import { HintText } from './HintText';
import { SectionLabel } from './SectionLabel';

type ProjectNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProjectNameField({ value, onChange }: ProjectNameFieldProps) {
  return (
    <div>
      <SectionLabel>Project name</SectionLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="my-awesome-app"
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[14px] text-brand-cream placeholder:text-brand-muted transition-all focus:border-brand-orange/40 focus:outline-none focus:ring-4 focus:ring-brand-orange/10"
      />
    </div>
  );
}
