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
  LOW: { label: 'Low', bg: '#f5f3ee', text: '#52525b', border: '#d1d5db' },
  MEDIUM: { label: 'Medium', bg: '#e2e0d8', text: '#18181b', border: '#9ca3af' },
  HIGH: { label: 'High', bg: '#18181b', text: '#ffffff', border: '#18181b' },
  CRITICAL: { label: 'Critical', bg: '#dc2626', text: '#ffffff', border: '#b91c1c' },
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
        px: size === 'small' ? 1 : 1.5,
        py: size === 'small' ? 0.25 : 0.5,
        fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
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
