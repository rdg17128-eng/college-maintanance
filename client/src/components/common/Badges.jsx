import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm font-bold' 
    : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span className={`inline-block border border-sky-400 bg-sky-50 text-black font-semibold rounded ${sizeClasses}`}>
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

  return (
    <span className={`inline-block border border-sky-300 bg-white text-black font-medium rounded ${sizeClasses}`}>
      Priority: {priority}
    </span>
  );
}
