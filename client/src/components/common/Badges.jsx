import React from 'react';

const STATUS_STYLES = {
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Assigned': 'bg-sky-50 text-sky-700 border-sky-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
};

const PRIORITY_STYLES = {
  'Low': 'bg-slate-100 text-slate-700 border-slate-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'High': 'bg-amber-50 text-amber-700 border-amber-200',
  'Emergency': 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
};

export function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClass = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${style} ${sizeClass}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const style = PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClass = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${style} ${sizeClass}`}>
      {priority}
    </span>
  );
}
