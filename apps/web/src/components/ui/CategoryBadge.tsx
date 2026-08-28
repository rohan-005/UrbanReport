import React from 'react';
import { Category } from '@/lib/types';
import { 
  Car, 
  Trash2, 
  Lightbulb, 
  Droplet, 
  Construction, 
  Waves, 
  Activity, 
  HelpCircle 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const categoryIcons: Record<Category, React.ElementType> = {
  Pothole: Construction,
  Garbage: Trash2,
  Streetlight: Lightbulb,
  Drainage: Waves,
  'Road Damage': Construction,
  'Water Supply': Droplet,
  Traffic: Activity,
  Other: HelpCircle,
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
}) => {
  const Icon = categoryIcons[category] || HelpCircle;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} text-sky-400`} />}
      <span>{category}</span>
    </span>
  );
};
