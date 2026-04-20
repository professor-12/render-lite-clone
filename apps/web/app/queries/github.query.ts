import api from '@/app/client/client';
import type { ImportFormState } from '@/app/new/import/_components/ImportDeployForm';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetUserRepos = () => {
  return useQuery({
    queryKey: ['user-repos'],
    queryFn: async () => {
      const { data } = await api.get('/github/repositories', {});
      return data.data;
    },
    retry: 2,
  });
};

export const useDetectService = (githubUrl: string) => {
  return useQuery({
    queryKey: ['detect-service', githubUrl],
    queryFn: async () => {
      const { data } = await api.post('/detect-service', { githubUrl });
      return data.data;
    },
    enabled: !!githubUrl.trim(),
    retry: 2,
  });
};

export const useCreateProject = (projectData: ImportFormState) => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/project/create', projectData);
      return data.data;
    },
  });
};
