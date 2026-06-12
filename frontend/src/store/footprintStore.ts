/**
 * @module store/footprintStore
 * @description Zustand store for footprint activity state management.
 */

import { create } from "zustand";
import type {
  FootprintRecord,
  StatsResponse,
  BreakdownResponse,
  TrendResponse,
  Recommendation,
  LogActivityRequest,
} from "../types";
import { footprint, stats, recommendations } from "../api/client";

interface FootprintState {
  todayRecords: FootprintRecord[];
  weekRecords: FootprintRecord[];
  monthRecords: FootprintRecord[];
  statsData: StatsResponse | null;
  breakdownData: BreakdownResponse | null;
  trendData: TrendResponse | null;
  recommendationsList: Recommendation[];
  isLoading: boolean;
  error: string | null;
  logActivity: (data: LogActivityRequest) => Promise<FootprintRecord>;
  fetchToday: () => Promise<void>;
  fetchWeek: () => Promise<void>;
  fetchMonth: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchBreakdown: (period?: string) => Promise<void>;
  fetchTrend: (period?: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useFootprintStore = create<FootprintState>((set, get) => ({
  todayRecords: [],
  weekRecords: [],
  monthRecords: [],
  statsData: null,
  breakdownData: null,
  trendData: null,
  recommendationsList: [],
  isLoading: false,
  error: null,

  logActivity: async (data: LogActivityRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await footprint.log(data);
      const record = response.data!.record;
      set((state) => ({
        todayRecords: [record, ...state.todayRecords],
        isLoading: false,
      }));
      // Refresh stats in background
      get().fetchStats();
      get().fetchBreakdown();
      return record;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to log activity";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchToday: async () => {
    try {
      const response = await footprint.getToday();
      set({ todayRecords: response.data?.records || [] });
    } catch {
      set({ todayRecords: [] });
    }
  },

  fetchWeek: async () => {
    try {
      const response = await footprint.getWeek();
      set({ weekRecords: response.data?.records || [] });
    } catch {
      set({ weekRecords: [] });
    }
  },

  fetchMonth: async () => {
    try {
      const response = await footprint.getMonth();
      set({ monthRecords: response.data?.records || [] });
    } catch {
      set({ monthRecords: [] });
    }
  },

  fetchStats: async () => {
    try {
      const response = await stats.getSummary();
      set({ statsData: response.data || null });
    } catch {
      set({ statsData: null });
    }
  },

  fetchBreakdown: async (period = "month") => {
    try {
      const response = await stats.getBreakdown(period);
      set({ breakdownData: response.data || null });
    } catch {
      set({ breakdownData: null });
    }
  },

  fetchTrend: async (period = "month") => {
    try {
      const response = await stats.getTrend(period);
      set({ trendData: response.data || null });
    } catch {
      set({ trendData: null });
    }
  },

  fetchRecommendations: async () => {
    try {
      const response = await recommendations.get();
      set({ recommendationsList: response.data?.recommendations || [] });
    } catch {
      set({ recommendationsList: [] });
    }
  },

  deleteActivity: async (id: number) => {
    try {
      await footprint.delete(id);
      set((state) => ({
        todayRecords: state.todayRecords.filter((r) => r.id !== id),
        weekRecords: state.weekRecords.filter((r) => r.id !== id),
        monthRecords: state.monthRecords.filter((r) => r.id !== id),
      }));
      get().fetchStats();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to delete activity";
      set({ error: message });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchToday(),
      get().fetchWeek(),
      get().fetchStats(),
      get().fetchBreakdown(),
      get().fetchTrend(),
      get().fetchRecommendations(),
    ]);
    set({ isLoading: false });
  },
}));
