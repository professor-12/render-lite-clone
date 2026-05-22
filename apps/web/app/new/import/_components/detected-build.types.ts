export type DetectedBuildConfig = {
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  runtime: string;
  framework?: string;
  projectType?: 'static' | 'dynamic';
  reason: string[];
};
