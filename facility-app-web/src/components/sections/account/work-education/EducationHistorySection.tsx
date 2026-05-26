import { useEffect, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { StaticImageData } from 'next/image';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useAccounts } from 'providers/AccountsProvider';
import { EducationHistory } from 'types/accounts';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import AccountFormDialog from '../common/AccountFormDialog';
import Education from './Education';

interface EducationFormValues {
  institutionName: string;
  subject: string;
  location: string;
  startDate: string;
  endDate: string;
  institutionLogo: string | StaticImageData | null;
}

const educationFormSchema: yup.ObjectSchema<EducationFormValues> = yup.object().shape({
  institutionName: yup.string().required('Institution name is required'),
  subject: yup.string().required('Subject is required'),
  location: yup.string().required('Location is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  institutionLogo: yup.string().nullable().defined(),
});

const EducationHistorySection = () => {
  const { educationHistory } = useAccounts();
  const [educationHistories, setEducationHistories] = useState(educationHistory);
  const [selectedEducation, setSelectedEducation] = useState<EducationHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EducationFormValues>({
    defaultValues: {
      institutionName: '',
      subject: '',
      location: '',
      startDate: '',
      endDate: dayjs().format(),
      institutionLogo: null,
    },
    resolver: yupResolver(educationFormSchema),
  });
  const {
    register,
    control,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    if (selectedEducation) {
      reset(selectedEducation);
    } else {
      reset({
        institutionName: '',
        subject: '',
        location: '',
        startDate: '',
        endDate: '',
        institutionLogo: null,
      });
    }
  }, [selectedEducation, reset]);

  const handleOpenDialog = (education: EducationHistory | null) => {
    setSelectedEducation(education);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormSubmit: SubmitHandler<EducationFormValues> = (data) => {
    console.log({ data });
    if (selectedEducation) {
      setEducationHistories((prev) =>
        prev.map((education) =>
          education.id === selectedEducation.id
            ? {
                ...education,
                ...data,
                endDate: data.endDate ?? '',
                institutionLogo: education.institutionLogo,
              }
            : education,
        ),
      );
      enqueueSnackbar('Institution updated successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    } else {
      setEducationHistories((prev) => [
        ...prev,
        {
          ...data,
          endDate: data.endDate ?? '',
          id: educationHistories.length + 1,
          institutionLogo: '',
        },
      ]);
      enqueueSnackbar('Institution added successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    }
    handleCloseDialog();
  };

  return (
    <>
      <Stack sx={{ gap: 1, mb: 4 }}>
        {educationHistories.map((education) => (
          <Education key={education.id} education={education} handleOpenDialog={handleOpenDialog} />
        ))}
      </Stack>
      <Button
        variant="soft"
        color="neutral"
        fullWidth
        startIcon={<IconifyIcon icon="material-symbols:add" sx={{ fontSize: 20 }} />}
        onClick={() => handleOpenDialog(null)}
      >
        Add new school
      </Button>
      <FormProvider {...methods}>
        <AccountFormDialog
          title="Education Details"
          subtitle="Update your education details for accurate records and to receive relevant notifications."
          open={dialogOpen}
          onSubmit={handleFormSubmit}
          handleDialogClose={handleCloseDialog}
          sx={{
            maxWidth: 452,
          }}
        >
          <Stack sx={{ gap: 2, p: 0.125 }}>
            <Stack sx={{ gap: 1 }}>
              <TextField
                label="Institution Name"
                error={!!errors.institutionName}
                helperText={errors.institutionName?.message as string}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {selectedEducation?.institutionLogo ? (
                          <Image
                            src={selectedEducation?.institutionLogo}
                            alt=""
                            width={20}
                            height={20}
                          />
                        ) : (
                          <IconifyIcon icon="material-symbols:account-balance-outline-rounded" />
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('institutionName')}
              />
              <TextField
                label="Degree/Field of Study"
                fullWidth
                error={!!errors.subject}
                helperText={errors.subject?.message as string}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon icon="material-symbols:work-outline" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('subject')}
              />
            </Stack>
            <TextField
              label="Location"
              fullWidth
              error={!!errors.location}
              helperText={errors.location?.message as string}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="material-symbols:location-on-outline" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('location')}
            />
            <Stack direction={{ sm: 'row' }} sx={{ gap: 1, width: 1 }}>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="Start Date"
                    value={dayjs(value)}
                    onChange={(date) => onChange(date)}
                    slotProps={{
                      textField: {
                        error: !!errors.startDate,
                        helperText: errors.startDate?.message,
                      },
                      inputAdornment: {
                        position: 'start',
                      },
                    }}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="End Date"
                    value={dayjs(value)}
                    onChange={(date) => onChange(date)}
                    slotProps={{
                      textField: {
                        error: !!errors.endDate,
                        helperText: errors.endDate?.message,
                      },
                      inputAdornment: {
                        position: 'start',
                      },
                    }}
                    {...rest}
                  />
                )}
              />
            </Stack>
          </Stack>
        </AccountFormDialog>
      </FormProvider>
    </>
  );
};

export default EducationHistorySection;
