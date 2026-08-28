import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function GlobalLoading() {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f3ee',
        gap: 2,
      }}
    >
      <CircularProgress size={32} sx={{ color: '#09090b' }} />
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#09090b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Loading Telemetry...
      </Typography>
    </Box>
  );
}
