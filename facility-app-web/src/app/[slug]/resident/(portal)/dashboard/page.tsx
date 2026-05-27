import type { Metadata } from 'next';
import { Typography } from '@mui/material';

export const metadata: Metadata = { title: 'Resident Dashboard | FacilityApp' };

export default function ResidentDashboardPage() {
  return (
    <Typography variant="h4" sx={{ p: 3 }}>
      Resident Dashboard — coming soon
    </Typography>
  );
}
