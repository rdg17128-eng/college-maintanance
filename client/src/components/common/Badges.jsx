import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm font-bold' 
    : 'px-2.5 py-0.5 text-xs font-semibold';

  const getStatusColor = (st) => {
    switch (st) {
      case 'Submitted':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Assigned':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'In Progress':
        return 'bg-violet-50 text-violet-800 border-violet-300';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  return (
    <span className={`inline-block border rounded font-semibold ${getStatusColor(status)} ${sizeClasses}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  let badgeColor = 'bg-slate-50 text-slate-700 border-slate-300';
  if (priority === 'Medium') badgeColor = 'bg-sky-50 text-sky-800 border-sky-300';
  if (priority === 'High') badgeColor = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  if (priority === 'Emergency') badgeColor = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';

  return (
    <span className={`inline-block border rounded ${badgeColor} ${sizeClasses}`}>
      Priority: {priority}
    </span>
  );
}
