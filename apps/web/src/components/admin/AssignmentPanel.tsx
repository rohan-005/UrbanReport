'use client';

import React, { useState, useEffect } from 'react';
import { Assignment } from '@/lib/types';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { Building2, UserCheck } from 'lucide-react';

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
  const [deptList, setDeptList] = useState<string[]>(departments);

  useEffect(() => {
    complaintRepository.getDepartments().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        const names = res.map((d: any) => d.name || d.id);
        setDeptList(names);
      }
    });
  }, []);

  const [department, setDepartment] = useState(
    currentAssignment?.department || deptList[0] || departments[0]
  );

  const availableOfficers = mockOfficers[department] || ['Field Officer Unassigned', 'Inspector Rajesh K.'];

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
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        backgroundColor: '#ffffff',
        borderColor: '#e2e0d8',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, borderBottom: '1px solid #e2e0d8' }}>
        <Building2 className="w-5 h-5 text-zinc-950" />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#09090b', fontSize: '0.9375rem' }}>
          Department Assignment Desk
        </Typography>
      </Box>

      <TextField
        select
        label="Handling Department"
        size="small"
        fullWidth
        value={department}
        onChange={(e) => {
          const newDept = e.target.value;
          setDepartment(newDept);
          setAssignedOfficer(mockOfficers[newDept]?.[0] || 'Unassigned Officer');
        }}
      >
        {deptList.map((dept) => (
          <MenuItem key={dept} value={dept}>
            {dept}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Lead Field Officer"
        size="small"
        fullWidth
        value={assignedOfficer}
        onChange={(e) => setAssignedOfficer(e.target.value)}
      >
        {availableOfficers.map((off) => (
          <MenuItem key={off} value={off}>
            {off}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Dispatch Notes / Instructions"
        multiline
        rows={3}
        size="small"
        fullWidth
        placeholder="Equipment requirements, priority schedule..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isLoading}
        startIcon={<UserCheck className="w-4 h-4" />}
        sx={{
          mt: 1,
          backgroundColor: '#09090b',
          color: '#ffffff',
          fontWeight: 800,
          '&:hover': {
            backgroundColor: '#18181b',
          },
        }}
      >
        {currentAssignment ? 'Update Assignment' : 'Dispatch Assignment'}
      </Button>
    </Paper>
  );
};
