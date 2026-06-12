/**
 * @module api/middlewares/errorHandler.middleware
 * @description Global error handling middleware.
 * Catches all errors and returns consistent JSON error responses.
 * Hides stack traces in production for security.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

/** Structured error with status code and error code */
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Global error handler middleware.
 * Must be registered after all routes.
 * Provides consistent error response format across the entire API.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode === 500 ? 'An unexpected error occurred' : err.message;

  if (statusCode >= 500) {
    logger.error(`Server error: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`Client error [${statusCode}]: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
}

/**
 * Handle 404 Not Found for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
