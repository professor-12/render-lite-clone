'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  fetchDeploymentLogs,
  useGetDeployment,
  useRedeploy,
  type DeploymentLogRow,
} from '@/app/queries/deployments.query';
import { TbReload } from "react-icons/tb";

import { Button } from '@/components/ui/button';
import { useDeploymentStream } from '@/hooks/useDeploymentStream';
import { useSocket } from '@/providers/SocketProvider';
import type { DeploymentLogPayload } from '@/lib/socket/types';

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

let liveRowCounter = 0;
const nextLiveRowId = (deploymentId: string) => `live:${deploymentId}:${++liveRowCounter}`;

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
  const { isConnected } = useSocket();
  const [rows, setRows] = useState<DeploymentLogRow[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Tracks log ids seen so socket events don't duplicate rows from the initial fetch. */
  const seenIdsRef = useRef<Set<string>>(new Set());

  const atBottomRef = useRef(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const isTerminal =
    deployment?.status === 'live' ||
    deployment?.status === 'build_failed' ||
    deployment?.status === 'deploy_failed';

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
    const controller = new AbortController();
    seenIdsRef.current = new Set();
    setRows([]);
    setLoadingLogs(true);
    setError(null);

    (async () => {
      const MAX_PAGES = 100;
      try {
        let cursor: string | null = null;
        for (let page = 0; page < MAX_PAGES; page++) {
          const data = await fetchDeploymentLogs(deploymentId, cursor, controller.signal);
          if (controller.signal.aborted) return;

          if (data.logs.length > 0) {
            setRows((prev) => {
              const next = [...prev];
              for (const row of data.logs) {
                if (!seenIdsRef.current.has(row.id)) {
                  seenIdsRef.current.add(row.id);
                  next.push(row);
                }
              }
              return next;
            });
          }
          if (!data.nextCursor) break;
          cursor = data.nextCursor;
        }
        if (!controller.signal.aborted) setError(null);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Failed to load logs');
      } finally {
        if (!controller.signal.aborted) setLoadingLogs(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [deploymentId]);

  const onLog = useCallback(
    (payload: DeploymentLogPayload) => {
      const row: DeploymentLogRow = {
        id: nextLiveRowId(payload.deploymentId),
        type: payload.type,
        log: payload.chunk,
        createdAt: new Date().toISOString(),
      };
      seenIdsRef.current.add(row.id);
      setRows((prev) => [...prev, row]);
    },
    [],
  );

  useDeploymentStream(deploymentId, { onLog });

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
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard/projects"
            className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Projects
          </Link>
          <h1 className="mt-3 truncate text-[26px] font-medium tracking-[-0.025em] text-foreground">
            {deployment?.project?.name ?? (
              <span className="">Deploying…</span>
            )}
          </h1>
          <p className="mt-1 font-mono text-[12px] text-muted-foreground">
            id · {deploymentId}
          </p>
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-orange)]" />
            Build logs
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {loadingLogs
              ? 'loading…'
              : isTerminal
                ? 'complete'
                : isConnected
                  ? 'live'
                  : 'reconnecting…'}
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

        <div ref={scrollerRef} className="h-[60vh] overflow-auto bg-[#0a0a0a] px-5 py-4 text-brand-cream">
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
