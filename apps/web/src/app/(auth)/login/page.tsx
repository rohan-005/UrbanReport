'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/auth.repository';
import { Button } from '@/components/ui/Button';
import { MapPin, Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

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
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/20 mb-2">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Welcome Back</h1>
          <p className="text-sm text-slate-400">
            Sign in to UrbanReports citizen portal to track & resolve issues
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Email Address
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
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <a href="#" className="text-xs text-sky-400 hover:underline">
                  Forgot password?
                </a>
              </div>
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
            </div>

            {/* Remember me check */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="accent-sky-500 rounded"
              />
              <label htmlFor="remember" className="text-xs text-slate-300">
                Remember this device session
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 block">Mock Demo Quick Accounts:</span>
            <div className="flex justify-between">
              <span>Citizen:</span>
              <button
                onClick={() => setEmail('aarav.sharma@example.com')}
                className="text-sky-400 font-mono underline"
              >
                aarav.sharma@example.com
              </button>
            </div>
            <div className="flex justify-between">
              <span>Admin:</span>
              <button
                onClick={() => setEmail('admin.vikram@urbanreports.gov.in')}
                className="text-purple-400 font-mono underline"
              >
                admin.vikram@urbanreports.gov.in
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-sky-400 hover:underline">
              Register Citizen Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
