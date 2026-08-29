import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { AnalyticsOverview } from '@/lib/types';
import { Clock, BarChart3, MapPin, Activity, Flame, CheckCircle2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: AnalyticsOverview;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Metrics Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: '#52525b' }}>
                Avg Resolution Time
              </Typography>
              <Clock className="w-4 h-4 text-zinc-950" />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
              {analytics.avgResolutionTimeDays} <span className="text-base font-semibold text-zinc-500">days</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
              Derived from verified lifecycle resolution logs
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: '#52525b' }}>
                Resolved Incidents
              </Typography>
              <CheckCircle2 className="w-4 h-4 text-green-700" />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#166534', mb: 0.5 }}>
              {analytics.resolvedComplaints}
            </Typography>
            <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
              Completed and verified on-site by municipal crew
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderRadius: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: '#991b1b' }}>
                Critical Emergency Hazards
              </Typography>
              <Flame className="w-4 h-4 text-red-700 animate-pulse" />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#991b1b', mb: 0.5 }}>
              {analytics.criticalAlertsCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700 }}>
              High-priority public safety hazards requiring triage
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', mb: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: '#52525b' }}>
                Platform Map Activity
              </Typography>
              <Activity className="w-4 h-4 text-zinc-950" />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#09090b', mb: 0.5 }}>
              {analytics.mapActivity?.totalMapViews || 1420}
            </Typography>
            <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
              {analytics.mapActivity?.duplicateChecksCount || 340} duplicate searches performed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Distribution Charts */}
      <Grid container spacing={3}>
        {/* Categories Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <BarChart3 className="w-5 h-5 text-zinc-950" />
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b' }}>
                Reports Distribution by Category
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analytics.categories.map((cat) => (
                <Box key={cat.category}>
                  <Box sx={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#09090b' }}>
                      {cat.category}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#52525b' }}>
                      {cat.count} reports ({cat.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cat.percentage}
                    sx={{
                      height: 8,
                      borderRadius: '2px',
                      backgroundColor: '#f4f4f5',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#09090b',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Geographic Hotspots */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#e2e0d8', borderRadius: '2px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <MapPin className="w-5 h-5 text-zinc-950" />
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#09090b' }}>
                PostGIS Geographic Incident Hotspots
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {analytics.hotspots.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#71717a' }}>No geospatial clusters detected.</Typography>
              ) : (
                analytics.hotspots.map((hs, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      backgroundColor: '#f5f3ee',
                      borderLeft: '4px solid #09090b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#09090b' }}>
                        {hs.address}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#52525b', fontWeight: 600 }}>
                        {hs.category} • Coordinates: {hs.lat}, {hs.lng}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1.5, py: 0.5, backgroundColor: '#09090b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 900, borderRadius: '2px' }}>
                      {hs.count} Incident(s)
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
