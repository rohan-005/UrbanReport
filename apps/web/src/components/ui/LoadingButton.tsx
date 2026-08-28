'use client';

import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  disabled,
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        position: 'relative',
        transition: 'all 0.15s ease-in-out',
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: '2px',
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} color="inherit" thickness={5} />
          <span>{loadingText || children}</span>
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};
