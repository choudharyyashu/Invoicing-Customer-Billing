import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="-mb-px flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-none pb-0.5" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap py-2.5 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-150 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0
                ${isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
