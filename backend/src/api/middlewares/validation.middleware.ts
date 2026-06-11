/**
 * @module api/middlewares/validation.middleware
 * @description Request validation middleware using Zod v4 schemas.
 * Validates request body, query parameters, or URL parameters
 * and returns structured error responses on failure.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Create middleware that validates request body against a Zod schema.
 * Replaces req.body with the parsed/transformed data on success.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Create middleware that validates query parameters against a Zod schema.
 * Replaces req.query with the parsed/transformed data on success.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query) as Record<string, string>;
      Object.defineProperty(req, 'query', {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Create middleware that validates URL parameters against a Zod schema.
 * Replaces req.params with the parsed/transformed data on success.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params) as Record<string, string>;
      Object.defineProperty(req, 'params', {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid URL parameters',
            details: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}
