import React from 'react';
import { Severity } from '@/lib/types';
import Box from '@mui/material/Box';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'small' | 'medium';
}

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; border: string }
> = {
  LOW: { label: 'Low', bg: '#f5f3ee', text: '#6b7280', border: '#e2dfd7' },
  MEDIUM: { label: 'Medium', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  HIGH: { label: 'High', bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
  CRITICAL: { label: 'Critical', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'small',
}) => {
  const config = severityConfig[severity] || severityConfig.LOW;

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

