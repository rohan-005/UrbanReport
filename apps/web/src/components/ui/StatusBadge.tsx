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
  SUBMITTED: { label: 'Submitted', bg: '#f5f3ee', text: '#18181b', border: '#d1d5db' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#e2e0d8', text: '#09090b', border: '#9ca3af' },
  VERIFIED: { label: 'Verified', bg: '#18181b', text: '#ffffff', border: '#18181b' },
  ASSIGNED: { label: 'Assigned', bg: '#27272a', text: '#ffffff', border: '#27272a' },
  IN_PROGRESS: { label: 'In Progress', bg: '#09090b', text: '#ffffff', border: '#09090b' },
  RESOLVED: { label: 'Resolved', bg: '#16a34a', text: '#ffffff', border: '#15803d' },
  REOPENED: { label: 'Reopened', bg: '#d97706', text: '#ffffff', border: '#b45309' },
  REJECTED: { label: 'Rejected', bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
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
        px: size === 'small' ? 1 : 1.5,
        py: size === 'small' ? 0.25 : 0.5,
        fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        borderRadius: '2px',
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
