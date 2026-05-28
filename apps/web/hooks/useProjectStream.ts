'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/SocketProvider';
import type { ProjectUpdatedPayload } from '@/lib/socket/types';

/**
 * Subscribe to a project's realtime stream. Invalidates the project query
 * whenever the server signals an update (status change, redeploy, etc).
 *
 * Re-joins on reconnect via a `connect` listener so the effect doesn't
 * re-subscribe on every parent render.
 */
export function useProjectStream(projectId: string | null | undefined) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const join = () => socket.emit('project:subscribe', projectId);

    const onUpdated = (payload: ProjectUpdatedPayload) => {
      if (payload.projectId !== projectId) return;
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    };

    if (socket.connected) join();
    socket.on('connect', join);
    socket.on('project:updated', onUpdated);

    return () => {
      socket.emit('project:unsubscribe', projectId);
      socket.off('connect', join);
      socket.off('project:updated', onUpdated);
    };
  }, [socket, projectId, queryClient]);
}
