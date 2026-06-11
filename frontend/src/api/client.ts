/**
 * @module api/client
 * @description Axios HTTP client with JWT interceptors and typed API methods.
 * Handles token attachment, automatic refresh on 401, and error formatting.
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  ApiResponse, AuthTokens, User, FootprintRecord, StatsResponse,
  BreakdownResponse, TrendResponse, ComparisonResponse, Recommendation,
  LoginRequest, RegisterRequest, LogActivityRequest, PaginationMeta,
} from '../types';

/** Create configured Axios instance */
const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/** Attach JWT token to all requests */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Handle 401 responses with automatic token refresh */
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post<ApiResponse<{ tokens: AuthTokens }>>('/api/v1/auth/refresh', { refreshToken });
          if (res.data.data) {
            localStorage.setItem('accessToken', res.data.data.tokens.accessToken);
            localStorage.setItem('refreshToken', res.data.data.tokens.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.tokens.accessToken}`;
            return client(originalRequest);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

/** Auth API methods */
export const auth = {
  register: (data: RegisterRequest) =>
    client.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    client.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', data).then((r) => r.data),

  me: () =>
    client.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () =>
    client.post<ApiResponse<{ message: string }>>('/auth/logout').then((r) => r.data),
};

/** Footprint API methods */
export const footprint = {
  log: (data: LogActivityRequest) =>
    client.post<ApiResponse<{ record: FootprintRecord }>>('/footprint/log', data).then((r) => r.data),

  getToday: () =>
    client.get<ApiResponse<{ records: FootprintRecord[] }>>('/footprint/today').then((r) => r.data),

  getWeek: () =>
    client.get<ApiResponse<{ records: FootprintRecord[] }>>('/footprint/week').then((r) => r.data),

  getMonth: () =>
    client.get<ApiResponse<{ records: FootprintRecord[] }>>('/footprint/month').then((r) => r.data),

  getHistory: (page = 1, limit = 20) =>
    client.get<ApiResponse<{ records: FootprintRecord[] }> & { pagination: PaginationMeta }>(
      `/footprint/history?page=${page}&limit=${limit}`,
    ).then((r) => r.data),

  delete: (id: number) =>
    client.delete<ApiResponse<{ message: string }>>(`/footprint/${id}`).then((r) => r.data),
};

/** Stats API methods */
export const stats = {
  getSummary: () =>
    client.get<ApiResponse<StatsResponse>>('/stats/summary').then((r) => r.data),

  getBreakdown: (period = 'month') =>
    client.get<ApiResponse<BreakdownResponse>>(`/stats/breakdown?period=${period}`).then((r) => r.data),

  getTrend: (period = 'month') =>
    client.get<ApiResponse<TrendResponse>>(`/stats/trend?period=${period}`).then((r) => r.data),

  getComparison: () =>
    client.get<ApiResponse<ComparisonResponse>>('/stats/comparison').then((r) => r.data),
};

/** Recommendations API methods */
export const recommendations = {
  get: () =>
    client.get<ApiResponse<{ recommendations: Recommendation[] }>>('/recommendations').then((r) => r.data),
};

export default client;
