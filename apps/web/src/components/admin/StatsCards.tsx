import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  XCircle
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    submitted: number;
    underReview: number;
    verified: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    reopened: number;
    rejected: number;
    critical: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      label: 'All registered reports',
      icon: FileText,
      color: 'text-sky-400',
      border: 'border-slate-800',
    },
    {
      title: 'Critical Emergency',
      value: stats.critical,
      label: 'Immediate hazard alerts',
      icon: AlertTriangle,
      color: 'text-rose-400 animate-pulse',
      border: 'border-rose-800/60 bg-rose-950/20',
    },
    {
      title: 'Pending Review',
      value: stats.submitted + stats.underReview,
      label: 'Awaiting triage',
      icon: Clock,
      color: 'text-amber-400',
      border: 'border-amber-800/40 bg-amber-950/10',
    },
    {
      title: 'Verified & Assigned',
      value: stats.verified + stats.assigned,
      label: 'Dispatched to departments',
      icon: UserCheck,
      color: 'text-purple-400',
      border: 'border-purple-800/40 bg-purple-950/10',
    },
    {
      title: 'Active In Progress',
      value: stats.inProgress,
      label: 'On-site crew repair work',
      icon: Wrench,
      color: 'text-cyan-400',
      border: 'border-cyan-800/40 bg-cyan-950/10',
    },
    {
      title: 'Resolved Successfully',
      value: stats.resolved,
      label: 'Work completed',
      icon: CheckCircle,
      color: 'text-emerald-400',
      border: 'border-emerald-800/40 bg-emerald-950/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 rounded-2xl bg-slate-900 border ${card.border} space-y-2 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-slate-400 line-clamp-1">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
};
