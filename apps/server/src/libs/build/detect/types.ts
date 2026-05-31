/**
 * Shared types for the build-detection engine.
 *
 * The engine is intentionally free of any GitHub/transport knowledge so it can
 * be unit-tested and reused against any file source.
 */

export type ProjectType = 'static' | 'dynamic';

/** A single entry from a repository's directory listing. */
export type RepoFile = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
};

/** Fetches and JSON-parses a single file by its API/download url. */
export type FetchFileContent = (url: string) => Promise<unknown>;

export type BuildResult = {
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  /** Build output directory to package/serve (e.g. dist, build, .next). */
  outDir?: string;
  runtime: string;
  framework?: string;
  projectType: ProjectType;
  /** Human-readable trail explaining why each field was chosen. */
  reason: string[];
};
