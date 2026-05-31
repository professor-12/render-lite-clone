/**
 * Project build detection.
 *
 * Given a flat listing of the files at a repository's root (plus a way to fetch
 * a single file's contents), infer how the project should be installed, built
 * and started. This module is intentionally free of any GitHub/transport
 * knowledge so it can be unit-tested and reused against any file source.
 *
 * Detection priority: Docker > Node.js > other languages > unknown.
 *   - Docker wins outright because a Dockerfile fully describes the build.
 *   - Node is checked before the language table because `package.json` is the
 *     richest signal we can read.
 */
import { FileSet } from './file-set';
import { detectNode } from './node';
import { LANGUAGE_DETECTORS } from './languages';
import type { BuildResult, FetchFileContent, RepoFile } from './types';

export type { BuildResult, FetchFileContent, ProjectType, RepoFile } from './types';

function dockerResult(): BuildResult {
  return {
    installCommand: '',
    buildCommand: 'docker build -t app .',
    startCommand: 'docker run -p 3000:3000 app',
    runtime: 'docker',
    projectType: 'dynamic',
    reason: ['Dockerfile detected'],
  };
}

function unknownResult(): BuildResult {
  return {
    installCommand: '',
    buildCommand: '',
    startCommand: '',
    runtime: 'unknown',
    projectType: 'dynamic',
    reason: ['Could not detect project type'],
  };
}

/**
 * Detect the build configuration for a project from its root file listing.
 */
export async function detectBuild(
  files: RepoFile[],
  fetchFileContent: FetchFileContent,
): Promise<BuildResult> {
  const fileSet = new FileSet(files);

  if (fileSet.has('Dockerfile')) {
    return dockerResult();
  }

  if (fileSet.has('package.json')) {
    return detectNode(fileSet, fetchFileContent);
  }

  for (const detector of LANGUAGE_DETECTORS) {
    if (detector.triggers.some((t) => fileSet.has(t))) {
      return detector.build(fileSet);
    }
  }

  return unknownResult();
}
