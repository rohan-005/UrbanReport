'use client';

import React, { useEffect } from 'react';
import { TimelineEvent } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { animateTimelineNodes } from '@/lib/motion/gsap';
import { Clock, User } from 'lucide-react';

interface ComplaintTimelineProps {
  timeline: TimelineEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ timeline }) => {
  useEffect(() => {
    animateTimelineNodes('.timeline-item-node');
  }, [timeline]);

  if (!timeline || timeline.length === 0) {
    return <Typography variant="body2" sx={{ color: '#52525b' }}>No activity history logged yet.</Typography>;
  }

  return (
    <Box className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-300">
      {timeline.map((event, idx) => {
        const isLatest = idx === 0;

        return (
          <Box key={event.id || idx} className="timeline-item-node relative flex items-start gap-4 group">
            {/* Timeline Icon Node */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
                border: '1px solid',
                borderColor: isLatest ? '#09090b' : '#9ca3af',
                backgroundColor: isLatest ? '#09090b' : '#ffffff',
                color: isLatest ? '#ffffff' : '#09090b',
              }}
            >
              <Clock className="w-3.5 h-3.5" />
            </Box>

            {/* Event Content Card */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2.5,
                backgroundColor: '#ffffff',
                borderColor: '#e2e0d8',
                borderRadius: '2px',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: '#09090b',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#09090b' }}>
                    {event.title}
                  </Typography>
                  <StatusBadge status={event.status} size="small" showIcon={false} />
                </Box>
                <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace', fontWeight: 600 }}>
                  {new Date(event.timestamp).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#52525b', fontSize: '0.8125rem', mb: 2, leading: 1.6 }}>
                {event.description}
              </Typography>

              {event.notes && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '2px',
                    backgroundColor: '#f5f3ee',
                    border: '1px solid #e2e0d8',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#18181b',
                    mb: 2,
                  }}
                >
                  <strong className="text-zinc-950 uppercase font-black">NOTES: </strong>
                  {event.notes}
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pt: 1.5, borderTop: '1px solid #e2e0d8', fontSize: '0.75rem', color: '#52525b' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <User className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="font-semibold text-zinc-900">{event.actor.name}</span>
                </Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    px: 1,
                    py: 0.25,
                    borderRadius: '2px',
                    backgroundColor: '#f5f3ee',
                    color: '#09090b',
                    border: '1px solid #e2e0d8',
                  }}
                >
                  {event.actor.role}
                </Typography>
              </Box>
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};
