import React from 'react';
import { ComplaintStatus } from '@/lib/types';
import { 
  FileText, 
  Eye, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  CheckCircle, 
  RotateCcw, 
  XCircle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-blue-950/60',
    text: 'text-blue-400',
    border: 'border-blue-800/50',
    icon: FileText,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-800/50',
    icon: Eye,
  },
  VERIFIED: {
    label: 'Verified',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-800/50',
    icon: CheckCircle2,
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-purple-950/60',
    text: 'text-purple-400',
    border: 'border-purple-800/50',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-400',
    border: 'border-cyan-800/50',
    icon: Wrench,
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-green-950/60',
    text: 'text-green-400',
    border: 'border-green-800/50',
    icon: CheckCircle,
  },
  REOPENED: {
    label: 'Reopened',
    bg: 'bg-orange-950/60',
    text: 'text-orange-400',
    border: 'border-orange-800/50',
    icon: RotateCcw,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-950/60',
    text: 'text-rose-400',
    border: 'border-rose-800/50',
    icon: XCircle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = statusConfig[status] || statusConfig.SUBMITTED;
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
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};
