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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navContainerRef.current,
        { y: 35, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out',
          delay: 0.1,
          onComplete: () => {
            if (navContainerRef.current) {
              gsap.set(navContainerRef.current, { clearProps: 'transform,opacity' });
            }
          },
        }
      );
    }, navContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-auto max-w-[calc(100vw-0.75rem)] sm:max-w-max pointer-events-auto pb-[env(safe-area-inset-bottom)] transition-all duration-200">
      <nav
        ref={navContainerRef}
        className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 p-1 xs:p-1.5 sm:p-2 rounded-md bg-[#1f241d]/95 border border-[#877b5f]/40 shadow-xl backdrop-blur-xl ring-1 ring-white/10"
        aria-label="Floating Bottom Navigation Control Dock"
      >
        {/* Brand Mark Emblem (Desktop / Tablet) */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-2 px-3 py-2 mr-1 border-r border-[#877b5f]/40 text-xs font-bold tracking-widest text-white uppercase hover:text-[#a8c38e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-md"
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-[#89a577] shadow-xs" />
          <span className="font-display">URBAN</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 min-h-[36px] sm:min-h-[40px] px-2.5 xs:px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] ${
                    active
                      ? 'bg-[#89a577] text-white border border-[#89a577] shadow-md'
                      : 'bg-[#89a577] text-white hover:bg-[#6e895d] border border-[#89a577] shadow-xs active:scale-[0.98]'
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
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-[40px] px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] ${
                  active
                    ? 'bg-[#877b5f]/30 text-white border border-[#877b5f]/50 shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10 border border-transparent active:scale-[0.97]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? 'text-[#a8c38e]' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#89a577] rounded-full shadow-xs" />
                )}
              </Link>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1 sm:gap-1.5 min-h-[36px] sm:min-h-[40px] px-1.5 xs:px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-zinc-400 hover:text-rose-300 hover:bg-white/10 rounded-md transition-colors ml-0.5 border-l border-[#877b5f]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
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

