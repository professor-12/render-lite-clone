'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Globe,
  AlertTriangle,
  GitBranch,
  GitCommitHorizontal,
  MoreVertical,
  Clock,
  User,
} from 'lucide-react';
import { useGetProject } from '@/app/queries/projects.query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function statusLabel(status: string) {
  if (status === 'live') return 'Ready';
  if (status === 'build_uploaded' || status === 'queued_deploy') return 'Deploying';
  if (status === 'deploying') return 'Deploying';
  if (status === 'build_failed' || status === 'deploy_failed') return 'Error';
  if (status === 'building') return 'Building';
  if (status === 'queued_build') return 'Queued';
  return status;
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit' }).format(d);
}

function fmtDurationMs(ms: number | null) {
  if (!ms || ms < 0 || !Number.isFinite(ms)) return '—';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export function ProjectDeploymentView({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError } = useGetProject(projectId);

  const latest = project?.latestDeployment ?? null;
  const deploymentId = latest?.id ?? null;
  const status = latest?.status ?? 'queued_build';

  const domain = useMemo(() => {
    if (!project) return null;
    return project.domain ?? null;
  }, [project]);

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-100">
        Failed to load project.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-orange)]" />
              Latest deployment
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="gap-2">
                <Clock className="size-4" aria-hidden />
                Redeploy
              </Button>
              <Button variant="outline" size="icon" aria-label="Deployment actions" disabled>
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[360px_1fr]">
            <div
              className={[
                'rounded-xl border p-4',
                status === 'build_failed' || status === 'deploy_failed'
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-border bg-muted/30',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                {status === 'build_failed' ? (
                  <>
                    <AlertTriangle className="size-4 text-rose-500" aria-hidden />
                    Build Failed
                  </>
                ) : status === 'deploy_failed' ? (
                  <>
                    <AlertTriangle className="size-4 text-rose-500" aria-hidden />
                    Deploy Failed
                  </>
                ) : (
                  <>
                    <Clock className="size-4 text-muted-foreground" aria-hidden />
                    {isLoading ? 'Checking build…' : 'Build'}
                  </>
                )}
              </div>
              <div className="mt-3 text-[12px] text-muted-foreground">
                {status === 'build_failed'
                  ? `Command "${project?.buildCommand ?? 'build'}" exited with an error.`
                  : status === 'deploy_failed'
                    ? 'The container failed to start. Check deployment logs.'
                    : status === 'live'
                      ? 'Deployment completed successfully.'
                      : 'Deployment in progress.'}
              </div>
            </div>

            <div className="min-w-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Created</div>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-foreground">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted/40">
                      <User className="size-3.5 text-muted-foreground" aria-hidden />
                    </span>
                    <span className="truncate">{fmtDate(latest?.createdAt)}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <Badge variant={status === 'build_failed' ? 'outline' : 'success'} className="gap-2">
                      <span
                        className={[
                          'inline-block size-2 rounded-full',
                          status === 'build_failed' ? 'bg-rose-500' : 'bg-emerald-500',
                        ].join(' ')}
                        aria-hidden
                      />
                      {status === 'build_failed' ? 'Error' : statusLabel(status)}
                    </Badge>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Duration</div>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-foreground">
                    <Clock className="size-4 text-muted-foreground" aria-hidden />
                    {fmtDurationMs(
                      latest?.createdAt && latest?.updatedAt
                        ? new Date(latest.updatedAt).getTime() - new Date(latest.createdAt).getTime()
                        : null,
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Environment</div>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-foreground">
                    <Globe className="size-4 text-muted-foreground" aria-hidden />
                    Preview
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-[12px] text-muted-foreground">Domains</div>
                  <div className="mt-2 space-y-2 text-[13px]">
                    {project?.domain ? (
                      <Link
                        href={project.domain}
                        target="_blank"
                        className="flex min-w-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Globe className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">{project.domain}</span>
                      </Link>
                    ) : (
                      <div className="text-muted-foreground">—</div>
                    )}
                    {deploymentId ? (
                      <Link
                        href={`/dashboard/deployments/${deploymentId}`}
                        className="flex min-w-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Clock className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">View build logs</span>
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="text-[12px] text-muted-foreground">Source</div>
                  <div className="mt-2 space-y-2 text-[13px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GitBranch className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{project?.branch ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GitCommitHorizontal className="size-4 shrink-0" aria-hidden />
                      <span className="truncate font-mono">{deploymentId ? deploymentId.slice(0, 7) : '—'}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] text-muted-foreground">
                    <span className="font-mono">{project?.repoUrl ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5 text-[14px] font-medium text-foreground">
            Summary
          </div>
          <dl className="space-y-3 px-4 py-4 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#737373]">Created</dt>
              <dd className="text-foreground">{fmtDate(project?.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#737373]">Updated</dt>
              <dd className="text-foreground">{fmtDate(project?.updatedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#737373]">Deployments</dt>
              <dd className="text-foreground">{project?.deploymentsCount ?? '—'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
