import api from '@/app/client/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type DeploymentLogRow = {
  id: string;
  type: 'stdout' | 'stderr';
  log: string;
  createdAt: string;
};

export type DeploymentMeta = {
  id: string;
  status: string;
  updatedAt: string;
  createdAt?: string;
};

export type DeploymentLogsResponse = {
  deployment: DeploymentMeta;
  logs: DeploymentLogRow[];
  nextCursor: string | null;
};

export const useGetDeployment = (deploymentId: string) => {
  return useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: async () => {
      const { data } = await api.get(`/project/deployments/${deploymentId}`);
      return data.data as {
        id: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        project: { id: string; name: string };
      };
    },
    enabled: !!deploymentId,
  });
};

export const fetchDeploymentLogs = async (
  deploymentId: string,
  cursor?: string | null,
  signal?: AbortSignal,
) => {
  const { data } = await api.get(`/project/deployments/${deploymentId}/logs`, {
    params: cursor ? { cursor } : undefined,
    signal,
  });
  return data.data as DeploymentLogsResponse;
};



export const useRedeploy = (deploymentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/project/deployments/${deploymentId}/redeploy`);
      return data.data as {
        projectId: string;
        deploymentId: string;
        status: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment', deploymentId] });
    },
  });
};