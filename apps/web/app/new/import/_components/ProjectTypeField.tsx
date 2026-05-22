import { FiBox, FiGlobe } from 'react-icons/fi';
import { SectionLabel } from './SectionLabel';
import type { ProjectType } from './ImportDeployForm';

type ProjectTypeFieldProps = {
  value: ProjectType;
  onChange: (value: ProjectType) => void;
};

const OPTIONS: Array<{
  type: ProjectType;
  title: string;
  description: string;
  Icon: typeof FiGlobe;
}> = [
  {
    type: 'static',
    title: 'Static site',
    description: 'HTML/CSS/JS bundle served by nginx. No runtime server.',
    Icon: FiGlobe,
  },
  {
    type: 'dynamic',
    title: 'Web service',
    description: 'Persistent server (Node, Python, Docker, etc.) with a start command.',
    Icon: FiBox,
  },
];

export function ProjectTypeField({ value, onChange }: ProjectTypeFieldProps) {
  return (
    <div>
      <SectionLabel>Project type</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map(({ type, title, description, Icon }) => {
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={[
                'text-left rounded-lg border px-3.5 py-3 transition-all',
                selected
                  ? 'border-white/30 bg-[#161616] ring-2 ring-white/10'
                  : 'border-white/8 bg-[#111111] hover:border-white/15',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="text-[14px] text-[#888]" aria-hidden />
                <span className="text-[13px] text-[#f0f0f0] font-medium">{title}</span>
              </div>
              <p className="text-[12px] text-[#777] leading-snug">{description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
