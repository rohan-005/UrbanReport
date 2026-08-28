import React from 'react';
import { ComplaintStatus } from '@/lib/types';
import Chip from '@mui/material/Chip';
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
  SUBMITTED: { label: 'Submitted', bg: '#18181b', text: '#e4e4e7', border: '#27272a' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#27272a', text: '#f4f4f5', border: '#3f3f46' },
  VERIFIED: { label: 'Verified', bg: '#18181b', text: '#ffffff', border: '#52525b' },
  ASSIGNED: { label: 'Assigned', bg: '#27272a', text: '#e4e4e7', border: '#3f3f46' },
  IN_PROGRESS: { label: 'In Progress', bg: '#09090b', text: '#ffffff', border: '#a1a1aa' },
  RESOLVED: { label: 'Resolved', bg: '#f8fafc', text: '#09090b', border: '#ffffff' },
  REOPENED: { label: 'Reopened', bg: '#27272a', text: '#f4f4f5', border: '#71717a' },
  REJECTED: { label: 'Rejected', bg: '#09090b', text: '#a1a1aa', border: '#3f3f46' },
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
        fontWeight: 700,
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
