import { BranchRootFields } from './BranchRootFields';
import { BuildStartCommands } from './BuildStartCommands';
import { GitUrlField } from './GitUrlField';
import { ProjectNameField } from './ProjectNameField';

export type ImportFormState = {
  name: string;
  gitUrl: string;
  branch: string;
  rootDir: string;
  buildCommand: string;
  startCommand: string;
};

type ImportDeployFormProps = {
  state: ImportFormState;
  onChange: <K extends keyof ImportFormState>(field: K, value: ImportFormState[K]) => void;
};

export function ImportDeployForm({ state, onChange }: ImportDeployFormProps) {
  const { name, gitUrl, branch, rootDir, buildCommand, startCommand } = state;

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
      <BuildStartCommands
        buildCommand={buildCommand}
        startCommand={startCommand}
        onBuildCommandChange={(v) => onChange('buildCommand', v)}
        onStartCommandChange={(v) => onChange('startCommand', v)}
      />
    </div>
  );
}
