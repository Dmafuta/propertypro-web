'use client';

import { ThemeVars, useTheme } from '@mui/material';
import { PickerDay, PickerDayProps } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface CalendarDayProps {
  status: string;
  isDifferentMonthDay: boolean;
}

const getHighlightColor = (type: string, vars: ThemeVars) => {
  switch (type) {
    case 'ON TIME':
      return vars.palette.success.lighter;
    case 'DELAYED':
      return vars.palette.warning.lighter;
    case 'ABSENT':
      return vars.palette.error.lighter;
    case 'LEAVE':
      return vars.palette.info.lighter;
  }
};

const CalendarDay = (props: PickerDayProps & CalendarDayProps) => {
  const { day, status, isDifferentMonthDay, ...other } = props;
  const { vars } = useTheme();

  const isToday = day.isSame(dayjs(), 'day');
  const isWeeknd = day.day() === 5 || day.day() === 6;
  const isHighlightedDay = day < dayjs() && !isDifferentMonthDay && !isWeeknd;
  const highlightColor = getHighlightColor(status, vars) ?? vars.palette.background.elevation1;

  return (
    <PickerDay
      {...other}
      day={day}
      sx={[
        isDifferentMonthDay && {
          opacity: 0.5,
        },
        isHighlightedDay &&
          !isToday && {
            bgcolor: `${highlightColor} !important`,
          },
        isToday && {
          bgcolor: `${vars.palette.primary.main} !important`,
          color: `${vars.palette.common.white} !important`,
          border: `8px solid ${highlightColor} !important`,
          outline: 'none !important',
          boxSizing: 'border-box',

          '&.Mui-selected, &.Mui-selected:hover, &:hover': {
            bgcolor: `${vars.palette.primary.main} !important`,
            color: `${vars.palette.common.white} !important`,
            border: `8px solid ${highlightColor} !important`,
          },

          '&.Mui-focusVisible': {
            outline: 'none !important',
            border: `8px solid ${highlightColor} !important`,
          },
        },
      ]}
    />
  );
};

export default CalendarDay;
