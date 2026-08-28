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
      main: '#09090b',    // Deep black primary control color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e2e0d8',    // Warm neutral secondary surface
      contrastText: '#09090b',
    },
    error: {
      main: '#dc2626',    // Restrained crimson
    },
    warning: {
      main: '#d97706',    // Warm amber
    },
    info: {
      main: '#52525b',    // Slate dark metadata
    },
    success: {
      main: '#16a34a',    // Muted emerald
    },
    text: {
      primary: '#09090b',   // Deep near-black typography
      secondary: '#52525b', // Neutral secondary
      disabled: '#a1a1aa',
    },
    divider: '#e2e0d8',
  },
  shape: {
    borderRadius: 2, // Minimal 2px architectural rounding
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
      fontWeight: 900,
      letterSpacing: '-0.03em',
      lineHeight: 1.05,
      color: '#09090b',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      color: '#09090b',
    },
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
      color: '#09090b',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.01em',
      color: '#09090b',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 800,
      letterSpacing: '0.05em',
    },
    overline: {
      letterSpacing: '0.1em',
      fontWeight: 800,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#09090b',
          color: '#ffffff',
          border: '1px solid #09090b',
          '&:hover': {
            backgroundColor: '#18181b',
          },
        },
        outlined: {
          borderColor: '#d1d5db',
          color: '#09090b',
          '&:hover': {
            borderColor: '#09090b',
            backgroundColor: '#f3f1ec',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #e2e0d8',
          borderRadius: 2,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #e2e0d8',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: '#09090b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#09090b',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  },
});
