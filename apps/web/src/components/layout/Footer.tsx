import React from 'react';
import Link from 'next/link';
import { MapPin, Shield, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">UrbanReports</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering communities with real-time, map-first civic issue reporting and transparent municipal task management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">Home & Overview</Link></li>
              <li><Link href="/map" className="hover:text-sky-400 transition-colors">Interactive Complaint Map</Link></li>
              <li><Link href="/complaints" className="hover:text-sky-400 transition-colors">Explore Civic Issues</Link></li>
              <li><Link href="/report" className="hover:text-sky-400 transition-colors">Report an Issue</Link></li>
            </ul>
          </div>

          {/* Citizen & Admin */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Portal Quick Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/profile" className="hover:text-sky-400 transition-colors">Citizen Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-purple-400 transition-colors">Municipal Admin Overview</Link></li>
              <li><Link href="/admin/complaints" className="hover:text-purple-400 transition-colors">Admin Resolution Queue</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Sign In / Account</Link></li>
            </ul>
          </div>

          {/* Civic Governance Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Phase 1 Foundation</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Phase 1 is configured with client-side reactive repository mocking for immediate hackathon demonstration.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Aadhaar Local Format Validation Enabled</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 UrbanReports Civic Technology. Open-Source Hackathon Foundation.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Smart Cities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
