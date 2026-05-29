'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const SuperAdminGreeting = () => {
  const { data: session } = useSession();
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <Paper background={1} sx={{ px: { xs: 3, md: 5 }, py: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {greeting}, {firstName}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        See what&apos;s happening across all your facilities
      </Typography>
    </Paper>
  );
};

export default SuperAdminGreeting;
