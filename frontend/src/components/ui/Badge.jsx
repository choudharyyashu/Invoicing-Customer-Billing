import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default | success | warning | danger | info | purple | draft
  size = 'md', // sm | md
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    draft: 'bg-slate-100 text-slate-600 border-dashed border-slate-300',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    draft: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-slate-400'} shrink-0`} />
      )}
      {children}
    </span>
  );
};
