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
      <Box sx={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' }, gap: 0, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2dfd7', boxShadow: '0 8px 30px rgba(31, 36, 29, 0.05)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Civic Branding Showcase */}
        <Box sx={{ p: { xs: 4, md: 6 }, backgroundColor: '#1f241d', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <Box>
            <Logo size="lg" variant="light" showTagline />
            <Box sx={{ mt: 6, mb: 6 }}>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, textTransform: 'none', mb: 2, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.1 }}>
                Report. Track. <br />
                <span className="text-[#a8c38e]">Improve Your City.</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#d2c2ad', leading: 'relaxed', fontSize: '0.875rem' }}>
                UrbanReports connects citizens and municipal dispatch directly through map-first geospatial issue tracking and transparent infrastructure management.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <MapPin className="w-5 h-5 text-[#a8c38e] shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Geospatial Pinpointing
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d2c2ad', fontSize: '0.75rem' }}>
                    Report potholes, streetlights, and drainage issues with exact GPS coordinates.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ShieldCheck className="w-5 h-5 text-[#a8c38e] shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Verified Citizen Identity
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d2c2ad', fontSize: '0.75rem' }}>
                    Secure JWT authentication & Aadhaar verification for trustworthy civic reports.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckCircle2 className="w-5 h-5 text-[#a8c38e] shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Transparent Resolution Status
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d2c2ad', fontSize: '0.75rem' }}>
                    Follow resolution progress in real time from submission to municipal sign-off.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#a39578', fontWeight: 700, letterSpacing: '0.04em' }}>
              MUNICIPAL DISPATCH v2.4
            </Typography>
            <Typography variant="caption" sx={{ color: '#a39578', fontWeight: 700 }}>
              SRID 4326 GIS
            </Typography>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Authentication Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 0.5, letterSpacing: '-0.01em' }}>
              Portal Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
              Enter your credentials to access your citizen identity or officer portal.
            </Typography>
          </Box>

          {errorMessage && (
            <Box sx={{ p: 2, mb: 3, borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
                    <Mail className="w-4 h-4 text-[#877b5f]" />
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
                    <Lock className="w-4 h-4 text-[#877b5f]" />
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
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#877b5f]" /> : <Eye className="w-4 h-4 text-[#877b5f]" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
              <FormControlLabel
                control={<Checkbox defaultChecked sx={{ color: '#877b5f', '&.Mui-checked': { color: '#89a577' } }} />}
                label={<Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>Remember session</Typography>}
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
                backgroundColor: '#89a577',
                color: '#ffffff',
                fontWeight: 700,
                py: 1.5,
                mt: 1,
                borderRadius: '8px',
                fontSize: '0.875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 6px -1px rgba(31, 36, 29, 0.08)',
                '&:hover': { backgroundColor: '#6e895d' },
              }}
            >
              Sign In to Portal
            </LoadingButton>

            <Box sx={{ pt: 3, mt: 2, borderTop: '1px solid #e2dfd7', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.8125rem' }}>
                Need a citizen account?{' '}
                <Link href="/register" className="font-bold text-[#1f241d] underline hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
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

