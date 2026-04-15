export type ProjectStatus = 'ready' | 'building' | 'error';

export type ProjectStack = 'next' | 'vue' | 'vercel' | 'node';

export type ProjectListItem = {
  id: string;
  name: string;
  deploymentUrl: string;
  repo: string;
  commitMessage: string;
  relativeTime: string;
  branch: string;
  status: ProjectStatus;
  stack: ProjectStack;
};
