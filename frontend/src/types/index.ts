/**
 * @module types
 * @description Shared TypeScript type definitions for the frontend.
 * Mirrors backend types for type-safe API communication.
 */

/** Emission categories supported by the platform */
export type EmissionCategory = 'transportation' | 'energy' | 'food' | 'shopping';

/** Public user profile (no sensitive fields) */
export interface User {
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

/** A personalized recommendation */
export interface Recommendation {
  id: number;
  category: EmissionCategory;
  action: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
  description: string;
}

/** JWT token pair */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Array<{ field: string; message: string }> };
  pagination?: PaginationMeta;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Summary statistics */
export interface StatsResponse {
  totalEmissions: number;
  monthlyEmissions: number;
  dailyAverage: number;
  comparisonToAverage: number;
  streak: number;
  totalActivities: number;
}

/** Category breakdown */
export interface BreakdownItem {
  category: EmissionCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface BreakdownResponse {
  categories: BreakdownItem[];
  period: string;
  totalEmissions: number;
}

/** Trend data point */
export interface TrendDataPoint {
  date: string;
  total: number;
  categories: Record<EmissionCategory, number>;
}

export interface TrendResponse {
  dataPoints: TrendDataPoint[];
  period: string;
  average: number;
}

/** Comparison against averages */
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

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/** Log activity request */
export interface LogActivityRequest {
  category: EmissionCategory;
  activityType: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

/** Toast notification */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
