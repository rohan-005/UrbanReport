'use client';

import React, { useState } from 'react';
import { Assignment } from '@/lib/types';
import { Button } from '../ui/Button';
import { Building2, UserCheck, Calendar, FileText } from 'lucide-react';

interface AssignmentPanelProps {
  currentAssignment?: Assignment;
  onAssign: (assignment: Assignment) => void;
  isLoading?: boolean;
}

const departments = [
  'Roads & Infrastructure Engineering',
  'Solid Waste Management Division',
  'Stormwater Drain (SWD) Department',
  'Water Supply & Sewerage Board',
  'Electrical Utility & Lighting Board',
  'Traffic Control Systems Division',
  'Horticulture & Parks Department',
  'Environmental Protection Unit',
];

const mockOfficers: Record<string, string[]> = {
  'Roads & Infrastructure Engineering': ['Eng. Rajesh Kumar', 'Officer Amit Shah', 'Eng. Priya Sharma'],
  'Solid Waste Management Division': ['Officer Sunita Rao', 'Inspector Ramesh V.', 'Officer Deepa Nair'],
  'Stormwater Drain (SWD) Department': ['Supervisor Mahesh Gowda', 'Eng. Suresh Nair'],
  'Water Supply & Sewerage Board': ['Eng. Suresh Nair', 'Technician K. Venkatesh'],
  'Electrical Utility & Lighting Board': ['Eng. K. Swamy', 'Electrician Balaji R.'],
  'Traffic Control Systems Division': ['Tech Lead Ramesh V.', 'Officer S. Patil'],
  'Horticulture & Parks Department': ['Officer Green Cell', 'Supervisor Prakash'],
  'Environmental Protection Unit': ['Officer Sunita Rao', 'Inspector K. Das'],
};

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  currentAssignment,
  onAssign,
  isLoading = false,
}) => {
  const [department, setDepartment] = useState(
    currentAssignment?.department || departments[0]
  );

  const availableOfficers = mockOfficers[department] || ['Field Officer Unassigned'];

  const [assignedOfficer, setAssignedOfficer] = useState(
    currentAssignment?.assignedOfficer || availableOfficers[0]
  );

  const [notes, setNotes] = useState(currentAssignment?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      department,
      assignedOfficer,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Building2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-base font-bold text-slate-100">Municipal Department Assignment</h3>
      </div>

      <div className="space-y-4">
        {/* Department Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Handling Department *
          </label>
          <select
            value={department}
            onChange={(e) => {
              const newDept = e.target.value;
              setDepartment(newDept);
              setAssignedOfficer(mockOfficers[newDept]?.[0] || 'Unassigned Officer');
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Officer */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Lead Field Officer *
          </label>
          <select
            value={assignedOfficer}
            onChange={(e) => setAssignedOfficer(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            {availableOfficers.map((off) => (
              <option key={off} value={off}>
                {off}
              </option>
            ))}
          </select>
        </div>

        {/* Dispatch Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Dispatch Instructions / Priority Notes
          </label>
          <textarea
            rows={3}
            placeholder="Work instructions, equipment requirements, night-shift scheduling..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<UserCheck className="w-4 h-4" />}
          className="w-full bg-purple-600 hover:bg-purple-500 border-purple-500/50"
        >
          {currentAssignment ? 'Update Assignment' : 'Dispatch Department Assignment'}
        </Button>
      </div>
    </form>
  );
};
