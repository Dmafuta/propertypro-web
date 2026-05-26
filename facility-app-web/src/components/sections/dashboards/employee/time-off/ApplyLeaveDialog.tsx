import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Fragment } from 'react/jsx-runtime';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { filledInputClasses } from '@mui/material/FilledInput';
import Grid from '@mui/material/Grid';
import { inputBaseClasses } from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';

type LeaveApplyingFormValues = {
  from: Date;
  to: Date;
  categories: string;
  totalDays: number;
  reason: string;
};

const leaveApplyingSchema: yup.ObjectSchema<LeaveApplyingFormValues> = yup.object({
  from: yup.date().required('Date is required'),
  to: yup.date().required('Date is required'),
  categories: yup.string().required('Category is required'),
  totalDays: yup.number().required(''),
  reason: yup.string().required('Reason is required'),
});

const ApplyLeaveDialog = () => {
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<LeaveApplyingFormValues>({
    resolver: yupResolver(leaveApplyingSchema),
    defaultValues: {
      totalDays: 0,
      categories: '',
    },
  });
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);

  const from = watch('from');
  const to = watch('to');

  const days =
    from && to && dayjs(to).isAfter(dayjs(from)) ? dayjs(to).diff(dayjs(from), 'day') : 0;

  const onClose = () => setOpen(false);

  const onSubmit: SubmitHandler<LeaveApplyingFormValues> = function (data) {
    console.log({ data });
    enqueueSnackbar('Leave applied successfully', { variant: 'success' });
    onClose();
  };

  useEffect(() => setValue('totalDays', days), [days, setValue]);
  return (
    <Fragment>
      <Button fullWidth variant="soft" color="neutral" onClick={(_) => setOpen(true)}>
        Apply Leave
      </Button>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit(onSubmit),
          },
        }}
        sx={{
          [`& .${dialogClasses.paper}`]: {
            borderRadius: 6,
            overflow: 'visible',
            maxWidth: 540,
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={({ spacing }) => ({
            padding: `${spacing(5)} ${spacing(5)} ${spacing(1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          Leave Request
          <Button shape="circle" color="neutral" onClick={onClose}>
            <IconifyIcon
              icon="material-symbols:close"
              sx={{ fontSize: 20, color: 'neutral.dark' }}
            />
          </Button>
        </DialogTitle>
        <DialogContent
          sx={({ spacing }) => ({ padding: `${spacing(5)} ${spacing(5)} ${spacing(3)}` })}
        >
          <DialogContentText
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3, textWrap: 'pretty' }}
          >
            Provide the details of your leave request, includingdates, type of leave, and a brief
            reason for your absence.
          </DialogContentText>
          <Grid container rowSpacing={2} columnSpacing={1} sx={{ mb: 3 }}>
            <Grid size={6}>
              <Controller
                name="from"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="From"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(val) => field.onChange(val?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.from,
                        helperText: errors.from?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="to"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="To"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(val) => field.onChange(val?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.to,
                        helperText: errors.to?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                select
                fullWidth
                label="Cateogories"
                error={!!errors.categories}
                helperText={errors.categories?.message}
                {...register('categories')}
                defaultValue=""
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Paid Leave">Paid Leave</MenuItem>
                <MenuItem value="Vacation">Vacation</MenuItem>
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField
                label="Total Days"
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                value={days}
              />
            </Grid>
          </Grid>
          <TextAreaField
            placeholder="Reason"
            error={!!errors.reason}
            helperText={errors.reason?.message as string}
            {...register('reason')}
          />
        </DialogContent>
        <DialogActions
          sx={({ spacing }) => ({
            padding: `${spacing(0)} ${spacing(5)} ${spacing(5)}`,
            justifyContent: 'flex-start',
          })}
        >
          <Button color="neutral" onClick={() => onClose()} sx={{ ml: 'auto !important' }}>
            Discard
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export const TextAreaField = styled(({ ref, sx, ...rest }: Omit<TextFieldProps, 'multiline'>) => (
  <TextField sx={{ ...sx }} rows={4} ref={ref} {...rest} multiline fullWidth />
))(({ theme }) => ({
  [`& .${filledInputClasses.root}.${inputBaseClasses.multiline}`]: {
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    [`& .${inputBaseClasses.input}`]: {
      padding: 0,
    },
  },
}));

export default ApplyLeaveDialog;
