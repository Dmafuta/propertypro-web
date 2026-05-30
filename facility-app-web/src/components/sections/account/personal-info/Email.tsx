'use client';

import { useEffect, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAccounts } from 'providers/AccountsProvider';
import { useUpdateEmail } from 'services/swr/api-hooks/useAccountApi';
import * as yup from 'yup';
import IconifyIcon from 'components/base/IconifyIcon';
import AccountFormDialog from '../common/AccountFormDialog';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

interface EmailFormValues {
  primaryEmail:   string;
  secondaryEmail: string;
}

const emailSchema = yup.object().shape({
  primaryEmail: yup
    .string()
    .email('Primary email must be a valid email')
    .required('Primary email is required'),
  secondaryEmail: yup
    .string()
    .email('Secondary email must be a valid email')
    .optional(),
});

const Email = () => {
  const { personalInfo, refetchProfile } = useAccounts();
  const { trigger: updateEmail }         = useUpdateEmail();
  const [open, setOpen]                  = useState(false);
  const { enqueueSnackbar }              = useSnackbar();

  const methods = useForm<EmailFormValues>({
    defaultValues: {
      primaryEmail:   personalInfo.primaryEmail,
      secondaryEmail: personalInfo.secondaryEmail,
    },
    resolver: yupResolver(emailSchema),
  });
  const { register, reset, formState: { errors } } = methods;

  useEffect(() => {
    reset({
      primaryEmail:   personalInfo.primaryEmail,
      secondaryEmail: personalInfo.secondaryEmail,
    });
  }, [personalInfo.primaryEmail, personalInfo.secondaryEmail, reset]);

  const onSubmit: SubmitHandler<EmailFormValues> = async (data) => {
    try {
      await updateEmail({
        primaryEmail:   data.primaryEmail,
        secondaryEmail: data.secondaryEmail || null,
      });
      await refetchProfile();
      setOpen(false);
      enqueueSnackbar('Email updated successfully!', { variant: 'success', autoHideDuration: 3000 });
    } catch (err: any) {
      enqueueSnackbar(err?.data?.error ?? 'Failed to update email.', { variant: 'error', autoHideDuration: 4000 });
    }
  };

  const handleDiscard = () => {
    reset({
      primaryEmail:   personalInfo.primaryEmail,
      secondaryEmail: personalInfo.secondaryEmail,
    });
    setOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack sx={{ gap: { xs: 2, sm: 1 } }}>
          <InfoCardAttribute label="Primary Email"   value={personalInfo.primaryEmail   || '—'} />
          <InfoCardAttribute label="Secondary Email" value={personalInfo.secondaryEmail || 'Not set'} />
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Email Address"
        subtitle="Update your primary email. You can also set an alternate email for backup access."
        open={open}
        onSubmit={onSubmit}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{ maxWidth: 463 }}
      >
        <Stack sx={{ gap: 1, p: 0.125 }}>
          <TextField
            placeholder="Primary Email"
            label="Primary Email"
            error={!!errors.primaryEmail}
            helperText={errors.primaryEmail?.message}
            fullWidth
            {...register('primaryEmail')}
          />
          <TextField
            placeholder="Secondary Email (optional)"
            label="Secondary Email"
            error={!!errors.secondaryEmail}
            helperText={errors.secondaryEmail?.message}
            fullWidth
            {...register('secondaryEmail')}
          />
        </Stack>
      </AccountFormDialog>
      <Stack direction="row" sx={{ gap: 1, color: 'info.main' }}>
        <IconifyIcon icon="material-symbols:info" sx={{ fontSize: 24 }} />
        <Typography variant="body2">
          Your alternate email will be used to gain access to your account if you ever have issues
          with logging in with your primary email.
        </Typography>
      </Stack>
    </FormProvider>
  );
};

export default Email;
