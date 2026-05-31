import type { BuildResult, ProjectType } from './types';
import type { FileSet } from './file-set';
import type { FetchFileContent } from './types';
import { hasDependency, readPackageJson, type PackageInfo } from './package-json';
import { detectPackageManager, PM_COMMANDS } from './package-manager';

type NodeFramework = {
  name: string;
  /** Detected when any of these packages is present in (dev)dependencies. */
  deps: string[];
  projectType: ProjectType;
  /** Default build output directory for this framework, if it produces one. */
  outDir?: string;
};

/**
 * Node frameworks in detection priority order (most specific first). A meta
 * framework such as Next.js must be matched before the generic library it is
 * built on (React), otherwise the wrong defaults are produced.
 */
const NODE_FRAMEWORKS: ReadonlyArray<NodeFramework> = [
  { name: 'nextjs', deps: ['next'], projectType: 'dynamic', outDir: '.next' },
  { name: 'nuxt', deps: ['nuxt'], projectType: 'dynamic', outDir: '.output' },
  { name: 'remix', deps: ['@remix-run/dev', '@remix-run/serve'], projectType: 'dynamic', outDir: 'build' },
  { name: 'sveltekit', deps: ['@sveltejs/kit'], projectType: 'dynamic', outDir: 'build' },
  { name: 'gatsby', deps: ['gatsby'], projectType: 'static', outDir: 'public' },
  { name: 'astro', deps: ['astro'], projectType: 'static', outDir: 'dist' },
  { name: 'angular', deps: ['@angular/core', '@angular/cli'], projectType: 'static', outDir: 'dist' },
  { name: 'nestjs', deps: ['@nestjs/core'], projectType: 'dynamic', outDir: 'dist' },
  { name: 'vue-cli', deps: ['@vue/cli-service'], projectType: 'static', outDir: 'dist' },
  { name: 'vite', deps: ['vite'], projectType: 'static', outDir: 'dist' },
  { name: 'cra', deps: ['react-scripts'], projectType: 'static', outDir: 'build' },
  { name: 'express', deps: ['express'], projectType: 'dynamic' },
  { name: 'fastify', deps: ['fastify'], projectType: 'dynamic' },
  { name: 'koa', deps: ['koa'], projectType: 'dynamic' },
  { name: 'hapi', deps: ['@hapi/hapi'], projectType: 'dynamic' },
  // Plain UI libraries, lowest priority — only reached when no framework above matched.
  { name: 'vue', deps: ['vue'], projectType: 'static', outDir: 'dist' },
  { name: 'react', deps: ['react'], projectType: 'static', outDir: 'build' },
];

function matchFramework(pkg: PackageInfo): NodeFramework | undefined {
  return NODE_FRAMEWORKS.find((fw) => fw.deps.some((dep) => hasDependency(pkg, dep)));
}

/**
 * When no framework is recognised, the `build` script itself is a strong hint:
 * a static-site bundler implies a static project, anything else stays dynamic.
 */
function inferProjectTypeFromScripts(scripts: Record<string, string>): ProjectType {
  const build = (scripts.build ?? '').toLowerCase();
  const staticBuilders = ['vite build', 'astro build', 'ng build', 'parcel build', 'webpack'];
  if (staticBuilders.some((tool) => build.includes(tool))) return 'static';
  // A start script implies a long-running server.
  return scripts.start ? 'dynamic' : 'static';
}

export async function detectNode(
  files: FileSet,
  fetchFileContent: FetchFileContent,
): Promise<BuildResult> {
  const reason: string[] = [];
  const pkg = await readPackageJson(files, fetchFileContent, reason);

  const pm = detectPackageManager(files, pkg, reason);
  const cmd = PM_COMMANDS[pm];

  const scripts = pkg.scripts;
  const framework = matchFramework(pkg);
  if (framework) reason.push(`Framework detected: ${framework.name}`);

  if (files.hasAny('turbo.json', 'nx.json', 'lerna.json')) {
    reason.push('Monorepo tooling detected — commands target the repo root');
  }

  // Only emit commands the project can actually run — never fabricate a build or
  // start script that does not exist, since that guarantees a failed deploy.
  const buildCommand = scripts.build ? cmd.run('build') : '';
  if (scripts.build) reason.push('Using package.json "build" script');

  let startCommand = '';
  if (scripts.start) {
    startCommand = cmd.start;
    reason.push('Using package.json "start" script');
  } else if ((framework?.projectType ?? 'dynamic') === 'dynamic' && scripts.dev) {
    startCommand = cmd.run('dev');
    reason.push('No "start" script; falling back to "dev"');
  }

  const projectType: ProjectType = framework?.projectType ?? inferProjectTypeFromScripts(scripts);
  reason.push(`projectType inferred: ${projectType}`);

  return {
    installCommand: cmd.install,
    buildCommand,
    startCommand,
    outDir: framework?.outDir,
    runtime: 'node',
    framework: framework?.name,
    projectType,
    reason,
  };
}
