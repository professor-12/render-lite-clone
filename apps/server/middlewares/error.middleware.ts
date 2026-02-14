import { error } from 'console';
import { type NextFunction, type Request, type Response } from 'express';

export const errorHandler = async (error: any, req: Request, res: Response, Next: NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      message: 'Invalid json syntax. check your request body....',
      data: null,
      success: false,
      errorData: 'Invalid json syntaxt. check your request body....',
    });
  }

  res.status(500).json({
    message: 'Something went wrong!!!',
    data: null,
    success: false,
    errorData: 'Internal server error',
  });
};
