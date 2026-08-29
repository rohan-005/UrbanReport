'use client';

import { createTheme } from '@mui/material/styles';

export const urbanTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f3ee', // Warm off-white civic environment
      paper: '#ffffff',   // Crisp warm white card surface
    },
    primary: {
      main: '#89a577',    // Muddy Sage Green primary
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#877b5f',    // Earthy Taupe secondary accent
      contrastText: '#ffffff',
    },
    error: {
      main: '#b85d38',    // Terracotta earth red
    },
    warning: {
      main: '#d97706',    // Warm amber
    },
    info: {
      main: '#3f4636',    // Deep earth slate
    },
    success: {
      main: '#4e6d3c',    // Deep forest olive
    },
    text: {
      primary: '#3f4636',   // Deep earthy dark typography (#3F4636)
      secondary: '#5f604f', // Muted earthy secondary (#5F604F)
      disabled: '#9ca3af',
    },
    divider: '#e2dfd7',
  },
  shape: {
    borderRadius: 8, // Standard 8px radius
  },
  typography: {
    fontFamily: [
      'var(--font-sans)',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: ['var(--font-display)', 'Lora', 'Georgia', 'serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      color: '#3f4636',
    },
    h2: {
      fontFamily: ['var(--font-display)', 'Lora', 'Georgia', 'serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.15,
      color: '#3f4636',
    },
    h3: {
      fontFamily: ['var(--font-display)', 'Lora', 'Georgia', 'serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      color: '#3f4636',
    },
    h4: {
      fontFamily: ['var(--font-display)', 'Lora', 'Georgia', 'serif'].join(','),
      fontWeight: 700,
      letterSpacing: '-0.005em',
      color: '#3f4636',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.04em',
    },
    overline: {
      letterSpacing: '0.08em',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#89a577',
          color: '#ffffff',
          border: '1px solid #89a577',
          '&:hover': {
            backgroundColor: '#6e895d',
            borderColor: '#6e895d',
          },
        },
        outlined: {
          borderColor: '#e2dfd7',
          color: '#3f4636',
          '&:hover': {
            borderColor: '#877b5f',
            backgroundColor: '#f5f3ee',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #e2dfd7',
          borderRadius: 8,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e2dfd7',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill status chips
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2dfd7',
            },
            '&:hover fieldset': {
              borderColor: '#877b5f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#89a577',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  },
});


