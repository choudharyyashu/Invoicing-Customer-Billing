import React from 'react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  className = '',
  id,
  required = false,
  placeholder = 'Select an option...',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className={`block w-full appearance-none rounded-lg border text-sm transition-colors duration-150 pl-3.5 pr-10 py-2 bg-white
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200' 
              : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-400'
            }
            focus:outline-none focus:ring-3 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer
            ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
