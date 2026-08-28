'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { validateAadhaarNumber, formatAadhaarInput, validateEmail, validatePhone } from '@/lib/utils/validation';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!phone.trim() || !validatePhone(phone)) newErrors.phone = 'Valid phone is required.';
    if (!password || password.length < 6) newErrors.password = 'Min 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    const aadhaarResult = validateAadhaarNumber(aadhaarNumber);
    if (!aadhaarResult.isValid) {
      newErrors.aadhaarNumber = aadhaarResult.error || 'Invalid Aadhaar format.';
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
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyCenter: 'center', backgroundColor: '#f5f3ee', py: 8 }}>
      <Container maxWidth="sm">
        <Box sx={{ textCenter: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
            Citizen Identity Registration
          </Typography>
          <Typography variant="body2" sx={{ color: '#52525b' }}>
            Register profile for issue reporting and ward status updates
          </Typography>
        </Box>

        <Paper elevation={0} component="form" onSubmit={handleRegister} sx={{ p: 4, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errors.form && (
            <Box sx={{ p: 2, borderRadius: '2px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errors.form}</span>
            </Box>
          )}

          <TextField
            label="Full Name *"
            required
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email *"
                type="email"
                required
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
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
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password *"
                type="password"
                required
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password *"
                type="password"
                required
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
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
            />

            <Box sx={{ p: 1.5, mt: 1, borderRadius: '2px', backgroundColor: '#f5f3ee', border: '1px solid #e2e0d8', fontSize: '0.75rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0" />
              <span>Format is checked locally (12 digits, non-repeating). No UIDAI integration occurs.</span>
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting}
            sx={{
              backgroundColor: '#09090b',
              color: '#ffffff',
              fontWeight: 900,
              py: 1.25,
              mt: 1,
              '&:hover': { backgroundColor: '#18181b' },
            }}
          >
            {submitting ? 'Registering Account...' : 'Complete Registration'}
          </Button>

          <Box sx={{ pt: 2, borderTop: '1px solid #e2e0d8', textCenter: 'center' }}>
            <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
              Already registered?{' '}
              <Link href="/login" className="font-bold text-black underline">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
