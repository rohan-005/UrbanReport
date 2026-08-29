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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'OFFICER' || loggedUser.role === 'AUTHORITY') {
        router.push('/admin');
      } else {
        setErrorMessage('Access denied. This account does not possess municipal administrator permissions.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f3ee', py: { xs: 4, md: 8 }, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' }, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2dfd7', boxShadow: '0 8px 30px rgba(31, 36, 29, 0.05)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Authority Portal Badge */}
        <Box sx={{ p: { xs: 4, md: 6 }, backgroundColor: '#1f241d', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Logo size="lg" variant="light" showTagline />
            
            <Box sx={{ mt: 5, mb: 4 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, backgroundColor: '#2a3128', border: '1px solid #89a577', borderRadius: '9999px', mb: 2 }}>
                <ShieldCheck className="w-4 h-4 text-[#a8c38e]" />
                <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Municipal Authority Portal
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, textTransform: 'none', mb: 1.5, fontSize: { xs: '1.5rem', md: '1.875rem' }, lineHeight: 1.2 }}>
                Administrative Dispatch & Triage Control
              </Typography>
              <Typography variant="body2" sx={{ color: '#d2c2ad', leading: 'relaxed', fontSize: '0.875rem' }}>
                Secure authentication portal for department heads, field officers, and system administrators.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Building2 className="w-4 h-4 text-[#a8c38e] shrink-0" />
                <Typography variant="caption" sx={{ color: '#d2c2ad', fontWeight: 600 }}>
                  Multi-Department Workload Routing
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShieldCheck className="w-4 h-4 text-[#a8c38e] shrink-0" />
                <Typography variant="caption" sx={{ color: '#d2c2ad', fontWeight: 600 }}>
                  Server-side Enforced Authorization & Audit Trail
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle2 className="w-4 h-4 text-[#a8c38e] shrink-0" />
                <Typography variant="caption" sx={{ color: '#d2c2ad', fontWeight: 600 }}>
                  Before/After Evidence Verification & Sign-off
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#a39578', fontWeight: 700 }}>
              OFFICER DISPATCH v2.4
            </Typography>
            <Typography variant="caption" sx={{ color: '#a39578', fontWeight: 700, fontFamily: 'monospace' }}>
              RBAC PROTECTED
            </Typography>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Admin Login Form */}
        <Box component="form" onSubmit={handleAdminLogin} sx={{ p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontFamily: 'var(--font-display), Lora, Georgia, serif', fontWeight: 700, color: '#1f241d', mb: 0.5 }}>
              Admin Portal Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Enter administrator ID and credentials configured in system environment.
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontWeight: 600 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Admin Identifier / Email"
              type="text"
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
              label="Admin Password"
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

            <LoadingButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={submitting}
              loadingText="Authenticating Admin..."
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
                '&:hover': { backgroundColor: '#6e895d' },
              }}
            >
              Authenticate & Access Desk
            </LoadingButton>

            <Box sx={{ pt: 3, mt: 2, borderTop: '1px solid #e2dfd7', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                Citizen user?{' '}
                <Link href="/login" className="font-bold text-[#1f241d] underline hover:text-[#89a577] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Sign In via Standard Portal
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

