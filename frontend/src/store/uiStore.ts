/**
 * @module store/uiStore
 * @description Zustand store for UI state — dark mode, sidebar, toasts.
 * Persists dark mode preference and auto-detects system preference.
 */

import { create } from "zustand";
import type { Toast } from "../types";

interface UIState {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  toasts: Toast[];
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

/** Detect system dark mode preference */
function getSystemPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Load saved preference or fall back to system preference */
function loadDarkMode(): boolean {
  const saved = localStorage.getItem("darkMode");
  if (saved !== null) return saved === "true";
  return getSystemPreference();
}

/** Apply dark mode class to document */
function applyDarkMode(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Apply on initial load
const initialDarkMode = loadDarkMode();
applyDarkMode(initialDarkMode);

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: initialDarkMode,
  isSidebarOpen: false,
  toasts: [],

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem("darkMode", String(newMode));
      applyDarkMode(newMode);
      return { isDarkMode: newMode };
    }),

  setDarkMode: (dark: boolean) => {
    localStorage.setItem("darkMode", String(dark));
    applyDarkMode(dark);
    set({ isDarkMode: dark });
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 5000);
  },

  hideToast: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
