'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/auth.repository';
import { validateAadhaarNumber, formatAadhaarInput, validateEmail, validatePhone } from '@/lib/utils/validation';
import { Button } from '@/components/ui/Button';
import { MapPin, User, Mail, Phone, Lock, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarInput(e.target.value);
    setAadhaarNumber(formatted);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';

    if (!email.trim() || !validateEmail(email)) {
      newErrors.email = 'Valid email address is required.';
    }

    if (!phone.trim() || !validatePhone(phone)) {
      newErrors.phone = 'Valid 10-digit mobile number is required.';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

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

    setLoading(true);

    try {
      await authRepository.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        aadhaarNumber,
      });

      router.push('/profile');
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/20 mb-2">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Citizen Registration</h1>
          <p className="text-sm text-slate-400">
            Create an account to report civic issues and receive municipal resolution updates
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name}</p>}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-400 font-medium">{errors.phone}</p>}
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-400 font-medium">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-400 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Aadhaar Number Field */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Aadhaar Number (12 Digits) *</span>
                <span className="text-[10px] text-sky-400 font-mono">Format Check Only</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="5555 6666 7777"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              {errors.aadhaarNumber && (
                <p className="text-xs text-rose-400 font-medium">{errors.aadhaarNumber}</p>
              )}

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Phase 1 Security Notice:</strong> Aadhaar format is checked locally (12 numeric digits, non-repeating). No UIDAI integration occurs and no raw Aadhaar numbers are transmitted or stored.
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-4"
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-sky-400 hover:underline">
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
