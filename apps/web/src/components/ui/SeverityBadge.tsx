import React from 'react';
import { Severity } from '@/lib/types';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  LOW: {
    label: 'Low',
    bg: 'bg-slate-800/70',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: Info,
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-amber-950/70',
    text: 'text-amber-300',
    border: 'border-amber-700/60',
    icon: AlertCircle,
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-950/70',
    text: 'text-orange-300',
    border: 'border-orange-700/60',
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-950/80',
    text: 'text-red-300 animate-pulse',
    border: 'border-red-600/80',
    icon: ShieldAlert,
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const config = severityConfig[severity] || severityConfig.LOW;
  const Icon = config.icon;

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
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};
