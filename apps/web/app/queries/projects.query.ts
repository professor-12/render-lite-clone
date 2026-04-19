import api from '@/app/client/client';
import { useQuery } from '@tanstack/react-query';

export type ProjectLatestDeployment = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = {
  id: string;
  name: string;
  repoUrl: string;
  branch: string;
  rootDir: string;
  outDir: string | null;
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
  deploymentsCount: number;
  latestDeployment: ProjectLatestDeployment | null;
};

export const useGetProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data } = await api.get(`/project/${projectId}`);
      return data.data as ProjectDetail;
    },
    refetchInterval: 3000,
  });
};

