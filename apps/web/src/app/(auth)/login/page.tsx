'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/auth.repository';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authRepository.login(email);
      router.push('/profile');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyCenter: 'center', backgroundColor: '#09090b', py: 8 }}>
      <Container maxWidth="xs">
        <Box sx={{ textCenter: 'center', mb: 4 }}>
          <Box sx={{ w: 10, h: 10, borderRadius: '2px', backgroundColor: '#18181b', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyCenter: 'center', mx: 'auto', mb: 2, color: '#f8fafc', fontWeight: 900 }}>
            UR
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc', mb: 0.5 }}>
            Portal Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
            Access citizen identity or municipal dispatch
          </Typography>
        </Box>

        <Paper elevation={0} component="form" onSubmit={handleLogin} sx={{ p: 4, backgroundColor: '#121215', borderColor: '#27272a', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email Address"
            type="email"
            required
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormControlLabel
            control={<Checkbox defaultChecked sx={{ color: '#52525b', '&.Mui-checked': { color: '#f8fafc' } }} />}
            label={<Typography variant="caption" sx={{ color: '#a1a1aa' }}>Remember session</Typography>}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={<LogIn className="w-4 h-4" />}
            sx={{
              backgroundColor: '#f8fafc',
              color: '#09090b',
              fontWeight: 900,
              py: 1.25,
              '&:hover': { backgroundColor: '#e2e8f0' },
            }}
          >
            Sign In
          </Button>

          <Box sx={{ pt: 2, borderTop: '1px solid #27272a', textCenter: 'center' }}>
            <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
              Need an account?{' '}
              <Link href="/register" className="font-bold text-white underline">
                Register Citizen Profile
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
