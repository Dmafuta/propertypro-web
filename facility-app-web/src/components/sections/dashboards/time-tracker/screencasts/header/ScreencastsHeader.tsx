'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import SearchTextField from 'components/common/SearchTextField';
import SectionHeader from 'components/common/SectionHeader';
import TimeSelect from './TimeSelect';
import TimeToggleTab from './TimeToggleTab';

const ScreencastsHeader = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [open, setOpen] = useState(false);
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const upLg = up('lg');

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="Screencasts"
        subTitle=""
        actionComponent={<DashboardMenu />}
        sx={{ mb: 1 }}
      />

      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        {upSm ? <TimeToggleTab /> : <TimeSelect />}
        <SearchTextField
          placeholder="Search member"
          onChange={handleSearch}
          fullWidth
          sx={{ ml: 'auto', maxWidth: { xs: 1, sm: 220 } }}
          iconSx={{ color: 'text.secondary' }}
        />
        {upLg ? (
          <DatePicker
            format="DD MMM, YYYY"
            value={selectedDate}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                variant: 'filled',
                fullWidth: true,
                sx: { maxWidth: 180 },
              },
              inputAdornment: {
                position: 'start',
              },
            }}
          />
        ) : (
          <>
            <DatePicker
              open={open}
              value={selectedDate}
              onChange={handleDateChange}
              onClose={() => setOpen(false)}
              slotProps={{
                textField: { sx: { display: 'none' } },
                popper: {
                  anchorEl: buttonRef.current,
                  placement: 'bottom-start',
                },
              }}
            />
            <Button
              ref={buttonRef}
              variant="soft"
              shape="square"
              color="neutral"
              onClick={() => setOpen(true)}
            >
              <IconifyIcon
                icon="material-symbols:calendar-today-outline-rounded"
                sx={{ fontSize: 18, color: 'text.secondary' }}
              />
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ScreencastsHeader;
