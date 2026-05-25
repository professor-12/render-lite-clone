import type { ComponentType } from 'react';
import { Layers, Package, Terminal } from 'lucide-react';

const FiLayers = Layers;
const FiPackage = Package;
const FiTerminal = Terminal;

type IconType = ComponentType<{ className?: string }>;
import { HintText } from './HintText';
import { SectionLabel } from './SectionLabel';
import type { DetectedBuildConfig } from './detected-build.types';
import type { ProjectType } from './ImportDeployForm';

type BuildInstallStartSectionProps = {
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  onInstallCommandChange: (value: string) => void;
  onBuildCommandChange: (value: string) => void;
  onStartCommandChange: (value: string) => void;
  detectedBuild: DetectedBuildConfig | null;
  useDockerCommands: boolean;
  onUseDockerCommandsChange: (useDocker: boolean) => void;
  projectType: ProjectType;
};

function CommandTextarea({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: IconType;
}) {
  return (
    <div className="px-5 py-5">
      <SectionLabel htmlFor={id}>{label}</SectionLabel>
      <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
        <Icon className="mt-1.5 h-4 w-4 shrink-0 text-brand-muted" aria-hidden />
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          rows={4}
          className="min-h-21 w-full resize-y bg-transparent font-mono text-[13px] leading-relaxed text-brand-cream placeholder:text-brand-muted focus:outline-none"
        />
      </div>
      <HintText>{hint}</HintText>
    </div>
  );
}

export function BuildInstallStartSection({
  installCommand,
  buildCommand,
  startCommand,
  onInstallCommandChange,
  onBuildCommandChange,
  onStartCommandChange,
  detectedBuild,
  useDockerCommands,
  onUseDockerCommandsChange,
  projectType,
}: BuildInstallStartSectionProps) {
  const isDockerRuntime = detectedBuild?.runtime === 'docker';
  const isStatic = projectType === 'static';

  return (
    <div className="space-y-4">
      {isDockerRuntime ? (
        <div className="rounded-2xl border border-brand-orange/25 bg-gradient-to-b from-brand-orange/[0.08] to-transparent px-5 py-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-orange/30 bg-brand-orange/10"
              aria-hidden
            >
              <FiLayers className="h-4 w-4 text-brand-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-medium tracking-tight text-brand-cream">
                Dockerfile detected
              </h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-brand-muted-soft">
                We suggested Docker build &amp; run commands. Edit them below, or switch to custom
                install / build / start commands if you deploy without Docker.
              </p>
              {detectedBuild.reason.length > 0 ? (
                <ul className="mt-2.5 list-disc space-y-0.5 pl-4 text-[11.5px] text-brand-muted">
                  {detectedBuild.reason.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-3.5 py-3 transition-colors hover:bg-black/50">
                <input
                  type="checkbox"
                  checked={useDockerCommands}
                  onChange={(e) => onUseDockerCommandsChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-black accent-brand-orange focus:ring-2 focus:ring-brand-orange/40"
                />
                <span className="text-[13px] leading-snug text-brand-cream/90">
                  <span className="font-medium">Use Docker build &amp; run</span>
                  <span className="mt-0.5 block text-[12px] font-normal text-brand-muted-soft">
                    Uncheck to use your own install, build, and start commands (e.g. Node, Python).
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {isDockerRuntime && !useDockerCommands ? (
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[12.5px] leading-relaxed text-amber-200/90"
          role="status"
        >
          Custom commands are active. Turn{' '}
          <strong className="font-medium text-amber-100">Use Docker build &amp; run</strong> back on
          to restore the detected Docker commands.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
        <CommandTextarea
          id="import-install-command"
          label="Install command"
          hint={
            isDockerRuntime && useDockerCommands
              ? 'Optional. Add steps before docker build (e.g. secrets or prep). Leave empty if not needed.'
              : 'Runs before build in your deploy environment (e.g. npm install, pnpm install).'
          }
          value={installCommand}
          onChange={onInstallCommandChange}
          placeholder="npm install"
          icon={FiPackage}
        />
        <CommandTextarea
          id="import-build-command"
          label="Build command"
          hint={
            isDockerRuntime && useDockerCommands
              ? 'Typically docker build. Edit image name, tags, or build args as needed.'
              : 'Command that produces your production artifact.'
          }
          value={buildCommand}
          onChange={onBuildCommandChange}
          placeholder="npm run build"
          icon={FiTerminal}
        />
        {isStatic ? null : (
          <CommandTextarea
            id="import-start-command"
            label="Start command"
            hint={
              isDockerRuntime && useDockerCommands
                ? 'Typically docker run. Adjust ports, env, and image name to match your build command.'
                : 'Command that runs your app in production.'
            }
            value={startCommand}
            onChange={onStartCommandChange}
            placeholder="npm start"
            icon={FiTerminal}
          />
        )}
      </div>
    </div>
  );
}
