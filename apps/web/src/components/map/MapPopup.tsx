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
    <div className="w-64 p-1 space-y-3 font-sans text-[#1f241d]">
      {/* Category & Badges */}
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={complaint.category} size="small" />
        <SeverityBadge severity={complaint.severity} size="small" />
      </div>

      {/* Title */}
      <div>
        <h4 className="text-sm font-bold text-[#1f241d] line-clamp-2 leading-snug font-display">
          {complaint.title}
        </h4>
        <p className="text-[11px] text-[#6b7280] font-mono mt-0.5">{complaint.id}</p>
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-xs text-[#6b7280]">
        <MapPin className="w-3.5 h-3.5 text-[#877b5f] shrink-0 mt-0.5" />
        <span className="line-clamp-2">{complaint.address}</span>
      </div>

      {/* Status & Upvotes */}
      <div className="flex items-center justify-between pt-2 border-t border-[#e2dfd7]">
        <StatusBadge status={complaint.status} size="small" />
        <div className="flex items-center gap-1 text-xs text-[#6b7280] font-medium">
          <ThumbsUp className="w-3 h-3 text-[#877b5f]" />
          <span>{complaint.upvotesCount}</span>
        </div>
      </div>

      {/* Details CTA Link */}
      <Link
        href={`/complaints/${complaint.id}`}
        className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-md bg-[#89a577] hover:bg-[#6e895d] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577]"
      >
        <span>View Dossier</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

