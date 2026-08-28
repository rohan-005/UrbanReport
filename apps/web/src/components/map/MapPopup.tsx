import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { MapPin, ArrowRight, ThumbsUp } from 'lucide-react';

interface MapPopupProps {
  complaint: Complaint;
}

export const MapPopup: React.FC<MapPopupProps> = ({ complaint }) => {
  return (
    <div className="w-64 p-1 space-y-3">
      {/* Category & Badges */}
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={complaint.category} size="sm" />
        <SeverityBadge severity={complaint.severity} size="sm" />
      </div>

      {/* Title */}
      <div>
        <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">
          {complaint.title}
        </h4>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{complaint.id}</p>
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-xs text-slate-300">
        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{complaint.address}</span>
      </div>

      {/* Status & Upvotes */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
        <StatusBadge status={complaint.status} size="sm" />
        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
          <ThumbsUp className="w-3 h-3 text-sky-400" />
          <span>{complaint.upvotesCount}</span>
        </div>
      </div>

      {/* Details CTA Link */}
      <Link
        href={`/complaints/${complaint.id}`}
        className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
