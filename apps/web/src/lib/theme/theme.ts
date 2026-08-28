'use client';

import { createTheme } from '@mui/material/styles';

export const urbanTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#09090b', // Deep rich black
      paper: '#121215',   // Off-black architectural card surface
    },
    primary: {
      main: '#f8fafc',    // Off-white primary control color
      contrastText: '#09090b',
    },
    secondary: {
      main: '#27272a',    // Dark warm neutral
      contrastText: '#f8fafc',
    },
    error: {
      main: '#dc2626',    // Restrained crimson
    },
    warning: {
      main: '#d97706',    // Warm amber
    },
    info: {
      main: '#71717a',    // Zinc gray metadata
    },
    success: {
      main: '#16a34a',    // Muted emerald
    },
    text: {
      primary: '#f8fafc',
      secondary: '#a1a1aa',
      disabled: '#52525b',
    },
    divider: '#27272a',
  },
  shape: {
    borderRadius: 2, // Architectural minimal 2px rounding
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
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    overline: {
      letterSpacing: '0.1em',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#f8fafc',
          color: '#09090b',
          border: '1px solid #ffffff',
          '&:hover': {
            backgroundColor: '#e2e8f0',
          },
        },
        outlined: {
          borderColor: '#27272a',
          color: '#f8fafc',
          '&:hover': {
            borderColor: '#52525b',
            backgroundColor: '#18181b',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #27272a',
          borderRadius: 2,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid #27272a',
          backgroundColor: '#121215',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '& fieldset': {
              borderColor: '#27272a',
            },
            '&:hover fieldset': {
              borderColor: '#52525b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f8fafc',
              borderWidth: '1px',
            },
          },
        },
      },
    },
  },
});
