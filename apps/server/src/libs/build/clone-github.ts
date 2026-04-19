import { simpleGit } from 'simple-git';

function normalizeGithubUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) throw new Error('githubUrl is required');
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('githubUrl must be http(s)');
  }
  return trimmed.replace(/\.git$/i, '');
}

export async function shallowCloneGithubRepo({
  githubUrl,
  branch,
  targetDir,
}: {
  githubUrl: string;
  branch?: string;
  targetDir: string;
}) {
  const url = normalizeGithubUrl(githubUrl);
  const git = simpleGit();

  const args = ['--depth', '1', '--single-branch'];
  if (branch?.trim()) {
    args.push('--branch', branch.trim());
  }

  await git.clone(url, targetDir, args);
}

