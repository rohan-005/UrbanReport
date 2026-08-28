import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

interface LoadingStateProps {
  message?: string;
  height?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading civic telemetry...',
  height = 'h-64',
}) => {
  return (
    <Paper
      elevation={0}
      className={`w-full ${height} flex flex-col items-center justify-center p-8`}
      sx={{
        backgroundColor: '#ffffff',
        borderColor: '#e2e0d8',
        borderRadius: '2px',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400, spaceY: 2, textCenter: 'center' }}>
        <Skeleton
          variant="rectangular"
          height={6}
          sx={{ backgroundColor: '#e2e0d8', borderRadius: '2px', mb: 2 }}
        />
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#09090b',
            display: 'block',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Paper>
  );
};
