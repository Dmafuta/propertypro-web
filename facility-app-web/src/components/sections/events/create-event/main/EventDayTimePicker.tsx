import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { CreateEventFormSchemaValues } from '../useCreateEventForm';

interface EventDayTimePickerProps {
  dayLabel: string;
  startTimeName: 'startTime1' | 'startTime2';
  endTimeName: 'endTime1' | 'endTime2';
  errors: FieldErrors<CreateEventFormSchemaValues>;
  control: Control<CreateEventFormSchemaValues>;
}

const EventDayTimePicker = ({
  dayLabel,
  startTimeName,
  endTimeName,
  errors,
  control,
}: EventDayTimePickerProps) => (
  <Grid
    container
    spacing={1}
    sx={{
      alignItems: 'center',
    }}
  >
    <Grid size={2}>
      <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>
        {dayLabel}
        <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>
          *
        </Box>
      </Typography>
    </Grid>

    <Grid size={5}>
      <Controller
        control={control}
        name={startTimeName}
        render={({ field }) => (
          <TimePicker
            label="Start time"
            value={dayjs(field.value) ?? null}
            onChange={field.onChange}
            slotProps={{
              inputAdornment: {
                position: 'start',
              },
              textField: {
                error: !!errors[startTimeName],
                helperText: errors[startTimeName]?.message,
              },
            }}
          />
        )}
      />
    </Grid>

    <Grid size={5}>
      <Controller
        control={control}
        name={endTimeName}
        render={({ field }) => (
          <TimePicker
            label="End time"
            value={dayjs(field.value) ?? null}
            onChange={field.onChange}
            slotProps={{
              inputAdornment: {
                position: 'start',
              },
              textField: {
                error: !!errors[endTimeName],
                helperText: errors[endTimeName]?.message,
              },
            }}
          />
        )}
      />
    </Grid>
  </Grid>
);
export default EventDayTimePicker;
