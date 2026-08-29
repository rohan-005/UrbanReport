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
        borderColor: '#e2dfd7',
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
          backgroundColor: '#f5f3ee',
          border: '1px solid #e2dfd7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          color: '#877b5f',
        }}
      >
        <SearchX className="w-6 h-6" />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontFamily: 'var(--font-display), Lora, Georgia, serif',
          fontWeight: 700,
          color: '#1f241d',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{
            backgroundColor: '#89a577',
            color: '#ffffff',
            fontWeight: 700,
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#6e895d' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

