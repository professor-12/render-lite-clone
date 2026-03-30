import { HintText } from './HintText';
import { SectionLabel } from './SectionLabel';

type ProjectNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProjectNameField({ value, onChange }: ProjectNameFieldProps) {
  return (
    <div>
      <SectionLabel>Project Name</SectionLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="my-awesome-app"
        className="w-full px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] text-[13px] text-[#f0f0f0] placeholder:text-[#444] focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
      />
      <HintText>Used as the subdomain: {value || 'your-project'}.bigdev.uk</HintText>
    </div>
  );
}
