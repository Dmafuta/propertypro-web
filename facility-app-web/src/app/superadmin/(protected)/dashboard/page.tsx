import type { Metadata } from 'next';
import { Typography } from '@mui/material';

export const metadata: Metadata = { title: 'SuperAdmin Dashboard | FacilityApp' };

export default function SuperAdminDashboardPage() {
  return (
    <Typography variant="h4" sx={{ p: 3 }}>
      SuperAdmin Dashboard — coming soon
    </Typography>
  );
}
