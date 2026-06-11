/**
 * @module config/environment
 * @description Validates and exports typed environment configuration.
 * Uses Zod for runtime validation of all environment variables on startup.
 * Throws a clear error if required variables are missing or malformed.
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Zod schema for environment variable validation */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('24h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  DATABASE_PATH: z.string().default('./data/carbon_footprint.sqlite'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),
});

/** Validated and typed environment configuration */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * @returns Typed configuration object
 * @throws {Error} If required env vars are missing or invalid
 */
function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}

/** Exported validated config – lazily loaded for test overrideability */
let _config: EnvConfig | null = null;

/**
 * Get the validated environment configuration.
 * Caches the result after first call.
 */
export function getConfig(): EnvConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Reset cached config (useful for testing).
 */
export function resetConfig(): void {
  _config = null;
}

export default getConfig;
