'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  fetchDeploymentLogs,
  useGetDeployment,
  useRedeploy,
  type DeploymentLogRow,
} from '@/app/queries/deployments.query';
import { TbReload } from "react-icons/tb";

import { Button } from '@/components/ui/button';

function statusLabel(status: string) {
  if (status === 'live') return 'Live';
  if (status === 'build_uploaded') return 'Build uploaded';
  if (status === 'queued_deploy') return 'Queued for deploy';
  if (status === 'deploying') return 'Deploying';
  if (status === 'deploy_failed') return 'Deploy failed';
  if (status === 'build_failed') return 'Build failed';
  if (status === 'building') return 'Building';
  if (status === 'queued_build') return 'Queued';
  return status;
}

function statusTone(status: string) {
  if (status === 'live' || status === 'build_uploaded')
    return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
  if (status === 'build_failed' || status === 'deploy_failed')
    return 'border-rose-400/25 bg-rose-400/10 text-rose-300';
  if (status === 'building' || status === 'deploying')
    return 'border-blue-400/25 bg-blue-400/10 text-blue-300';
  if (status === 'queued_build' || status === 'queued_deploy')
    return 'border-border/60 bg-muted/40 text-muted-foreground';
  return 'border-border/60 bg-muted/40 text-muted-foreground';
}

function LogLine({ row }: { row: DeploymentLogRow }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="w-16 shrink-0 font-mono text-[11px] text-[#525252]">
        {row.type.toUpperCase()}
      </span>
      <pre className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word font-mono text-[12px] leading-5 text-foreground/90">
        {row.log}
      </pre>
    </div>
  );
}

export function DeploymentLogsView({ deploymentId }: { deploymentId: string }) {
  const { data: deployment } = useGetDeployment(deploymentId);
  const [rows, setRows] = useState<DeploymentLogRow[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Pagination cursor — kept in a ref so polling does not reset the interval on every batch. */
  const logCursorRef = useRef<string | null>(null);

  const atBottomRef = useRef(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const canAutoPoll = useMemo(() => {
    const s = deployment?.status;
    return s !== 'live' && s !== 'build_failed' && s !== 'deploy_failed';
  }, [deployment?.status]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 24;
      atBottomRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    };
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    logCursorRef.current = null;
    setRows([]);
    setLoadingLogs(true);
    setError(null);

    const tick = async () => {
      try {
        const data = await fetchDeploymentLogs(deploymentId, logCursorRef.current);
        if (cancelled) return;

        if (data.logs.length > 0) {
          setRows((prev) => [...prev, ...data.logs]);
          const lastId = data.logs[data.logs.length - 1]?.id;
          if (lastId) logCursorRef.current = lastId;
        }
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load logs');
      } finally {
        // Always clear "Connecting…" after a response — avoids getting stuck when Strict Mode
        // aborts an in-flight request before `cancelled` is false again.
        setLoadingLogs(false);
      }
    };

    void tick();
    const id = window.setInterval(() => {
      if (!canAutoPoll) return;
      void tick();
    }, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [deploymentId, canAutoPoll]);

  useEffect(() => {
    if (!atBottomRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [rows.length]);

  const redeploy = useRedeploy(deploymentId);

  const redeployErrorMessage =
    redeploy.error instanceof Error ? redeploy.error.message : null;

  return (
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard/projects"
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Projects
          </Link>
          <h1 className="mt-2 truncate text-[18px] font-semibold text-foreground">
            {deployment?.project?.name ?? 'Deploying…'}
          </h1>
          <p className="mt-1 text-[13px] text-[#737373]">Deployment: {deploymentId}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[12px] ${statusTone(
              deployment?.status ?? 'queued_build',
            )}`}
          >
            {statusLabel(deployment?.status ?? 'queued_build')}
          </span>
          {deployment?.status === 'build_failed' && (
            <Button
              onClick={() => redeploy.mutate()}
              disabled={redeploy.isPending}
              className="ml-2 cursor-pointer gap-3 flex items-center"
            >
              <span className={redeploy.isPending ? 'animate-spin' : ''}>
                <TbReload />
              </span>
              {redeploy.isPending ? 'Redeploying…' : 'Redeploy'}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="text-[16px] font-medium text-foreground">Build logs</div>
          <div className="text-[12px] text-muted-foreground">
            {loadingLogs ? 'Loading…' : canAutoPoll ? '' : 'Complete'}
          </div>
        </div>

        {error && (
          <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[12px] text-rose-200">
            {error}
          </div>
        )}

        {redeployErrorMessage && (
          <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[12px] text-rose-200">
            Redeploy failed: {redeployErrorMessage}
          </div>
        )}

        <div ref={scrollerRef} className="h-[60vh] overflow-auto bg-muted/20 px-4 py-3">
          {loadingLogs && rows.length === 0 ? (
            <div className="space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-[16px] text-muted-foreground">
              {deployment?.status === 'queued_build'
                ? 'No logs yet. The deployment is still queued'
                : 'No logs yet.'}
            </div>
          ) : (
            rows.map((r) => <LogLine key={r.id} row={r} />)
          )}
        </div>
      </div>
    </div>
  );
}
