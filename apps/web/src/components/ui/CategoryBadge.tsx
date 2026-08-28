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
        px: size === 'small' ? 1 : 1.25,
        py: size === 'small' ? 0.25 : 0.5,
        fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderRadius: '2px',
        backgroundColor: '#09090b',
        color: '#ffffff',
        border: '1px solid #09090b',
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </Box>
  );
};
