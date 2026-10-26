import React from 'react';
import {
  Zap,
  Droplets,
  Sparkles,
  Wind,
  Armchair,
  Monitor,
  GlassWater,
  Wifi,
  HelpCircle,
  Wrench
} from 'lucide-react';

export function CategoryIcon({ category, className = 'w-4 h-4' }) {
  switch (category) {
    case 'Electrical':
      return <Zap className={`${className} text-amber-500`} />;
    case 'Plumbing':
      return <Droplets className={`${className} text-blue-500`} />;
    case 'Cleaning and Hygiene':
      return <Sparkles className={`${className} text-emerald-500`} />;
    case 'Fan or Air Conditioning':
      return <Wind className={`${className} text-sky-500`} />;
    case 'Furniture and Equipment':
      return <Armchair className={`${className} text-orange-500`} />;
    case 'Computer or Lab Equipment':
      return <Monitor className={`${className} text-indigo-500`} />;
    case 'Water Supply':
      return <GlassWater className={`${className} text-cyan-600`} />;
    case 'Internet or Network':
      return <Wifi className={`${className} text-violet-500`} />;
    default:
      return <HelpCircle className={`${className} text-slate-500`} />;
  }
}
