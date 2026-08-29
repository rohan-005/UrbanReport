import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { 
  FileText, 
  Clock, 
  UserCheck, 
  Wrench, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    submitted: number;
    underReview: number;
    verified: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    reopened: number;
    rejected: number;
    critical: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      label: 'All registered reports',
      icon: FileText,
    },
    {
      title: 'Critical Emergency',
      value: stats.critical,
      label: 'Immediate hazard alerts',
      icon: AlertTriangle,
      highlight: true,
    },
    {
      title: 'Pending Review',
      value: stats.submitted + stats.underReview,
      label: 'Awaiting triage',
      icon: Clock,
    },
    {
      title: 'Verified & Assigned',
      value: stats.verified + stats.assigned,
      label: 'Dispatched to departments',
      icon: UserCheck,
    },
    {
      title: 'Active In Progress',
      value: stats.inProgress,
      label: 'On-site crew repair work',
      icon: Wrench,
    },
    {
      title: 'Resolved Successfully',
      value: stats.resolved,
      label: 'Work completed',
      icon: CheckCircle,
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid item xs={6} sm={4} md={2} key={card.title}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: card.highlight ? '#fef2f2' : '#ffffff',
                borderColor: card.highlight ? '#fecaca' : '#e2dfd7',
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: card.highlight ? '#991b1b' : '#877b5f',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    lineHeight: 1.2,
                  }}
                >
                  {card.title}
                </Typography>
                <Icon className={`w-4 h-4 ${card.highlight ? 'text-rose-700' : 'text-[#877b5f]'}`} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'var(--font-display), Lora, Georgia, serif',
                  fontWeight: 700,
                  color: card.highlight ? '#991b1b' : '#1f241d',
                }}
              >
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ color: card.highlight ? '#b91c1c' : '#6b7280', fontSize: '0.6875rem', fontWeight: 600 }}>
                {card.label}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

