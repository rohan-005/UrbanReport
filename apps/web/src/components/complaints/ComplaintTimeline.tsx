import React from 'react';
import { TimelineEvent } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { Clock, User, ShieldCheck, CheckCircle, Wrench, AlertCircle } from 'lucide-react';

interface ComplaintTimelineProps {
  timeline: TimelineEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm text-slate-400">No activity history logged yet.</p>;
  }

  const roleBadges = {
    CITIZEN: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
    ADMIN: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
    OFFICER: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    SYSTEM: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
      {timeline.map((event, idx) => {
        const isLatest = idx === 0;

        return (
          <div key={event.id || idx} className="relative flex items-start gap-4 group">
            {/* Timeline Icon Node */}
            <div
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                isLatest
                  ? 'bg-sky-600 border-sky-400 text-white ring-4 ring-sky-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>

            {/* Event Content Card */}
            <div className="flex-1 rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 transition-all group-hover:border-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">{event.title}</h4>
                  <StatusBadge status={event.status} size="sm" showIcon={false} />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(event.timestamp).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {event.description}
              </p>

              {event.notes && (
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 mb-3 font-mono">
                  <span className="text-sky-400 font-bold">Notes: </span>
                  {event.notes}
                </div>
              )}

              {/* Actor attribution */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.actor.name}</span>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
                    roleBadges[event.actor.role] || roleBadges.SYSTEM
                  }`}
                >
                  {event.actor.role}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
