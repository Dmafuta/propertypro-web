'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(localeData);
dayjs.extend(weekOfYear);

const TimeAtWorkKPI = () => {
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const endOfWeek = today.endOf('week');

  return (
    <Stack direction="row" sx={{ gap: 3, alignItems: 'center', mb: 5 }}>
      <div style={{ flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
          {`${startOfWeek.format('DDMMM')}-${endOfWeek.format('DDMMM')},`}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          {today.format('YYYY')}
        </Typography>
      </div>
      <Paper
        background={1}
        sx={{ p: 1, width: 1, borderRadius: 2, outline: 0, textAlign: 'center' }}
      >
        <Typography
          variant="caption"
          component="p"
          sx={{ fontWeight: 500, color: 'text.secondary', lineHeight: 1.5 }}
        >
          Total Hours
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
          64:56:23
        </Typography>
      </Paper>
    </Stack>
  );
};

export default TimeAtWorkKPI;
