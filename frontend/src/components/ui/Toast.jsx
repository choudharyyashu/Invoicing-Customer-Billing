import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    danger: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-white border-emerald-200 text-emerald-900 shadow-lg',
    danger: 'bg-white border-red-200 text-red-900 shadow-lg',
    warning: 'bg-white border-amber-200 text-amber-900 shadow-lg',
    info: 'bg-white border-blue-200 text-blue-900 shadow-lg',
  };

  const iconColors = {
    success: 'text-emerald-500',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || icons.success;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border ${colors[toast.type] || colors.success} animate-fade-in transition-all`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-5 h-5 shrink-0 ${iconColors[toast.type] || iconColors.success}`} />
              <span className="text-sm font-medium text-slate-800">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
