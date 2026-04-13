import { exec } from 'child_process';
import { prisma } from '../../libs/prisma';
import type { CreateProjectBody } from '../../validators/deploy.validator';
import { logger } from '../../libs/logger';

export class DeployServiceService {
  public createProject = async (validatedData: CreateProjectBody, userId: string) => {
    
    return null;
  };
}
