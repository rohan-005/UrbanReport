'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoadingButton } from '@/components/ui/LoadingButton';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'OFFICER' || loggedUser.role === 'AUTHORITY') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email address or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyCenter: 'center', backgroundColor: '#f5f3ee', py: 8 }}>
      <Container maxWidth="xs">
        <Box sx={{ textCenter: 'center', mb: 4 }}>
          <Box sx={{ w: 10, h: 10, borderRadius: '2px', backgroundColor: '#09090b', border: '1px solid #09090b', display: 'flex', alignItems: 'center', justifyCenter: 'center', mx: 'auto', mb: 2, color: '#ffffff', fontWeight: 900 }}>
            UR
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
            Portal Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: '#52525b' }}>
            Access citizen identity or municipal dispatch
          </Typography>
        </Box>

        <Paper elevation={0} component="form" onSubmit={handleLogin} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errorMessage && (
            <Box sx={{ p: 1.5, borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </Box>
          )}

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
            control={<Checkbox defaultChecked sx={{ color: '#52525b', '&.Mui-checked': { color: '#09090b' } }} />}
            label={<Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>Remember session</Typography>}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={submitting}
            loadingText="Signing In..."
            startIcon={<LogIn className="w-4 h-4" />}
            sx={{
              backgroundColor: '#09090b',
              color: '#ffffff',
              fontWeight: 900,
              py: 1.25,
              '&:hover': { backgroundColor: '#18181b' },
            }}
          >
            Sign In
          </LoadingButton>

          <Box sx={{ pt: 2, borderTop: '1px solid #e2e0d8', textCenter: 'center' }}>
            <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
              Need an account?{' '}
              <Link href="/register" className="font-bold text-black underline">
                Register Citizen Profile
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
