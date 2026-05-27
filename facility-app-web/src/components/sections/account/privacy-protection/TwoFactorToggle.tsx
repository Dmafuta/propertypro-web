'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axiosInstance from 'services/axios/axiosInstance';
import paths from 'routes/paths';

interface PhoneStatus {
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
}

const TwoFactorToggle = () => {
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();

  const [status, setStatus] = useState<PhoneStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  const isStaff = (session?.user as any)?.userType === 'Staff';

  useEffect(() => {
    axiosInstance
      .get('/auth/me/phone')
      .then((data: any) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (enable: boolean) => {
    setError('');
    setToggling(true);
    try {
      const data: any = await axiosInstance.put('/auth/toggle-2fa', { enable });
      setStatus((prev) => (prev ? { ...prev, twoFactorEnabled: data.twoFactorEnabled } : prev));
      enqueueSnackbar(data.message, { variant: 'success', autoHideDuration: 3000 });
    } catch (e: any) {
      setError(e?.data?.error ?? 'Failed to update two-factor authentication.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <CircularProgress size={20} />;
  }

  // Staff: 2FA is mandatory, cannot toggle
  if (isStaff) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'info.lighter',
          border: '1px solid',
          borderColor: 'info.light',
        }}
      >
        <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 500 }}>
          Two-factor authentication is mandatory for all staff accounts and cannot be disabled.
        </Typography>
      </Box>
    );
  }

  // Resident: show toggle (disabled if phone not verified)
  const canToggle = status?.phoneNumberConfirmed && !!status?.phoneNumber;

  return (
    <Stack sx={{ gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <FormControlLabel
        control={
          <Switch
            checked={status?.twoFactorEnabled ?? false}
            disabled={!canToggle || toggling}
            onChange={(e) => handleToggle(e.target.checked)}
          />
        }
        label={
          <Stack sx={{ gap: 0.25 }}>
            <Typography variant="subtitle2">
              {status?.twoFactorEnabled
                ? 'Two-factor authentication is enabled'
                : 'Two-factor authentication is disabled'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {canToggle
                ? 'You will be asked for an SMS code on every login.'
                : 'Verify your phone number on the Personal Info tab to enable this.'}
            </Typography>
          </Stack>
        }
        sx={{ alignItems: 'flex-start', gap: 1, ml: 0 }}
      />

      {!canToggle && (
        <Typography
          component="a"
          href={paths.account}
          variant="body2"
          sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Go to Personal Info → verify your phone number
        </Typography>
      )}
    </Stack>
  );
};

export default TwoFactorToggle;
