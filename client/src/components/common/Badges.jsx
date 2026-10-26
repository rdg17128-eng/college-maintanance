import React from 'react';
import { STATUS_CONFIG } from '../../constants';

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium ${config.color} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const isEmergency = priority === 'Emergency';
  const isHigh = priority === 'High';

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  if (priority === 'Medium') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  if (priority === 'High') badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
  if (isEmergency) badgeColor = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${badgeColor} ${sizeClasses}`}>
      {isEmergency ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
      ) : isHigh ? (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      )}
      {priority}
    </span>
  );
}
