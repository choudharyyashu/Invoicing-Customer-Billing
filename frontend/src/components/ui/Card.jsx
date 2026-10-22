import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-6',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs transition-all duration-200 
        ${hover ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''} 
        ${padding} 
        ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};
