'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/SocketProvider';
import type { DeploymentLogPayload, DeploymentStatusPayload } from '@/lib/socket/types';

type Handlers = {
  onLog?: (payload: DeploymentLogPayload) => void;
  onStatus?: (payload: DeploymentStatusPayload) => void;
};

/**
 * Subscribe to a deployment's realtime stream.
 * - Joins/leaves the `deployment:<id>` room exactly once per (socket, deploymentId).
 * - Re-joins on reconnect via a `connect` listener (not via deps), so the effect
 *   does not tear down on every render.
 * - Invalidates react-query on status changes.
 * - Forwards log + status payloads to optional handlers via a ref so callers can
 *   pass inline objects without re-subscribing each render.
 */
export function useDeploymentStream(deploymentId: string | null | undefined, handlers?: Handlers) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const handlersRef = useRef<Handlers | undefined>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers])

  useEffect(() => {
    if (!deploymentId) return;

    const join = () => socket.emit('deployment:subscribe', deploymentId);

    const onStatus = (payload: DeploymentStatusPayload) => {
      if (payload.deploymentId !== deploymentId) return;
      queryClient.setQueryData<{ status: string } | undefined>(
        ['deployment', deploymentId],
        (prev) => (prev ? { ...prev, status: payload.status } : prev),
      );
      queryClient.invalidateQueries({ queryKey: ['deployment', deploymentId] });
      handlersRef.current?.onStatus?.(payload);
    };

    const onLog = (payload: DeploymentLogPayload) => {
      if (payload.deploymentId !== deploymentId) return;
      handlersRef.current?.onLog?.(payload);
    };

    if (socket.connected) join();
    socket.on('connect', join);
    socket.on('deployment:status', onStatus);
    socket.on('deployment:log', onLog);

    return () => {
      socket.emit('deployment:unsubscribe', deploymentId);
      socket.off('connect', join);
      socket.off('deployment:status', onStatus);
      socket.off('deployment:log', onLog);
    };
  }, [socket, deploymentId, queryClient]);
}
