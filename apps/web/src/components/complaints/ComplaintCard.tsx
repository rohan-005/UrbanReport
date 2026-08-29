import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { ComplaintImage } from '../ui/ComplaintImage';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MapPin, ThumbsUp, Calendar, ArrowRight, User, Layers } from 'lucide-react';
import { MediaService } from '@/lib/services/mediaService';

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
  const primaryMedia = complaint.media && complaint.media.length > 0 ? complaint.media[0] : null;
  const imageUrl = primaryMedia ? MediaService.getMediaUrl(primaryMedia.url) : null;
  const totalPhotos = complaint.media ? complaint.media.length : 0;

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        borderColor: '#e2dfd7',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#877b5f',
          boxShadow: '0 4px 12px rgba(31,36,29,0.06)',
        },
      }}
    >
      {/* Card Image Area */}
      <Box sx={{ position: 'relative', height: 180, width: '100%', overflow: 'hidden', backgroundColor: '#f5f3ee' }}>
        <ComplaintImage
          src={imageUrl}
          alt={complaint.title}
          height={180}
          containerClassName="relative w-full h-full overflow-hidden bg-[#f5f3ee]"
        />

        {/* Gradient Overlay for Readable Text over Image */}
        {imageUrl && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(31,36,29,0.85) 0%, rgba(31,36,29,0.2) 40%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Category Badge & Multi-Photo Count (Top Left) */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryBadge category={complaint.category} size="small" />
          {totalPhotos > 1 && (
            <span className="flex items-center gap-1 bg-[#1f241d]/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 backdrop-blur-xs">
              <Layers className="w-3 h-3 text-[#89a577]" />
              +{totalPhotos - 1}
            </span>
          )}
        </Box>

        {/* Severity Badge (Top Right) */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <SeverityBadge severity={complaint.severity} size="small" />
        </Box>

        {/* Tracking Reference & Status Badge (Bottom Bar) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            zIndex: 10,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              color: '#ffffff',
              backgroundColor: 'rgba(31,36,29,0.85)',
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {complaint.id}
          </Typography>
          <StatusBadge status={complaint.status} size="small" />
        </Box>
      </Box>

      {/* Card Body */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title & Description Region */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#3f4636',
              lineHeight: 1.3,
              minHeight: '1.35rem',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={complaint.title}
          >
            {complaint.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#5f604f',
              mt: 0.75,
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              minHeight: '2.35rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={complaint.description}
          >
            {complaint.description}
          </Typography>
        </Box>

        {/* Metadata Section - Anchored Above Action Row */}
        <Box sx={{ pt: 1.5, borderTop: '1px solid #e2dfd7', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#5f604f', fontSize: '0.75rem', mb: 1, minHeight: '1.25rem' }}>
            <MapPin className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
            <span className="truncate font-medium text-[#3f4636]" title={complaint.address}>
              {complaint.address}
            </span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#5f604f', fontSize: '0.75rem', pt: 0.5, minHeight: '1.25rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}>
              <User className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
              <span className="font-semibold text-[#3f4636] truncate max-w-[110px]">
                {complaint.reporter?.name || 'Citizen'}
              </span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, shrink: 0 }}>
              <Calendar className="w-3.5 h-3.5 text-[#877b5f]" />
              <span className="font-mono text-[#5f604f]">{formattedDate}</span>
            </Box>
          </Box>
        </Box>

        {/* Action Row - Fixed Baseline Alignment */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            mt: 1.5,
            borderTop: '1px solid #e2dfd7',
            height: '40px',
            shrink: 0,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onUpvote) onUpvote(complaint.id);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 h-8 rounded-md text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] min-w-[105px] ${
              isUpvoted
                ? 'bg-[#89a577] text-white border border-[#89a577]'
                : 'bg-[#f5f3ee] text-[#3f4636] border border-[#e2dfd7] hover:bg-[#e2dfd7]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white text-white' : 'text-[#877b5f]'}`} />
            <span>{complaint.upvotesCount} UPVOTES</span>
          </button>

          <Link
            href={`/complaints/${complaint.id}`}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#3f4636] hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-md px-2 py-1"
          >
            <span>DOSSIER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};
