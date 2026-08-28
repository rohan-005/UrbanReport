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
    return <Typography variant="body2" sx={{ color: '#a1a1aa' }}>No activity history logged yet.</Typography>;
  }

  return (
    <Box className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-800">
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
                borderColor: isLatest ? '#f8fafc' : '#3f3f46',
                backgroundColor: isLatest ? '#f8fafc' : '#09090b',
                color: isLatest ? '#09090b' : '#a1a1aa',
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
                backgroundColor: '#121215',
                borderColor: '#27272a',
                borderRadius: '2px',
                '&:hover': {
                  borderColor: '#52525b',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    {event.title}
                  </Typography>
                  <StatusBadge status={event.status} size="small" showIcon={false} />
                </Box>
                <Typography variant="caption" sx={{ color: '#71717a', fontFamily: 'monospace' }}>
                  {new Date(event.timestamp).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#a1a1aa', fontSize: '0.8125rem', mb: 2, leading: 1.6 }}>
                {event.description}
              </Typography>

              {event.notes && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '2px',
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#e4e4e7',
                    mb: 2,
                  }}
                >
                  <strong className="text-zinc-100 uppercase">NOTES: </strong>
                  {event.notes}
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', pt: 1.5, borderTop: '1px solid #27272a', fontSize: '0.75rem', color: '#71717a' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{event.actor.name}</span>
                </Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    px: 1,
                    py: 0.25,
                    borderRadius: '2px',
                    backgroundColor: '#18181b',
                    color: '#a1a1aa',
                    border: '1px solid #27272a',
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
