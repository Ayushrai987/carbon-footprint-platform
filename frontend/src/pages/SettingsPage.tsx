import React from 'react';
import { User, Moon, Sun, Bell, Shield, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

/** Settings page with profile, theme, and account management */
export default function SettingsPage(): React.ReactElement {
  const { user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Settings</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Name</label>
            <input type="text" defaultValue={user?.name || ''} className="input-field" readOnly aria-label="Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email</label>
            <input type="email" defaultValue={user?.email || ''} className="input-field" readOnly aria-label="Email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Member since</label>
            <input type="text" defaultValue={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} className="input-field" readOnly aria-label="Member since" />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          {isDarkMode ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-accent-500" />}
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
          <div>
            <p className="text-sm font-medium text-dark-800 dark:text-dark-200">Dark Mode</p>
            <p className="text-xs text-dark-400">Switch between light and dark themes</p>
          </div>
          <button onClick={toggleDarkMode} role="switch" aria-checked={isDarkMode} aria-label="Toggle dark mode"
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-primary-500' : 'bg-dark-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          {['Weekly emission reports', 'Achievement badges', 'Challenge reminders'].map((label) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <span className="text-sm text-dark-700 dark:text-dark-300">{label}</span>
              <button role="switch" aria-checked={true} aria-label={`Toggle ${label}`}
                className="relative w-12 h-6 rounded-full bg-primary-500 transition-colors">
                <div className="absolute top-0.5 translate-x-6 w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Security</h2>
        </div>
        <button className="btn-secondary w-full">Change Password</button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card border-red-200 dark:border-red-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">Once you delete your account, there is no going back.</p>
        <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
