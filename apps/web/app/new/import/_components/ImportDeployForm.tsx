import { BranchRootFields } from './BranchRootFields';
import { BuildInstallStartSection } from './BuildInstallStartSection';
import type { DetectedBuildConfig } from './detected-build.types';
import { GitUrlField } from './GitUrlField';
import { OutDirField } from './OutDirField';
import { ProjectNameField } from './ProjectNameField';

export type ImportFormState = {
  name: string;
  gitUrl: string;
  branch: string;
  rootDir: string;
  outDir: string;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  useDockerCommands: boolean;
};

type ImportDeployFormProps = {
  state: ImportFormState;
  onChange: <K extends keyof ImportFormState>(field: K, value: ImportFormState[K]) => void;
  detectedBuild: DetectedBuildConfig;
  onUseDockerCommandsChange: (useDocker: boolean) => void;
};

export function ImportDeployForm({
  state,
  onChange,
  detectedBuild,
  onUseDockerCommandsChange,
}: ImportDeployFormProps) {
  const { name, gitUrl, branch, rootDir, outDir, installCommand, buildCommand, startCommand, useDockerCommands } =
    state;

  const detection: DetectedBuildConfig = {
    ...detectedBuild,
    reason: detectedBuild.reason ?? [],
  };

  return (
    <div className="mt-8 space-y-6">
      <ProjectNameField value={name} onChange={(v) => onChange('name', v)} />
      <GitUrlField value={gitUrl} onChange={(v) => onChange('gitUrl', v)} />
      <BranchRootFields
        branch={branch}
        rootDir={rootDir}
        onBranchChange={(v) => onChange('branch', v)}
        onRootDirChange={(v) => onChange('rootDir', v)}
      />
      <OutDirField value={outDir} onChange={(v) => onChange('outDir', v)} />
      <BuildInstallStartSection
        installCommand={installCommand}
        buildCommand={buildCommand}
        startCommand={startCommand}
        onInstallCommandChange={(v) => onChange('installCommand', v)}
        onBuildCommandChange={(v) => onChange('buildCommand', v)}
        onStartCommandChange={(v) => onChange('startCommand', v)}
        detectedBuild={detection}
        useDockerCommands={useDockerCommands}
        onUseDockerCommandsChange={onUseDockerCommandsChange}
      />
    </div>
  );
}
