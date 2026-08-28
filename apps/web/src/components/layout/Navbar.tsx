'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MapPin, 
  Map, 
  ListFilter, 
  PlusCircle, 
  User, 
  ShieldCheck, 
  Menu, 
  X,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Compass },
    { href: '/map', label: 'Complaint Map', icon: Map },
    { href: '/complaints', label: 'Explore Issues', icon: ListFilter },
    { href: '/report', label: 'Report Issue', icon: PlusCircle, highlight: true },
  ];

  const secondaryLinks = [
    { href: '/profile', label: 'Citizen Profile', icon: User },
    { href: '/admin', label: 'Admin Desk', icon: ShieldCheck },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              Urban<span className="text-sky-400">Reports</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider -mt-1 uppercase">Civic Intelligence</span>
          </div>
        </Link>

        {/* Desktop Primary Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  link.highlight
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/30'
                    : active
                    ? 'bg-slate-700 text-sky-400 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Secondary Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${
              isActive('/profile')
                ? 'border-sky-500/60 bg-sky-950/40 text-sky-300'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>Citizen Profile</span>
          </Link>
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${
              isActive('/admin')
                ? 'border-purple-500/60 bg-purple-950/40 text-purple-300'
                : 'border-slate-700/80 bg-slate-800/40 text-slate-400 hover:text-purple-300 hover:border-purple-500/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    link.highlight
                      ? 'bg-sky-600 text-white'
                      : active
                      ? 'bg-slate-800 text-sky-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-slate-800 text-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
