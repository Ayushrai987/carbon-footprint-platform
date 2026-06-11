/**
 * @module api/validators/auth.validators
 * @description Zod v4 validation schemas for authentication endpoints.
 * Enforces strong password requirements and email format validation.
 */

import { z } from 'zod';

/** Registration request validation schema */
export const registerSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Must be a valid email address')
    .max(255, 'Email must be at most 255 characters')
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),

  name: z
    .string({ error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .transform((val) => val.trim()),
});

/** Login request validation schema */
export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Must be a valid email address')
    .transform((val) => val.toLowerCase().trim()),

  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

/** Refresh token request validation schema */
export const refreshTokenSchema = z.object({
  refreshToken: z.string({ error: 'Refresh token is required' }).min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
