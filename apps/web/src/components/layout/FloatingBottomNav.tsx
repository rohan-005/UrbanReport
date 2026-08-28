'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Compass, 
  Map as MapIcon, 
  Plus, 
  ListFilter, 
  User, 
  ShieldCheck,
  LogOut
} from 'lucide-react';
import gsap from 'gsap';

export const FloatingBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, role, logout } = useAuth();
  const navContainerRef = useRef<HTMLDivElement>(null);

  const showAdmin = isAuthenticated && (role === 'ADMIN' || role === 'OFFICER' || role === 'AUTHORITY');

  const navItems = [
    { href: '/', label: 'Home', icon: Compass },
    { href: '/map', label: 'Map', icon: MapIcon },
    { href: '/report', label: 'Report', icon: Plus, highlight: true },
    { href: '/complaints', label: 'Feed', icon: ListFilter },
    { href: '/profile', label: 'Profile', icon: User },
    ...(showAdmin ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !navContainerRef.current) return;

    gsap.fromTo(
      navContainerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.15 }
    );
  }, []);

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[96vw] sm:max-w-max pointer-events-auto">
      <nav
        ref={navContainerRef}
        className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-sm bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md"
        aria-label="Floating Bottom Navigation Control Dock"
      >
        {/* Brand Mark Minimal Emblem */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-2 px-3 py-2 mr-1 border-r border-zinc-800 text-xs font-black tracking-widest text-zinc-100 uppercase hover:text-white transition-colors"
        >
          <span className="w-2 h-2 rounded-none bg-zinc-100" />
          <span>URBAN</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-sm transition-all duration-200 ${
                    active
                      ? 'bg-zinc-100 text-zinc-950 border border-white shadow-md scale-[1.02]'
                      : 'bg-zinc-100 text-zinc-950 hover:bg-white border border-zinc-200 shadow-sm'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-200 ${
                  active
                    ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? 'text-zinc-100' : 'text-zinc-400'}`} />
                <span className="inline">{item.label}</span>
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-100 rounded-none" />
                )}
              </Link>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs font-bold text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-sm transition-colors ml-0.5 border-l border-zinc-800"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
