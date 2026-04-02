export type DetectedBuildConfig = {
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  runtime: string;
  framework?: string;
  reason: string[];
};
