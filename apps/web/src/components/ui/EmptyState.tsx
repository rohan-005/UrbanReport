import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderColor: '#e2e0d8',
        borderRadius: '2px',
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          w: 12,
          h: 12,
          borderRadius: '2px',
          backgroundColor: '#f5f3ee',
          border: '1px solid #e2e0d8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          color: '#09090b',
        }}
      >
        <SearchX className="w-6 h-6" />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 900, color: '#09090b', mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: '#52525b', mb: 3 }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{
            backgroundColor: '#09090b',
            color: '#ffffff',
            fontWeight: 800,
            '&:hover': { backgroundColor: '#18181b' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};
