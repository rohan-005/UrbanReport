'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/ui/Logo';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { validateAadhaarNumber, formatAadhaarInput, validateEmail, validatePhone } from '@/lib/utils/validation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { ShieldCheck, AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarInput(e.target.value);
    setAadhaarNumber(formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim() || !validateEmail(email)) newErrors.email = 'Valid email is required.';
    if (!phone.trim() || !validatePhone(phone)) newErrors.phone = 'Valid 10-digit phone is required.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    const aadhaarResult = validateAadhaarNumber(aadhaarNumber);
    if (!aadhaarResult.isValid) {
      newErrors.aadhaarNumber = aadhaarResult.error || 'Invalid 12-digit Aadhaar format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        aadhaarNumber,
      });
      router.push('/profile');
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3ee', py: { xs: 4, md: 8 }, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 0, backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e0d8', shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Civic Branding & Governance Info */}
        <Box sx={{ p: { xs: 4, md: 6 }, backgroundColor: '#09090b', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Logo size="lg" variant="light" showTagline />
            <Box sx={{ mt: 6, mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 'wide', mb: 2, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.1 }}>
                Create Your <br />
                <span className="text-zinc-400">Citizen Identity.</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa', leading: 'relaxed', fontSize: '0.875rem' }}>
                Join thousands of residents actively contributing to safer streets, responsive water infrastructure, and transparent city management.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 4, borderTop: '1px solid #27272a' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <UserCheck className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Verified Report Tracking
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Access your personal dashboard to track submitted issues and municipal updates.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ShieldCheck className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Local Aadhaar Format Validation
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Format checked locally (12 digits, non-repeating). No external UIDAI API calls occur.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckCircle2 className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8125rem' }}>
                    Community Resolution Power
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a1a1aa', fontSize: '0.75rem' }}>
                    Upvote nearby community complaints to elevate urgent civic repair priorities.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 700, letterSpacing: '0.05em' }}>
              CIVIC REGISTER v2.4
            </Typography>
            <Typography variant="caption" sx={{ color: '#71717a', fontWeight: 700 }}>
              SECURE AUTH
            </Typography>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Registration Form */}
        <Box component="form" onSubmit={handleRegister} sx={{ p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5, letterSpacing: '-0.02em' }}>
              Citizen Registration
            </Typography>
            <Typography variant="body2" sx={{ color: '#52525b', fontWeight: 500 }}>
              Fill in your details to create an official issue reporting profile.
            </Typography>
          </Box>

          {errors.form && (
            <Box sx={{ p: 2, mb: 3, borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errors.form}</span>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name *"
              required
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User className="w-4 h-4 text-zinc-400" />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  required
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="w-4 h-4 text-zinc-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Phone *"
                  required
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone className="w-4 h-4 text-zinc-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password *"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="w-4 h-4 text-zinc-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <TextField
                label="Aadhaar Number (12 Digits) *"
                required
                fullWidth
                size="small"
                placeholder="5555 6666 7777"
                value={aadhaarNumber}
                onChange={handleAadhaarChange}
                error={Boolean(errors.aadhaarNumber)}
                helperText={errors.aadhaarNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ p: 1.25, mt: 1, borderRadius: '2px', backgroundColor: '#f5f3ee', border: '1px solid #e2e0d8', fontSize: '0.75rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0" />
                <span>Format checked locally (12 digits, non-repeating). No UIDAI integration.</span>
              </Box>
            </Box>

            <LoadingButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={submitting}
              loadingText="Creating Profile..."
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
              Complete Registration
            </LoadingButton>

            <Box sx={{ pt: 2, mt: 1, borderTop: '1px solid #e2e0d8', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#52525b', fontWeight: 600, fontSize: '0.8125rem' }}>
                Already registered?{' '}
                <Link href="/login" className="font-bold text-zinc-950 underline hover:text-black transition-colors">
                  Sign In to Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
