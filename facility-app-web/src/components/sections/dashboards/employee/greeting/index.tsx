'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';

const EmployeeGreetings = () => {
  const today = dayjs();
  return (
    <SectionWrapper sx={{ py: { xs: 3 } }}>
      <Stack
        direction={{ sm: 'row' }}
        sx={{
          gap: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <div>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Good Evening, John Carter!
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Have a Productive Day!
          </Typography>
        </div>
        <div>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 1, textAlign: { xs: 'left', sm: 'right' } }}
          >
            {today.format('dddd  h:mm a')}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              textAlign: { xs: 'left', sm: 'right' },
            }}
          >
            {today.format('DD MMMM, YYYY')}
          </Typography>
        </div>
      </Stack>
    </SectionWrapper>
  );
};

export default EmployeeGreetings;
