import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex gap-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-t border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};
