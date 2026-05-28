import { Globe, Server, Check } from 'lucide-react';
import { SectionLabel } from './SectionLabel';
import type { ProjectType } from './ImportDeployForm';
import type { ComponentType } from 'react';

type ProjectTypeFieldProps = {
  value: ProjectType;
  onChange: (value: ProjectType) => void;
};

const OPTIONS: Array<{
  type: ProjectType;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
    {
      type: 'static',
      title: 'Static site',
      description: '',
      Icon: Globe,
    },
    {
      type: 'dynamic',
      title: 'Web service',
      description: '',
      Icon: Server,
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
                'group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all',
                selected
                  ? 'border-brand-orange/40 bg-brand-orange/[0.06] ring-2 ring-brand-orange/15'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]',
              ].join(' ')}
            >

              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-brand-orange">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[13.5px] font-medium text-brand-cream mt-6">{title}</p>
              <p className="mt-1 text-[12px] leading-snug text-brand-muted-soft">
                {description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
