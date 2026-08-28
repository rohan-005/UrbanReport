import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { MapPin, ThumbsUp, Calendar, ArrowRight, User } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote?: (id: string) => void;
  isUpvoted?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onUpvote,
  isUpvoted = false,
}) => {
  const imageUrl =
    complaint.media && complaint.media.length > 0
      ? complaint.media[0].url
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card hoverable className="overflow-hidden flex flex-col h-full group border-slate-800 bg-slate-900/90">
      {/* Card Header Media Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={imageUrl}
          alt={complaint.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <CategoryBadge category={complaint.category} size="sm" />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <SeverityBadge severity={complaint.severity} size="sm" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[11px] font-mono text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
            {complaint.id}
          </span>
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{complaint.address}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{complaint.reporter.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onUpvote) onUpvote(complaint.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isUpvoted
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-sky-400 text-sky-400' : ''}`} />
            <span>{complaint.upvotesCount} Upvotes</span>
          </button>

          <Link
            href={`/complaints/${complaint.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
