'use client';

import { Dispatch, SetStateAction, useImperativeHandle } from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import { pickerDayClasses } from '@mui/x-date-pickers';
import {
  DateCalendar,
  dayCalendarClasses,
  pickersSlideTransitionClasses,
} from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import { Attendance } from 'types/hrm';
import CalendarDay from './CalendarDay';

const dayOfWeekShortLabelMap: Record<string, string> = {
  Su: 'Sun',
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
};

interface AttendanceCalendarMethods {
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
}
interface AttendanceCalendarProps {
  currentDate: Dayjs;
  setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
  attendance: Attendance;
  sx?: SxProps;
  ref?: React.Ref<AttendanceCalendarMethods>;
}

const AttendanceCalendar = ({
  currentDate,
  setCurrentDate,
  attendance,
  sx,
  ref,
}: AttendanceCalendarProps) => {
  useImperativeHandle(ref, () => ({
    goToNextMonth: () => setCurrentDate((prev) => prev.add(1, 'month')),
    goToPreviousMonth: () => setCurrentDate((prev) => prev.subtract(1, 'month')),
  }));

  return (
    <Box sx={sx}>
      <DateCalendar
        value={currentDate}
        onChange={(newValue) => newValue && setCurrentDate(newValue)}
        disableHighlightToday
        dayOfWeekFormatter={(date) =>
          dayOfWeekShortLabelMap[date.format('dd')] ?? date.format('dd')
        }
        slots={{
          calendarHeader: () => null,
          day: (dayProps) => (
            <CalendarDay
              {...dayProps}
              isDifferentMonthDay={dayProps.day.month() !== currentDate.month()}
              status={attendance.details[Number(dayjs(dayProps.day).format('D')) - 1].status}
            />
          ),
        }}
        showDaysOutsideCurrentMonth
        fixedWeekNumber={5}
        sx={(theme) => ({
          padding: 0,
          width: '100%',
          height: '100%',
          maxHeight: 'unset',
          minHeight: '300px !important',
          flex: 1,
          '& > div': {
            flex: 1,
            height: '100%',
          },
          [`& .${dayCalendarClasses.root}`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            [`& .${dayCalendarClasses.header}`]: {
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              placeItems: 'center',
              gap: 0,
              padding: 0,
              marginBottom: `${theme.spacing(6)} !important`,
              background: 'none !important',

              [`& .${dayCalendarClasses.weekDayLabel}`]: {
                color: `${theme.vars.palette.text.primary} !important`,
                fontSize: theme.typography.body2.fontSize,
                height: 'auto !important',
              },
            },

            [`& .${pickersSlideTransitionClasses.root}`]: {
              height: '100%',

              [`& .${dayCalendarClasses.monthContainer}`]: {
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(1),

                [`& .${dayCalendarClasses.weekContainer}`]: {
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  placeItems: 'center',
                  gap: theme.spacing(1),

                  [`& .${pickerDayClasses.root}`]: {
                    margin: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.vars.palette.background.elevation1,
                    borderRadius: (theme.shape.borderRadius as number) * 7.5,
                    color: theme.vars.palette.text.secondary,
                    fontSize: 14,
                    outline: 'none',

                    '&.Mui-focusVisible': {
                      outline: 'none',
                    },
                  },

                  [`& .${pickerDayClasses.today}`]: {
                    fontWeight: 500,
                  },
                },
              },
            },
          },
        })}
      />
    </Box>
  );
};

export default AttendanceCalendar;
