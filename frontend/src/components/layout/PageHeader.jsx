import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  className = '',
}) => {
  return (
    <div className={`mb-5 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 no-print ${className}`}>
      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 && (
          <nav className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-slate-500 mb-1 sm:mb-1.5" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-blue-600 transition-colors truncate max-w-[140px] sm:max-w-none">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-800 font-semibold truncate max-w-[160px] sm:max-w-none">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
