'use client';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import useNumberFormat from 'hooks/useNumberFormat';
import { Stat } from 'types/hiring';
import IconifyIcon from 'components/base/IconifyIcon';

const StatCard = ({ title, subTitle, value, icon }: Stat) => {
  const { numberFormat } = useNumberFormat();

  return (
    <Box sx={{ p: 2, bgcolor: 'background.elevation1', borderRadius: 4 }}>
      <Stack sx={{ gap: 0.5, height: 1, justifyContent: 'space-between' }}>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          sx={{ rowGap: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Avatar
            variant="circular"
            sx={({ vars }) => ({
              width: 40,
              height: 40,
              bgcolor: vars.palette.chBlue[50],
            })}
          >
            <IconifyIcon icon={icon} sx={{ fontSize: 24, color: 'primary.main' }} />
          </Avatar>
        </Stack>

        <Stack sx={{ gap: 0.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
            }}
          >
            {typeof value === 'number' ? numberFormat(value) : value}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            {subTitle}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default StatCard;
