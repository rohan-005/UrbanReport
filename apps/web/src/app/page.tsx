'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, Category } from '@/lib/types';
import { MapView } from '@/components/map/MapView';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { 
  MapPin, 
  PlusCircle, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Activity,
  HelpCircle,
  FileCheck,
  TrendingUp
} from 'lucide-react';

const categoryItems: { name: Category; count: string; icon: React.ElementType }[] = [
  { name: 'Pothole', count: '450+ Resolved', icon: Construction },
  { name: 'Garbage', count: '320+ Cleaned', icon: Trash2 },
  { name: 'Streetlight', count: '280+ Fixed', icon: Lightbulb },
  { name: 'Drainage', count: '190+ Unblocked', icon: Waves },
  { name: 'Road Damage', count: '210+ Patched', icon: Construction },
  { name: 'Water Supply', count: '160+ Repaired', icon: Droplet },
  { name: 'Traffic', count: '140+ Synced', icon: Activity },
  { name: 'Other', count: '90+ Addressed', icon: HelpCircle },
];

export default function LandingHomePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await complaintRepository.getAllComplaints();
      const statsData = await complaintRepository.getStats();
      setComplaints(data);
      setStats(statsData);
      setLoading(false);
    };
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Next-Gen Smart City Civic Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Map-First Civic Reporting for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                  Cleaner & Safer Cities
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Spot a pothole, overflowing garbage, broken streetlight, or burst pipe? Pin the location, upload evidence, and track municipal repair progress transparently in real time.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/report">
                  <Button size="lg" variant="primary" leftIcon={<PlusCircle className="w-5 h-5" />}>
                    Report an Issue
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" variant="outline" leftIcon={<Compass className="w-5 h-5" />}>
                    Explore Live Map
                  </Button>
                </Link>
              </div>

              {/* Stats highlights */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">
                      {stats.total}+
                    </span>
                    <p className="text-xs text-slate-400 font-medium">Civic Reports Filed</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {stats.resolved}
                    </span>
                    <p className="text-xs text-slate-400 font-medium">Resolved Issues</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                      {stats.inProgress}
                    </span>
                    <p className="text-xs text-slate-400 font-medium">Active In Repair</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hero Right Map Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-sky-950/40 relative">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 mb-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    City-Wide Interactive Geospatial Map
                  </span>
                  <Link href="/map" className="text-sky-400 font-semibold hover:underline">
                    Expand Fullscreen →
                  </Link>
                </div>

                <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-800">
                  {loading ? (
                    <LoadingState message="Loading map preview..." height="h-full" />
                  ) : (
                    <MapView complaints={complaints} zoom={11} interactive={true} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-16 border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Civic Infrastructure Categories
            </h2>
            <p className="text-sm text-slate-400">
              Categorized civic issue tracking dispatched directly to specialized municipal departments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryItems.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/complaints?category=${cat.name}`}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/60 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-slate-800 text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors w-fit mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{cat.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-16 border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Transparent Civic Resolution Flow
            </h2>
            <p className="text-sm text-slate-400">
              From report filing to municipal verification, departmental assignment, and site closure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30">
                1
              </div>
              <h3 className="text-base font-bold text-slate-100">1. Citizen Pinpoint Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizen tags precise GPS coordinates on map, attaches photo evidence, and selects severity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30">
                2
              </div>
              <h3 className="text-base font-bold text-slate-100">2. Admin Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Municipal control desk triages report severity, verifies coordinates, and checks duplication.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-slate-100">3. Department Dispatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work order assigned to lead engineer (e.g. Roads, Water, Electricity) with target resolution date.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                4
              </div>
              <h3 className="text-base font-bold text-slate-100">4. Verified Resolution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                On-site repair completed, photo verified, timeline updated, and citizen receives confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="py-16 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Recent Civic Activity Feed</h2>
              <p className="text-xs text-slate-400 mt-1">Live reports submitted by citizens across municipal sectors.</p>
            </div>
            <Link href="/complaints">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Civic Complaints
              </Button>
            </Link>
          </div>

          {!loading && complaints.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {complaints.slice(0, 3).map((item) => (
                <ComplaintCard key={item.id} complaint={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
