/**
 * @module api/validators/footprint.validators
 * @description Zod v4 validation schemas for footprint logging endpoints.
 * Validates categories, activity types, values, units, and dates.
 */

import { z } from 'zod';

/** Valid emission categories */
const categoryEnum = z.enum(['transportation', 'energy', 'food', 'shopping'], {
  error: 'Category must be one of: transportation, energy, food, shopping',
});

/** Log activity request validation schema */
export const logActivitySchema = z.object({
  category: categoryEnum,

  activityType: z
    .string({ error: 'Activity type is required' })
    .min(1, 'Activity type is required')
    .max(100, 'Activity type must be at most 100 characters'),

  value: z
    .number({ error: 'Value must be a number' })
    .positive('Value must be a positive number')
    .max(100000, 'Value seems unreasonably large'),

  unit: z
    .string({ error: 'Unit is required' })
    .min(1, 'Unit is required')
    .max(20, 'Unit must be at most 20 characters'),

  date: z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

/** History query parameters validation schema */
export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/** Activity ID parameter validation schema */
export const activityIdSchema = z.object({
  id: z.coerce.number().int().positive('Invalid activity ID'),
});

/** Period query parameter validation schema */
export const periodQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year']).default('month'),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;
export type HistoryQueryInput = z.infer<typeof historyQuerySchema>;
export type ActivityIdInput = z.infer<typeof activityIdSchema>;
export type PeriodQueryInput = z.infer<typeof periodQuerySchema>;
