'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { eventCategories } from 'data/project/dashboard';
import dayjs from 'dayjs';
import StyledTextField from 'components/styled/StyledTextField';
import { ScheduleFormValues } from './ScheduleDialog';

const EventTitleTime = () => {
  const { vars } = useTheme();
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ScheduleFormValues>();

  return (
    <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
      <StyledTextField
        label="Title"
        fullWidth
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <Stack direction="row" sx={{ gap: 1, width: 1, minWidth: 0, alignItems: 'flex-end' }}>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="allDayEvent"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      if (e.target.checked) {
                        setValue('startTime', '12:00 am');
                        setValue('endTime', '11:59 pm');
                      } else {
                        setValue('startTime', dayjs().format('h:mm a'));
                        setValue('endTime', dayjs().format('h:mm a'));
                      }
                    }}
                  />
                }
                label="All day event"
                sx={{ gap: 1.5, mx: 0, mb: 1 }}
              />
            )}
          />
        </Stack>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <FormControl fullWidth>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <StyledTextField select label="Category" {...field}>
                  {eventCategories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: vars.palette[option.color].main,
                          }}
                        />
                        {option.label}
                      </Stack>
                    </MenuItem>
                  ))}
                </StyledTextField>
              )}
            />
          </FormControl>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, width: 1, minWidth: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="p"
            variant="overline"
            sx={{
              display: 'block',
              color: 'text.secondary',
              ml: 2,
              mb: 0.5,
              textTransform: 'none',
              letterSpacing: 0,
              lineHeight: 1.2,
            }}
          >
            Starts at
          </Typography>
          <Stack sx={{ gap: 1 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  value={dayjs(value, 'DD.MM.YYYY')}
                  format="DD.MM.YYYY"
                  onChange={onChange}
                  slotProps={{
                    textField: {
                      variant: 'filled',
                      fullWidth: true,
                      hiddenLabel: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message,
                      slotProps: {
                        htmlInput: { 'aria-label': 'Start date' },
                      },
                    },
                  }}
                />
              )}
            />
            <Controller
              name="startTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TimePicker
                  value={dayjs(`${dayjs().format('DD.MM.YYYY')} ${value}`, 'DD.MM.YYYY h:mm a')}
                  format="h:mm a"
                  onChange={(date) => onChange(date?.format('h:mm a'))}
                  slotProps={{
                    textField: {
                      variant: 'filled',
                      fullWidth: true,
                      hiddenLabel: true,
                      error: !!errors.startTime,
                      helperText: errors.startTime?.message,
                      slotProps: {
                        htmlInput: { 'aria-label': 'Start time' },
                      },
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="p"
            variant="overline"
            sx={{
              display: 'block',
              color: 'text.secondary',
              ml: 2,
              mb: 0.5,
              textTransform: 'none',
              letterSpacing: 0,
              lineHeight: 1.2,
            }}
          >
            Ends at
          </Typography>
          <Stack sx={{ gap: 1 }}>
            <Controller
              name="endDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  value={dayjs(value, 'DD.MM.YYYY')}
                  format="DD.MM.YYYY"
                  onChange={onChange}
                  slotProps={{
                    textField: {
                      variant: 'filled',
                      fullWidth: true,
                      hiddenLabel: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate?.message,
                      slotProps: {
                        htmlInput: { 'aria-label': 'End date' },
                      },
                    },
                  }}
                />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TimePicker
                  value={dayjs(`${dayjs().format('DD.MM.YYYY')} ${value}`, 'DD.MM.YYYY h:mm a')}
                  format="h:mm a"
                  onChange={(date) => onChange(date?.format('h:mm a'))}
                  slotProps={{
                    textField: {
                      variant: 'filled',
                      fullWidth: true,
                      hiddenLabel: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime?.message,
                      slotProps: {
                        htmlInput: { 'aria-label': 'End time' },
                      },
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default EventTitleTime;
