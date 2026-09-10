import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error && error.name === 'ZodError') {
        const issues = error.issues || error.errors || JSON.parse(error.message);
        res.status(400).json({
          error: 'Validation failed',
          issues: issues.map((e: any) => ({
            path: e.path ? e.path.join('.') : '',
            message: e.message,
          })),
        });
        return;
      }
      logger.error({ error }, 'Unexpected validation error');
      res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}
