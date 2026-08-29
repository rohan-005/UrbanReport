import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MapPin, ThumbsUp, Calendar, ArrowRight, User } from 'lucide-react';

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
  const imageUrl =
    complaint.media && complaint.media.length > 0
      ? MediaService.getMediaUrl(complaint.media[0].url)
      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';

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
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#877b5f',
          boxShadow: '0 4px 12px rgba(31,36,29,0.06)',
        },
      }}
    >
      {/* Card Image */}
      <Box sx={{ position: 'relative', height: 180, width: '100%', overflow: 'hidden', backgroundColor: '#1f241d' }}>
        <img
          src={imageUrl}
          alt={complaint.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(31,36,29,0.85), transparent)',
          }}
        />

        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
          <CategoryBadge category={complaint.category} size="small" />
        </Box>

        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <SeverityBadge severity={complaint.severity} size="small" />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}
          >
            {complaint.id}
          </Typography>
          <StatusBadge status={complaint.status} size="small" />
        </Box>
      </Box>

      {/* Card Body */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#1f241d',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {complaint.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              mt: 0.75,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {complaint.description}
          </Typography>
        </Box>

        <Box sx={{ pt: 1.5, borderTop: '1px solid #e2dfd7', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280', fontSize: '0.75rem', mb: 1 }}>
            <MapPin className="w-3.5 h-3.5 text-[#877b5f] shrink-0" />
            <span className="truncate font-medium">{complaint.address}</span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.75rem', pt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <User className="w-3.5 h-3.5 text-[#877b5f]" />
              <span className="font-semibold text-[#1f241d]">{complaint.reporter.name}</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Calendar className="w-3.5 h-3.5 text-[#877b5f]" />
              <span className="font-mono text-[#6b7280]">{formattedDate}</span>
            </Box>
          </Box>
        </Box>

        {/* Action Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: '1px solid #e2dfd7',
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onUpvote) onUpvote(complaint.id);
            }}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] ${
              isUpvoted
                ? 'bg-[#89a577] text-white border border-[#89a577]'
                : 'bg-[#f5f3ee] text-[#1f241d] border border-[#e2dfd7] hover:bg-[#e2dfd7]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white text-white' : 'text-[#877b5f]'}`} />
            <span>{complaint.upvotesCount} UPVOTES</span>
          </button>

          <Link
            href={`/complaints/${complaint.id}`}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1f241d] hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs px-1"
          >
            <span>DOSSIER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

