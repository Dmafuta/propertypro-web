import type { Metadata } from 'next';
import { Typography } from '@mui/material';

export const metadata: Metadata = { title: 'Dashboard | FacilityApp' };

export default function StaffDashboardPage() {
  return (
    <Typography variant="h4" sx={{ p: 3 }}>
      Staff Dashboard — coming soon
    </Typography>
  );
}
