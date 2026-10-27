import React from 'react';

export function CategoryIcon({ category }) {
  // Pure text representation without diagrams or icons
  return (
    <span className="text-[11px] font-bold text-slate-500 uppercase">
      [{category}]
    </span>
  );
}
