import React from 'react';
import { ComplaintStatus } from '@/lib/types';
import Box from '@mui/material/Box';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  SUBMITTED: { label: 'Submitted', bg: '#f5f3ee', text: '#1f241d', border: '#e2dfd7' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  VERIFIED: { label: 'Verified', bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  ASSIGNED: { label: 'Assigned', bg: '#f0f4f8', text: '#334155', border: '#cbd5e1' },
  IN_PROGRESS: { label: 'In Progress', bg: '#d4faff', text: '#0e7490', border: '#a5f3fc' },
  RESOLVED: { label: 'Resolved', bg: '#eef6ea', text: '#4e6d3c', border: '#a8c38e' },
  REOPENED: { label: 'Reopened', bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const config = statusConfig[status] || statusConfig.SUBMITTED;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: size === 'small' ? 1.25 : 1.75,
        py: size === 'small' ? 0.35 : 0.6,
        fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </Box>
  );
};

