import api from '@/app/client/client';
import { useQuery } from '@tanstack/react-query';

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
    refetchInterval: 1500,
  });
};

export const fetchDeploymentLogs = async (deploymentId: string, cursor?: string | null) => {
  const { data } = await api.get(`/project/deployments/${deploymentId}/logs`, {
    params: cursor ? { cursor } : undefined,
  });
  return data.data as DeploymentLogsResponse;
};

