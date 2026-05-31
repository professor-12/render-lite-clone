import { z } from 'zod';
import { logger } from '../../logger';
import type { FetchFileContent } from './types';
import type { FileSet } from './file-set';

/**
 * `package.json` in the wild is messy: comments-as-strings, arrays where objects
 * are expected, missing fields. We validate with a tolerant schema so a single
 * malformed field can never crash detection — bad shapes degrade to empty.
 */
const stringRecord = z
  .record(z.string(), z.string())
  .catch({});

const PackageJsonSchema = z
  .object({
    name: z.string().optional().catch(undefined),
    /** Corepack field, e.g. "pnpm@9.1.0" — the most reliable package-manager signal. */
    packageManager: z.string().optional().catch(undefined),
    scripts: stringRecord.optional(),
    dependencies: stringRecord.optional(),
    devDependencies: stringRecord.optional(),
  })
  .catch({});

/** Normalised, always-safe view of a project's package.json. */
export type PackageInfo = {
  name?: string;
  packageManager?: string;
  scripts: Record<string, string>;
  /** dependencies + devDependencies merged; dev wins on conflict. */
  deps: Record<string, string>;
  /** True when the package.json was found and parsed. */
  present: boolean;
};

const EMPTY: PackageInfo = { scripts: {}, deps: {}, present: false };

/**
 * Read and parse the repository's `package.json`. Returns a normalised
 * {@link PackageInfo}; never throws.
 */
export async function readPackageJson(
  files: FileSet,
  fetchFileContent: FetchFileContent,
  reason: string[],
): Promise<PackageInfo> {
  const pkgFile = files.get('package.json');
  if (!pkgFile?.download_url) return EMPTY;

  let raw: unknown;
  try {
    raw = await fetchFileContent(pkgFile.download_url);
  } catch (err) {
    logger.warn({ err }, 'Failed to fetch package.json during detection');
    return EMPTY;
  }

  const parsed = PackageJsonSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, 'package.json failed validation');
    reason.push('package.json present but unparseable');
    return { ...EMPTY, present: true };
  }

  reason.push('package.json parsed');
  return {
    name: parsed.data.name,
    packageManager: parsed.data.packageManager,
    scripts: parsed.data.scripts ?? {},
    deps: { ...parsed.data.dependencies, ...parsed.data.devDependencies },
    present: true,
  };
}

/** Case-sensitive dependency presence check (npm names are lower-case anyway). */
export function hasDependency(pkg: PackageInfo, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(pkg.deps, name);
}
