'use client';

import { Button, Paper, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';

const ProPlanCTA = () => {
  return (
    <Paper
      sx={{
        display: 'flex',
        gap: 2,
        p: { xs: 3, md: 5 },
        bgcolor: 'success.lighter',
        justifyContent: 'space-between',
        alignItems: { sm: 'center' },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      <Stack
        direction={{ sm: 'row' }}
        sx={{
          rowGap: 1,
          columnGap: 2,
          alignItems: { sm: 'center' },
          flexWrap: { sm: 'wrap' },
        }}
      >
        <Typography variant="h3" sx={{ typography: { xs: 'h4', sm: 'h3' }, flexShrink: { sm: 0 } }}>
          Try our pro plan
        </Typography>

        <Typography
          sx={{
            typography: { xs: 'subtitle2', sm: 'subtitle1' },
            fontWeight: { xs: 400, sm: 400 },
          }}
        >
          First month free, $12.50/month after.
        </Typography>
      </Stack>
      <Button
        href={paths.pricingColumn}
        variant="contained"
        color="neutral"
        size="large"
        sx={{ flexShrink: 0, alignSelf: 'center' }}
      >
        See Plans
      </Button>
    </Paper>
  );
};

export default ProPlanCTA;
