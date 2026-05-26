'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';
import SectionHeader from 'components/common/SectionHeader';

const TaskTrackHeader = () => {
  return (
    <SectionHeader
      direction={{ xs: 'column', sm: 'row' }}
      title="Daily task track"
      subTitle=""
      actionComponent={<Actions />}
      sx={{ gap: { xs: 1, sm: 2 } }}
    />
  );
};

const Actions = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { up } = useBreakpoints();
  const upLg = up('lg');

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', width: { xs: 1, sm: 'auto' } }}>
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
            },
            inputAdornment: {
              position: 'start',
            },
          }}
          sx={{ maxWidth: 180 }}
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
  );
};

export default TaskTrackHeader;
