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
  LOW: { label: 'Low', bg: '#18181b', text: '#a1a1aa', border: '#27272a' },
  MEDIUM: { label: 'Medium', bg: '#27272a', text: '#e4e4e7', border: '#3f3f46' },
  HIGH: { label: 'High', bg: '#3f3f46', text: '#ffffff', border: '#71717a' },
  CRITICAL: { label: 'Critical', bg: '#450a0a', text: '#fca5a5', border: '#991b1b' },
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
