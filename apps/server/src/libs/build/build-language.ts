/**
 * Language-level build environments (not per-framework).
 * Node / Next / Vue / etc. all use `javascript` and the same preset image.
 */
export const BUILD_LANGUAGES = [
  'javascript',
  'php',
  'python',
  'go',
  'rust',
  'ruby',
  'docker',
  'generic',
] as const;

export type BuildLanguage = (typeof BUILD_LANGUAGES)[number];

const RUNTIME_TO_LANGUAGE: Record<string, BuildLanguage> = {
  node: 'javascript',
  docker: 'docker',
  python: 'python',
  go: 'go',
  ruby: 'ruby',
  php: 'php',
  rust: 'rust',
  elixir: 'generic',
  kotlin: 'generic',
  swift: 'generic',
  dart: 'generic',
  scala: 'generic',
  haskell: 'generic',
  unknown: 'generic',
};

export function mapGithubRuntimeToBuildLanguage(runtime: string): BuildLanguage {
  return RUNTIME_TO_LANGUAGE[runtime] ?? 'generic';
}

export function isBuildLanguage(value: string): value is BuildLanguage {
  return (BUILD_LANGUAGES as readonly string[]).includes(value);
}

const DEFAULT_IMAGES: Record<BuildLanguage, string> = {
  javascript: 'node:20-bookworm',
  php: 'composer:2',
  python: 'python:3.12-bookworm',
  go: 'golang:1.23-bookworm',
  rust: 'rust:1-bookworm',
  ruby: 'ruby:3.3-bookworm',
  docker: '',
  generic: 'ubuntu:22.04',
};

/**
 * Resolve the Docker image for an isolated build. Override per language with env, e.g.
 * `BUILD_IMAGE_JAVASCRIPT=node:22-bookworm`.
 */
export function resolveBuildImageForLanguage(language: BuildLanguage): string {
  if (language === 'docker') {
    return '';
  }
  const envKey = `BUILD_IMAGE_${language.toUpperCase()}`;
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_IMAGES[language];
}
