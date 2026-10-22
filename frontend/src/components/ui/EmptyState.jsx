import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button onClick={onAction} icon={actionIcon} variant="primary" size="md">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button onClick={onSecondaryAction} variant="outline" size="md">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
