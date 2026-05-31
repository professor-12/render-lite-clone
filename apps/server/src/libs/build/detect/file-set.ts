import type { RepoFile } from './types';

/**
 * A case-insensitive view over a repository's root files.
 *
 * Repositories disagree on casing (`Dockerfile`, `dockerfile`, `Gemfile`,
 * `gemfile`), so every lookup is normalised to lower-case.
 */
export class FileSet {
  private readonly byName: Map<string, RepoFile>;

  constructor(files: RepoFile[]) {
    this.byName = new Map(files.map((f) => [f.name.toLowerCase(), f]));
  }

  has(name: string): boolean {
    return this.byName.has(name.toLowerCase());
  }

  /** True if any of the given names is present. */
  hasAny(...names: string[]): boolean {
    return names.some((n) => this.has(n));
  }

  get(name: string): RepoFile | undefined {
    return this.byName.get(name.toLowerCase());
  }
}
