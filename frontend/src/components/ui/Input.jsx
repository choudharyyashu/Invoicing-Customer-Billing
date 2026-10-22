import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200' 
              : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-100 bg-white hover:border-slate-400'
            }
            focus:outline-none focus:ring-3 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
