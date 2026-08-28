import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400 mt-auto pb-28">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-zinc-100 rounded-none inline-block" />
              <span className="text-base font-extrabold tracking-widest uppercase text-white">
                UrbanReports
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Geospatial civic intelligence and transparent infrastructure issue tracking for modern municipalities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Platform Index
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-zinc-100 transition-colors">
                  Overview & Map Hero
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-zinc-100 transition-colors">
                  Geospatial Issue Map
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-zinc-100 transition-colors">
                  Civic Complaint Feed
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-zinc-100 transition-colors">
                  Report New Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/profile" className="hover:text-zinc-100 transition-colors">
                  Citizen Identity Card
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-zinc-100 transition-colors">
                  Municipal Operations Desk
                </Link>
              </li>
              <li>
                <Link href="/admin/complaints" className="hover:text-zinc-100 transition-colors">
                  Admin Resolution Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance Notice */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Architecture & Security
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Built on Next.js 15, MUI, GSAP, and MapLibre GL JS with local 12-digit Aadhaar validation.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4 font-mono">
          <p>© 2026 URBANREPORTS CIVIC PLATFORM. ALL RIGHTS RESERVED.</p>
          <span>EDITORIAL MONOCHROME CIVIC FOUNDATION</span>
        </div>
      </div>
    </footer>
  );
};
