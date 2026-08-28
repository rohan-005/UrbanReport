import React from 'react';
import { ComplaintFilters as IComplaintFilters, Category, Severity, ComplaintStatus } from '@/lib/types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface ComplaintFiltersProps {
  filters: IComplaintFilters;
  onChange: (filters: IComplaintFilters) => void;
  onReset: () => void;
}

const categories: (Category | 'ALL')[] = [
  'ALL',
  'Pothole',
  'Garbage',
  'Streetlight',
  'Drainage',
  'Road Damage',
  'Water Supply',
  'Traffic',
  'Other',
];

const severities: (Severity | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const statuses: (ComplaintStatus | 'ALL')[] = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REOPENED',
  'REJECTED',
];

export const ComplaintFiltersBar: React.FC<ComplaintFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search title, ID, address..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => onChange({ ...filters, category: e.target.value as Category | 'ALL' })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories</option>
            {categories.filter((c) => c !== 'ALL').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onChange({ ...filters, severity: e.target.value as Severity | 'ALL' })}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Severity Levels</option>
            {severities.filter((s) => s !== 'ALL').map((sev) => (
              <option key={sev} value={sev}>
                {sev} Severity
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as 'newest' | 'oldest' | 'upvotes' | 'severity',
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="upvotes">Sort: Most Upvoted</option>
            <option value="severity">Sort: Highest Severity</option>
          </select>
        </div>
      </div>

      {/* Category Pills horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-slate-800 no-scrollbar">
        <span className="text-xs font-medium text-slate-400 shrink-0 mr-1">Category Quick Select:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ ...filters, category: cat })}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors border ${
              filters.category === cat
                ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700/80 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Issues' : cat}
          </button>
        ))}
      </div>
    </div>
  );
};
