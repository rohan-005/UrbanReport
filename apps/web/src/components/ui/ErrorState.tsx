import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while processing this request.',
  onRetry,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderRadius: '8px',
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '8px',
          backgroundColor: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          color: '#ffffff',
        }}
      >
        <AlertOctagon className="w-6 h-6" />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontFamily: 'var(--font-display), Lora, Georgia, serif',
          fontWeight: 700,
          color: '#991b1b',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: '#b91c1c', mb: 3 }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          size="small"
          onClick={onRetry}
          startIcon={<RefreshCw className="w-4 h-4" />}
          sx={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 700,
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#b91c1c' },
          }}
        >
          Retry Request
        </Button>
      )}
    </Paper>
  );
};

