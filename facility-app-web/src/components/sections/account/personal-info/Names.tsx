'use client';

import { useEffect, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, TextField } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useAccounts } from 'providers/AccountsProvider';
import { useUpdateProfile } from 'services/swr/api-hooks/useAccountApi';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import AccountFormDialog from '../common/AccountFormDialog';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

interface NameFormValues {
  firstName:  string;
  middleName: string;
  lastName:   string;
}

const nameSchema = yup.object().shape({
  firstName:  yup.string().required('First name is required'),
  middleName: yup.string().optional(),
  lastName:   yup.string().required('Last name is required'),
});

const Names = () => {
  const { personalInfo, refetchProfile } = useAccounts();
  const { update: updateSession }        = useSession();
  const { trigger: updateProfile }       = useUpdateProfile();
  const [open, setOpen]                  = useState(false);
  const { enqueueSnackbar }              = useSnackbar();

  const methods = useForm<NameFormValues>({
    defaultValues: {
      firstName:  personalInfo.firstName,
      middleName: personalInfo.middleName,
      lastName:   personalInfo.lastName,
    },
    resolver: yupResolver(nameSchema),
  });
  const { register, reset, formState: { errors } } = methods;

  useEffect(() => {
    reset({
      firstName:  personalInfo.firstName,
      middleName: personalInfo.middleName,
      lastName:   personalInfo.lastName,
    });
  }, [personalInfo.firstName, personalInfo.middleName, personalInfo.lastName, reset]);

  const onSubmit: SubmitHandler<NameFormValues> = async (data) => {
    try {
      await updateProfile({
        firstName:  data.firstName,
        middleName: data.middleName || null,
        lastName:   data.lastName,
      });
      await refetchProfile();
      await updateSession({ name: `${data.firstName} ${data.lastName}`.trim() });
      setOpen(false);
      enqueueSnackbar('Name updated successfully!', { variant: 'success', autoHideDuration: 3000 });
    } catch (err: any) {
      enqueueSnackbar(err?.data?.error ?? 'Failed to update name.', { variant: 'error', autoHideDuration: 4000 });
    }
  };

  const handleDiscard = () => {
    reset({
      firstName:  personalInfo.firstName,
      middleName: personalInfo.middleName,
      lastName:   personalInfo.lastName,
    });
    setOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <InfoCard setOpen={setOpen}>
        <Stack sx={{ gap: { xs: 2, sm: 1 } }}>
          <InfoCardAttribute label="First Name" value={personalInfo.firstName || '—'} />
          <InfoCardAttribute label="Last Name"  value={personalInfo.lastName  || '—'} />
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Name"
        subtitle="Update your first, middle (optional), and last name."
        open={open}
        onSubmit={onSubmit}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{ maxWidth: 463 }}
      >
        <Stack sx={{ gap: 1, p: 0.125 }}>
          <TextField
            placeholder="First Name"
            label="First Name"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
            {...register('firstName')}
          />
          <TextField
            placeholder="Middle Name (optional)"
            label="Middle Name"
            fullWidth
            {...register('middleName')}
          />
          <TextField
            placeholder="Last Name"
            label="Last Name"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            fullWidth
            {...register('lastName')}
          />
        </Stack>
      </AccountFormDialog>
    </FormProvider>
  );
};

export default Names;
