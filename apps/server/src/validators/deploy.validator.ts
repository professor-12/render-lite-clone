import { z } from 'zod';

import { BUILD_LANGUAGES } from '../libs/build/build-language';

const buildLanguageEnum = z.enum(BUILD_LANGUAGES as unknown as [string, ...string[]]);

/** Request body from the import / deploy UI (matches ImportFormState + env). */
export const createProjectBodySchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  gitUrl: z.string().min(1, 'Repository URL is required'),
  branch: z.string().min(1),
  rootDir: z.string(),
  outDir: z.string().optional(),
  installCommand: z.string(),
  buildCommand: z.string(),
  startCommand: z.string(),
  useDockerCommands: z.boolean(),
  buildLanguage: buildLanguageEnum.default('javascript'),
  projectType: z.enum(['static', 'dynamic']),
  env: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
