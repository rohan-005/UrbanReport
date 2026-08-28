'use client';

import React, { useState } from 'react';
import { Assignment } from '@/lib/types';
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
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        backgroundColor: '#121215',
        borderColor: '#27272a',
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, borderBottom: '1px solid #27272a' }}>
        <Building2 className="w-5 h-5 text-zinc-100" />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9375rem' }}>
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
        {departments.map((dept) => (
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
          backgroundColor: '#f8fafc',
          color: '#09090b',
          fontWeight: 800,
          '&:hover': {
            backgroundColor: '#e2e8f0',
          },
        }}
      >
        {currentAssignment ? 'Update Assignment' : 'Dispatch Assignment'}
      </Button>
    </Paper>
  );
};
