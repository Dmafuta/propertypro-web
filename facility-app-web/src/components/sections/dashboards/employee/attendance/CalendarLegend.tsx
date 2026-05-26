'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const legends = [
  {
    label: 'On Time',
    color: 'chGreen.100',
  },
  {
    label: 'Delay',
    color: 'chOrange.100',
  },
  {
    label: 'Absent',
    color: 'chRed.100',
  },
  {
    label: 'Leave',
    color: 'chBlue.100',
  },
];

const CalendarLegend = () => {
  return (
    <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
      {legends.map((legend, index) => (
        <Stack key={index} direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 9999, bgcolor: legend.color }} />
          <Typography
            component="span"
            variant="caption"
            sx={{ color: 'text.secondary', lineHeight: 1.5 }}
          >
            {legend.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default CalendarLegend;
