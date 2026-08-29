'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/ui/Logo';
import { LoadingButton } from '@/components/ui/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3ee', py: { xs: 4, md: 8 }, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' }, gap: 0, backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e0d8', shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Civic Branding Showcase */}
        <Box sx={{ p: { xs: 4, md: 6 }, backgroundColor: '#09090b', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Logo size="lg" variant="light" showTagline />
            <Box sx={{ mt: 6, mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 'wide', mb: 2, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.1 }}>
                Report. Track. <br />
                <span className="text-zinc-400">Improve Your City.</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa', leading: 'relaxed', fontSize: '0.875rem' }}>
                UrbanReports connects citizens and municipal dispatch directly through map-first geospatial issue tracking and transparent infrastructure management.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 4, borderTop: '1px solid #27272a' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <MapPin className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Geospatial Pinpointing
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Report potholes, streetlights, and drainage issues with exact GPS coordinates.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ShieldCheck className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Verified Citizen Identity
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Secure JWT authentication & Aadhaar verification for trustworthy civic reports.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckCircle2 className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Transparent Resolution Status
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Follow resolution progress in real time from submission to municipal sign-off.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 700, letterSpacing: '0.05em' }}>
              MUNICIPAL DISPATCH v2.4
            </Typography>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 700 }}>
              SRID 4326 GIS
            </Typography>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Authentication Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5, letterSpacing: '-0.02em' }}>
              Portal Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: '#52525b', fontWeight: 500 }}>
              Enter your credentials to access your citizen identity or officer portal.
            </Typography>
          </Box>

          {errorMessage && (
            <Box sx={{ p: 2, mb: 3, borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              size="medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail className="w-4 h-4 text-zinc-400" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              size="medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="w-4 h-4 text-zinc-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
              <FormControlLabel
                control={<Checkbox defaultChecked sx={{ color: '#52525b', '&.Mui-checked': { color: '#09090b' } }} />}
                label={<Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>Remember session</Typography>}
              />
            </Box>

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
                py: 1.5,
                mt: 1,
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { backgroundColor: '#18181b' },
              }}
            >
              Sign In to Portal
            </LoadingButton>

            <Box sx={{ pt: 3, mt: 2, borderTop: '1px solid #e2e0d8', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#52525b', fontWeight: 600, fontSize: '0.8125rem' }}>
                Need a citizen account?{' '}
                <Link href="/register" className="font-bold text-zinc-950 underline hover:text-black transition-colors">
                  Register Citizen Profile
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
