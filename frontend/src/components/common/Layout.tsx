import React from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

/** Main application layout with header, sidebar, and content area */
export default function Layout({ children }: LayoutProps): React.ReactElement {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-300">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn-primary">
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 dark:border-dark-700/30" role="banner">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to="/dashboard" className="flex items-center gap-2" aria-label="Carbon Footprint Tracker home">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient hidden sm:block">EcoTrack</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-accent-400" /> : <Moon className="w-5 h-5 text-dark-500" />}
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-dark-200 dark:border-dark-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold" aria-hidden="true">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-dark-700 dark:text-dark-300 hidden md:block">{user?.name}</span>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Main content */}
      <main id="main-content" className="lg:pl-64 pt-16 min-h-screen" role="main">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
