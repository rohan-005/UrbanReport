import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { Button } from '../ui/Button';
import { ArrowRight, MapPin, Building2 } from 'lucide-react';

interface AdminComplaintTableProps {
  complaints: Complaint[];
}

export const AdminComplaintTable: React.FC<AdminComplaintTableProps> = ({ complaints }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="py-3.5 px-4">Complaint ID</th>
            <th scope="col" className="py-3.5 px-4">Title & Address</th>
            <th scope="col" className="py-3.5 px-4">Category</th>
            <th scope="col" className="py-3.5 px-4">Severity</th>
            <th scope="col" className="py-3.5 px-4">Status</th>
            <th scope="col" className="py-3.5 px-4">Assignment</th>
            <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {complaints.map((item) => (
            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
              {/* ID */}
              <td className="py-3.5 px-4 font-mono text-xs text-sky-400 font-bold whitespace-nowrap">
                {item.id}
              </td>

              {/* Title & Address */}
              <td className="py-3.5 px-4 max-w-xs">
                <div className="font-semibold text-slate-100 line-clamp-1">{item.title}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{item.address}</span>
                </div>
              </td>

              {/* Category */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <CategoryBadge category={item.category} size="sm" />
              </td>

              {/* Severity */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <SeverityBadge severity={item.severity} size="sm" />
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <StatusBadge status={item.status} size="sm" />
              </td>

              {/* Assignment */}
              <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                {item.assignment ? (
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.assignment.department}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Unassigned</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <Link href={`/admin/complaints/${item.id}`}>
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Manage Desk
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
