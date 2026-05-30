'use client';

import { useEffect, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAccounts } from 'providers/AccountsProvider';
import { useUpdateUsername } from 'services/swr/api-hooks/useAccountApi';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import AccountFormDialog from '../common/AccountFormDialog';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

interface UserNameFormValues {
  userName: string;
}

const userNameSchema = yup.object().shape({
  userName: yup.string().required('Username is required'),
});

const UserName = () => {
  const { personalInfo, refetchProfile } = useAccounts();
  const { trigger: updateUsername }      = useUpdateUsername();
  const [open, setOpen]                  = useState(false);
  const { enqueueSnackbar }              = useSnackbar();

  const methods = useForm<UserNameFormValues>({
    defaultValues: { userName: personalInfo.userName },
    resolver: yupResolver(userNameSchema),
  });
  const { register, reset, formState: { errors } } = methods;

  useEffect(() => {
    reset({ userName: personalInfo.userName });
  }, [personalInfo.userName, reset]);

  const onSubmit: SubmitHandler<UserNameFormValues> = async (data) => {
    try {
      await updateUsername({ userName: data.userName });
      await refetchProfile();
      setOpen(false);
      enqueueSnackbar('Username updated successfully!', { variant: 'success', autoHideDuration: 3000 });
    } catch (err: any) {
      enqueueSnackbar(err?.data?.error ?? 'Failed to update username.', { variant: 'error', autoHideDuration: 4000 });
    }
  };

  const handleDiscard = () => {
    reset({ userName: personalInfo.userName });
    setOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <InfoCard setOpen={setOpen}>
        <Stack sx={{ gap: { xs: 2, sm: 1 }, justifyContent: 'center' }}>
          <InfoCardAttribute label="User Name" value={personalInfo.userName || '—'} />
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>
      <AccountFormDialog
        title="User Name"
        subtitle="Update your username. This will be visible in your interactions across the platform."
        open={open}
        onSubmit={onSubmit}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{ maxWidth: 463 }}
      >
        <Stack sx={{ gap: 1, p: 0.125 }}>
          <TextField
            placeholder="Username"
            label="User Name"
            error={!!errors.userName}
            helperText={errors.userName?.message}
            fullWidth
            {...register('userName')}
          />
        </Stack>
      </AccountFormDialog>
    </FormProvider>
  );
};

export default UserName;
