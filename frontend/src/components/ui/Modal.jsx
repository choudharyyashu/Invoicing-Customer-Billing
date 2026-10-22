import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  footer,
  hideClose = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] my-auto animate-fade-in overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Sticky at top) */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="pr-4">
              {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
        )}

        {/* Body (Scrollable if tall) */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 text-slate-700">
          {children}
        </div>

        {/* Footer (Sticky at bottom with visible buttons) */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
