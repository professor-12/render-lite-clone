import type { IconType } from 'react-icons';
import { FiLayers, FiPackage, FiTerminal } from 'react-icons/fi';
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
    <div className="px-4 py-4">
      <SectionLabel htmlFor={id}>{label}</SectionLabel>
      <div className="flex items-start gap-2 rounded-lg border border-white/8 bg-[#0a0a0a] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
        <Icon className="mt-2 text-[15px] text-[#555] shrink-0" aria-hidden />
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          rows={4}
          className="min-h-21 w-full resize-y bg-transparent text-[13px] font-mono leading-relaxed text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
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
        <div className="rounded-xl border border-cyan-500/25 bg-linear-to-b from-cyan-950/35 via-[#0a1412] to-[#0a0a0a] px-4 py-4">
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10"
              aria-hidden
            >
              <FiLayers className="text-[18px] text-cyan-300/90" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-medium tracking-tight text-cyan-100/95">Dockerfile detected</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-cyan-200/55">
                We suggested Docker build and run commands. You can edit them below, or switch to custom install / build /
                start commands if you deploy without Docker on this platform.
              </p>
              {detectedBuild.reason.length > 0 ? (
                <ul className="mt-2.5 list-disc space-y-0.5 pl-4 text-[11px] text-cyan-200/45">
                  {detectedBuild.reason.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-white/6 bg-black/20 px-3 py-3 transition-colors hover:bg-black/30">
                <input
                  type="checkbox"
                  checked={useDockerCommands}
                  onChange={(e) => onUseDockerCommandsChange(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-white/25 bg-[#111] text-cyan-500 focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-0 focus:ring-offset-transparent"
                />
                <span className="text-[13px] leading-snug text-[#d4e8e4]">
                  <span className="font-medium text-cyan-50/95">Use Docker build &amp; run</span>
                  <span className="mt-0.5 block text-[12px] font-normal text-cyan-200/45">
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
          className="rounded-lg border border-amber-500/20 bg-amber-950/25 px-4 py-3 text-[12px] leading-relaxed text-amber-100/85"
          role="status"
        >
          Custom commands are active. Turn <strong className="font-medium">Use Docker build &amp; run</strong> back on to
          restore the detected Docker commands.
        </div>
      ) : null}

      <div className="rounded-xl border border-white/8 bg-[#111111] divide-y divide-white/6 overflow-hidden">
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
