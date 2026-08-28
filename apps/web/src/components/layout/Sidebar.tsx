'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListFilter, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SidebarProps {
  type?: 'admin' | 'citizen';
}

export const Sidebar: React.FC<SidebarProps> = ({ type = 'admin' }) => {
  const pathname = usePathname();

  const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/complaints', label: 'Complaint Queue', icon: ListFilter },
  ];

  const citizenNav = [
    { href: '/profile', label: 'Overview', icon: LayoutDashboard },
    { href: '/complaints', label: 'Browse Issues', icon: ListFilter },
    { href: '/report', label: 'Report New Issue', icon: ShieldAlert },
  ];

  const navItems = type === 'admin' ? adminNav : citizenNav;

  return (
    <aside className="w-full md:w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-4 space-y-6">
      <div className="px-3 py-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {type === 'admin' ? 'Admin Management' : 'Citizen Portal'}
        </h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-600/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
