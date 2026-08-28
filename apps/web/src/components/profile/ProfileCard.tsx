'use client';

import React from 'react';
import { User } from '@/lib/types';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { ShieldCheck, Mail, Phone, CreditCard } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  submittedCount: number;
  activeCount: number;
  resolvedCount: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  submittedCount,
  activeCount,
  resolvedCount,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        backgroundColor: '#ffffff',
        borderColor: '#e2e0d8',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Top Accent Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: '#09090b',
        }}
      />

      <Grid container spacing={3} alignItems="center">
        {/* Left: Identity Avatar & Info */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            {/* Square Architectural Avatar */}
            <Box
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: '2px',
                backgroundColor: '#09090b',
                border: '1px solid #09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#ffffff',
                shrink: 0,
                overflow: 'hidden',
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#09090b' }}>
                  {user.name}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: '2px',
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span>{user.role}</span>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#52525b', fontFamily: 'monospace', display: 'block', mb: 1.5, fontWeight: 700 }}>
                CITIZEN ID: {user.id.toUpperCase()}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.75rem', color: '#52525b', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Mail className="w-3.5 h-3.5 text-zinc-700" />
                  <span>{user.email}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Phone className="w-3.5 h-3.5 text-zinc-700" />
                  <span>{user.phone}</span>
                </Box>
                {user.aadhaarNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontFamily: 'monospace' }}>
                    <CreditCard className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Aadhaar: {user.aadhaarNumber}</span>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right: Structured Stats Block */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: '#f5f3ee',
                  border: '1px solid #e2e0d8',
                  borderRadius: '2px',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#09090b' }}>
                  {submittedCount}
                </Typography>
                <Typography variant="overline" sx={{ color: '#52525b', fontSize: '0.625rem', display: 'block', mt: 0.5, fontWeight: 800 }}>
                  Submitted
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: '#f5f3ee',
                  border: '1px solid #e2e0d8',
                  borderRadius: '2px',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#09090b' }}>
                  {activeCount}
                </Typography>
                <Typography variant="overline" sx={{ color: '#52525b', fontSize: '0.625rem', display: 'block', mt: 0.5, fontWeight: 800 }}>
                  Active Work
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: '#f5f3ee',
                  border: '1px solid #e2e0d8',
                  borderRadius: '2px',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#09090b' }}>
                  {resolvedCount}
                </Typography>
                <Typography variant="overline" sx={{ color: '#52525b', fontSize: '0.625rem', display: 'block', mt: 0.5, fontWeight: 800 }}>
                  Resolved
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
