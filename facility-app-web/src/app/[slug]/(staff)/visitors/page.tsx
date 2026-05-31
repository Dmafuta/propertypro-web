'use client';

import { useParams, useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import { useGetDashboard } from 'services/swr/api-hooks/useDashboardApi';

const KPI_ITEMS = [
  {
    key: 'todayVisits',
    label: 'Visits Today',
    icon: 'material-symbols:groups-outline-rounded',
    color: 'primary',
  },
  {
    key: 'activeVisits',
    label: 'Currently Inside',
    icon: 'material-symbols:door-open-outline-rounded',
    color: 'success',
  },
  {
    key: 'pendingParcels',
    label: 'Pending Parcels',
    icon: 'material-symbols:package-2-outline-rounded',
    color: 'warning',
  },
  {
    key: 'openMaintenance',
    label: 'Open Maintenance',
    icon: 'material-symbols:build-outline-rounded',
    color: 'error',
  },
  {
    key: 'totalUnits',
    label: 'Total Units',
    icon: 'material-symbols:apartment-outline-rounded',
    color: 'neutral',
  },
  {
    key: 'occupiedUnits',
    label: 'Occupied Units',
    icon: 'material-symbols:home-outline-rounded',
    color: 'info',
  },
  {
    key: 'openIncidents',
    label: 'Open Incidents',
    icon: 'material-symbols:warning-outline-rounded',
    color: 'error',
  },
  {
    key: 'pendingUnitRequests',
    label: 'Unit Requests',
    icon: 'material-symbols:pending-actions-outline-rounded',
    color: 'warning',
  },
] as const;

export default function VisitorsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: stats, isLoading } = useGetDashboard();

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* Page header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 5, gap: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Visitors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live overview and visitor management
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
            onClick={() => router.push(`/${slug}/visitors/pre-register`)}
          >
            Pre-register
          </Button>
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:how-to-reg-outline-rounded" />}
            onClick={() => router.push(`/${slug}/access/check-in`)}
          >
            Check In
          </Button>
        </Stack>
      </Stack>

      {/* KPI stat cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPI_ITEMS.map(({ key, label, icon, color }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
            <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
                {label}
              </Typography>
              <Avatar
                variant="rounded"
                sx={{ width: 48, height: 48, bgcolor: `${color}.lighter`, borderRadius: 2, mb: 1 }}
              >
                <IconifyIcon icon={icon} sx={{ fontSize: 28, color: `${color}.main` }} />
              </Avatar>
              {isLoading ? (
                <Skeleton variant="text" width={64} height={44} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                  {(stats as any)?.[key] ?? 0}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Visitor list — Phase 2 */}
      <Paper sx={{ p: { xs: 3, md: 5 }, minHeight: 320 }}>
        <Stack sx={{ height: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 56, height: 56, bgcolor: 'primary.lighter', borderRadius: 2 }}
          >
            <IconifyIcon icon="material-symbols:group-outline-rounded" sx={{ fontSize: 32, color: 'primary.main' }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Visitor List
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 320 }}>
            Full visitor management — walk-ins, pre-registered visits, check-in/out history — coming in the next phase.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
