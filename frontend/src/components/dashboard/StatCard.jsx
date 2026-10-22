import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'positive', // positive | negative | neutral
  subtitle,
  iconColor = 'text-blue-600 bg-blue-50 border-blue-100',
  className = '',
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      hover={!!onClick}
      padding="p-3 sm:p-4"
      className={`relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
          <h4
            className="text-base sm:text-lg xl:text-xl font-black text-slate-900 mt-0.5 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
            title={value}
          >
            {value}
          </h4>
        </div>
        {Icon && (
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${iconColor}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-bold gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs shrink-0 ${
                changeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : changeType === 'negative'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {changeType === 'positive' && <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {changeType === 'negative' && <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium truncate text-[10px] sm:text-xs">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
