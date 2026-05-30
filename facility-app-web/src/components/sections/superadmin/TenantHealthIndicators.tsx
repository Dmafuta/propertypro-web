'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTenantHealth } from 'services/swr/api-hooks/useSuperAdminApi';

const INDICATORS = [
  {
    key: 'totalStaff',
    label: 'Staff Members',
    icon: 'material-symbols:badge-outline-rounded',
    color: 'primary.main',
  },
  {
    key: 'totalResidents',
    label: 'Residents',
    icon: 'material-symbols:home-outline-rounded',
    color: 'info.main',
  },
  {
    key: 'visitorVolume30d',
    label: 'Visitors (30d)',
    icon: 'material-symbols:groups-outline-rounded',
    color: 'success.main',
  },
  {
    key: 'maintenanceBacklog',
    label: 'Maintenance Backlog',
    icon: 'material-symbols:build-outline-rounded',
    color: 'warning.main',
  },
  {
    key: 'occupancyRate',
    label: 'Unit Occupancy',
    icon: 'material-symbols:apartment-outline-rounded',
    color: 'secondary.main',
    format: (health: any) =>
      health.totalUnits > 0
        ? `${Math.round((health.occupiedUnits / health.totalUnits) * 100)}%`
        : '—',
  },
  {
    key: 'openIncidents',
    label: 'Open Incidents',
    icon: 'material-symbols:warning-outline-rounded',
    color: 'error.main',
  },
] as const;

interface Props {
  tenantId: string;
}

const TenantHealthIndicators = ({ tenantId }: Props) => {
  const { data: health, isLoading } = useTenantHealth(tenantId);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', mb: 2.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconifyIcon
              icon="material-symbols:monitor-heart-outline-rounded"
              sx={{ fontSize: 22, color: 'primary.main' }}
            />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Health Indicators
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {INDICATORS.map(({ key, label, icon, color, ...rest }) => {
            const formatFn = (rest as any).format;
            const value = isLoading
              ? null
              : formatFn
              ? formatFn(health)
              : (health as any)?.[key] ?? 0;

            return (
              <Grid key={key} size={{ xs: 6, sm: 4, md: 2 }}>
                <Stack sx={{ gap: 0.5 }}>
                  <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
                    <IconifyIcon icon={icon} sx={{ fontSize: 16, color }} />
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Stack>
                  {isLoading ? (
                    <Skeleton variant="text" width={48} height={32} />
                  ) : (
                    <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                      {value}
                    </Typography>
                  )}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TenantHealthIndicators;
