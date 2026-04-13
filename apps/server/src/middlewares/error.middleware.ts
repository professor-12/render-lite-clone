import { type NextFunction, type Request, type Response } from 'express';
import { logger } from './httplogger.middleware';
import { AppError } from '../errors/Apperror';
import { ZodError } from 'zod';

export const errorHandler = async (
  error: unknown,
  req: Request,
  res: Response,
  Next: NextFunction,
) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      message: 'Invalid json syntax. check your request body....',
      data: null,
      success: false,
      errorData: 'Invalid json syntaxt. check your request body....',
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      data: null,
      success: false,
      errorData: error.name,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid data',
      errors: error.issues.map((e) => e.path.join('.') + ': ' + e.message).join(', '),
      success: false,
      errorData: error.issues.map((e) => e.message).join(', '),
    });
  }

  logger.error({ err: error }, 'Unhandled error');
  return res.status(500).json({
    message: 'Something went wrong!!!',
    data: null,
    success: false,
    errorData: 'Internal server error',
  });
};
