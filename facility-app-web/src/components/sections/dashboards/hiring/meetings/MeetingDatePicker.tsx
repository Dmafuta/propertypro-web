'use client';

import { useState } from 'react';
import { DatePicker, pickersInputBaseClasses } from '@mui/x-date-pickers';
import dayjs, { type Dayjs } from 'dayjs';

const MeetingDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  return (
    <DatePicker
      format="DD MMM, YYYY"
      value={selectedDate}
      onChange={handleDateChange}
      slotProps={{
        textField: {
          variant: 'filled',
          slotProps: {
            htmlInput: {
              'aria-label': 'Meeting date',
            },
          },
          sx: {
            maxWidth: { lg: '150px' },
            [`& .${pickersInputBaseClasses.sectionContent}`]: {
              paddingRight: '0px !important',
            },
          },
        },
      }}
    />
  );
};

export default MeetingDatePicker;
