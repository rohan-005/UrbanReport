import React from 'react';
import { Category } from '@/lib/types';
import Box from '@mui/material/Box';

interface CategoryBadgeProps {
  category: Category;
  size?: 'small' | 'medium';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'small',
}) => {
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
        backgroundColor: '#1f241d',
        color: '#ffffff',
        border: '1px solid #1f241d',
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </Box>
  );
};

