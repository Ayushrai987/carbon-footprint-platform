import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
};

/** Toast notification container — renders all active toasts */
export default function ToastContainer(): React.ReactElement {
  const { toasts, hideToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full" role="alert" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div key={toast.id} className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-down ${colors[toast.type]}`}>
            <Icon className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
