'use client';

import { Dispatch, SetStateAction, useImperativeHandle } from 'react';
import Box from '@mui/material/Box';
import { buttonClasses } from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';
import { pickerDayClasses } from '@mui/x-date-pickers';
import {
  DateCalendar,
  dayCalendarClasses,
  pickersSlideTransitionClasses,
} from '@mui/x-date-pickers/DateCalendar';
import { Attendance } from 'data/member/dashboard';
import dayjs, { Dayjs } from 'dayjs';
import CalendarDay from '../../hrm/attendance/CalendarDay';
import CalendarHeader from './CalendarHeader';

const dayOfWeekShortLabelMap: Record<string, string> = {
  Su: 'Sun',
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
};

export interface AttendanceCalendarMethods {
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
}
interface AttendanceCalendarProps {
  currentDate: Dayjs;
  setCurrentDate: Dispatch<SetStateAction<Dayjs>>;
  data: Attendance[];
  sx?: SxProps<Theme>;
  ref?: React.RefObject<AttendanceCalendarMethods | null>;
}

const AttendanceCalendar = ({
  ref,
  setCurrentDate,
  data,
  currentDate,
  sx,
}: AttendanceCalendarProps) => {
  useImperativeHandle(ref, () => ({
    goToNextMonth: () => setCurrentDate((prev) => prev.add(1, 'month')),
    goToPreviousMonth: () => setCurrentDate((prev) => prev.subtract(1, 'month')),
  }));
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <CalendarHeader calendarRef={ref} currentDate={currentDate} />
      <DateCalendar
        value={currentDate}
        onChange={(newValue) => newValue && setCurrentDate(newValue)}
        dayOfWeekFormatter={(date) =>
          dayOfWeekShortLabelMap[date.format('dd')] ?? date.format('dd')
        }
        showDaysOutsideCurrentMonth
        slots={{
          calendarHeader: () => null,
          day: (dayProps) => (
            <CalendarDay
              {...dayProps}
              isDifferentMonthDay={dayProps.day.month() !== currentDate.month()}
              status={data[Number(dayjs(dayProps.day).format('D')) - 1].status}
            />
          ),
        }}
        fixedWeekNumber={5}
        sx={({ vars, spacing }) => ({
          padding: 0,
          width: '100%',
          height: '100%',
          maxHeight: 'unset',
          flex: 1,
          '& > div': {
            flex: 1,
            height: '100%',
          },
          [`& .${buttonClasses.root}`]: {
            borderRadius: 9999,
          },
          [`& .${dayCalendarClasses.root}`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            [`& .${dayCalendarClasses.header}`]: {
              marginBottom: `${spacing(3)} !important`,
              background: 'none !important',
              display: 'flex !important',
              justifyContent: 'space-between',
              [`& .${dayCalendarClasses.weekDayLabel}`]: {
                color: `${vars.palette.text.primary} !important`,
                fontSize: '14px !important',
                height: 'auto !important',
              },
            },
            [`& .${pickersSlideTransitionClasses.root}`]: {
              height: '100%',
              [`& .${dayCalendarClasses.monthContainer}`]: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px !important',
                justifyContent: 'space-between',
                [`& .${dayCalendarClasses.weekContainer}`]: {
                  display: 'flex !important',
                  justifyContent: 'space-between',
                  background: 'none !important',
                  [`& .${pickerDayClasses.root}`]: {
                    margin: 0,
                    width: '40px !important',
                    height: '40px !important',
                    backgroundColor: vars.palette.background.elevation1,
                    borderRadius: 9999,
                    color: vars.palette.text.secondary,
                    fontSize: '14px !important',
                    [`&.${pickerDayClasses.dayOutsideMonth}`]: {
                      color: `${vars.palette.text.disabled} !important`,
                    },
                  },
                  [`& .${pickerDayClasses.today}`]: {
                    fontWeight: 500,
                    backgroundColor: `${vars.palette.primary.main} !important`,
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
