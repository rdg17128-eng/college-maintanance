import React from 'react';

export function CategoryIcon({ category }) {
  return (
    <span className="text-[11px] font-bold text-black uppercase">
      [{category}]
    </span>
  );
}
