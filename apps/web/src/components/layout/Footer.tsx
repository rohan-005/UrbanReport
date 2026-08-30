import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e2dfd7] bg-[#ebe7df] text-[#1f241d] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#89a577] rounded-xs inline-block" />
              <span className="text-base font-bold tracking-wider uppercase text-[#1f241d] font-display">
                UrbanReports
              </span>
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed font-sans max-w-sm">
              Geospatial civic intelligence and transparent infrastructure issue tracking for modern municipalities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#877b5f] mb-3">
              Platform Index
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#1f241d]">
              <li>
                <Link href="/" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Overview & Map Hero
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Geospatial Issue Map
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Civic Complaint Feed
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Report New Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#877b5f] mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#1f241d]">
              <li>
                <Link href="/profile" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Citizen Identity Card
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Municipal Operations Desk
                </Link>
              </li>
              <li>
                <Link href="/admin/complaints" className="hover:text-[#89a577] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] rounded-xs">
                  Admin Resolution Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance Notice */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#877b5f] mb-3">
              Architecture & Security
            </h4>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Built on Next.js 15, MUI, GSAP, and MapLibre GL JS with citizen identification and geospatial reporting.
            </p>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-[#d8d5cb] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] sm:text-xs text-[#6b7280] gap-2 sm:gap-4 font-mono font-medium">
          <p>© 2026 URBANREPORTS CIVIC PLATFORM. ALL RIGHTS RESERVED.</p>
          <span>COMMUNITY-FOCUSED EDITORIAL CIVIC FOUNDATION</span>
        </div>
      </div>
    </footer>
  );
};

