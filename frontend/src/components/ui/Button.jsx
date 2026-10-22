import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger | success
  size = 'md', // sm | md | lg
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500 border border-transparent active:bg-blue-800',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200/80 active:bg-slate-300',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-blue-500 shadow-2xs active:bg-slate-100',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500 active:bg-red-800',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500 active:bg-emerald-800',
    whatsapp: 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs focus:ring-emerald-400 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      
      {children}

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
};
