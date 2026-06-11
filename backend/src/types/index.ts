/**
 * @module types
 * @description Core TypeScript type definitions for the Carbon Footprint Awareness Platform.
 * All shared interfaces, types, and enums used across the application.
 */

/** Emission categories supported by the platform */
export type EmissionCategory = 'transportation' | 'energy' | 'food' | 'shopping';

/** All valid emission categories as a readonly array */
export const EMISSION_CATEGORIES: readonly EmissionCategory[] = [
  'transportation',
  'energy',
  'food',
  'shopping',
] as const;

/** Full user record as stored in the database */
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Public user data (excludes sensitive fields like passwordHash) */
export interface UserPublic {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** A single carbon footprint activity record */
export interface FootprintRecord {
  id: number;
  userId: number;
  category: EmissionCategory;
  activityType: string;
  value: number;
  unit: string;
  co2Equivalent: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

/** A personalized recommendation for reducing carbon footprint */
export interface Recommendation {
  id: number;
  category: EmissionCategory;
  action: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
  description: string;
}

/** An achievement badge earned by the user */
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

/** A community challenge */
export interface Challenge {
  id: number;
  title: string;
  description: string;
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
}

/**
 * Generic API response wrapper.
 * All API endpoints return data in this format for consistency.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Pagination metadata included in paginated responses */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Paginated API response with metadata */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: PaginationMeta;
}

/** JWT access and refresh token pair */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Request body for user login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Request body for user registration */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/** Request body for logging a carbon footprint activity */
export interface LogActivityRequest {
  category: EmissionCategory;
  activityType: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

/** Summary statistics for a user's emissions */
export interface StatsResponse {
  totalEmissions: number;
  monthlyEmissions: number;
  dailyAverage: number;
  comparisonToAverage: number;
  streak: number;
  totalActivities: number;
}

/** Category breakdown of emissions */
export interface BreakdownResponse {
  categories: Array<{
    category: EmissionCategory;
    total: number;
    percentage: number;
    count: number;
  }>;
  period: string;
  totalEmissions: number;
}

/** Trend data points over a period */
export interface TrendResponse {
  dataPoints: Array<{
    date: string;
    total: number;
    categories: Record<EmissionCategory, number>;
  }>;
  period: string;
  average: number;
}

/** Comparison data against average users */
export interface ComparisonResponse {
  userMonthly: number;
  averageMonthly: number;
  percentile: number;
  categoryComparison: Array<{
    category: EmissionCategory;
    userTotal: number;
    averageTotal: number;
  }>;
}

/** JWT token payload after decoding */
export interface TokenPayload {
  userId: number;
  jti?: string;
  iat?: number;
  exp?: number;
}

/** Extended Express Request with authenticated user */
export interface AuthenticatedUser {
  userId: number;
  email: string;
  name: string;
}
