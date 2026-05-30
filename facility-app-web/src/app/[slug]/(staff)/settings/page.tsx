'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import { useGetSettings, useUpdateSms } from 'services/swr/api-hooks/useSettingsApi';

export default function StaffSettingsPage() {
  const { data: settings, isLoading, mutate } = useGetSettings();
  const { trigger: updateSms, isMutating: saving } = useUpdateSms();

  const isProfessional = settings?.plan === 1;

  const [smsEnabled, setSmsEnabled]   = useState(true);
  const [apiKey,     setApiKey]       = useState('');
  const [username,   setUsername]     = useState('');
  const [senderId,   setSenderId]     = useState('');
  const [success,    setSuccess]      = useState(false);
  const [error,      setError]        = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setSmsEnabled(settings.smsEnabled);
      setApiKey(settings.smsApiKey ?? '');
      setUsername(settings.smsUsername ?? '');
      setSenderId(settings.smsSenderId ?? '');
    }
  }, [settings]);

  const handleSmsSave = async () => {
    setError(null);
    setSuccess(false);
    try {
      await updateSms({
        enabled:  smsEnabled,
        apiKey:   apiKey   || null,
        username: username || null,
        senderId: senderId || null,
      });
      await mutate();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save SMS settings.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack sx={{ mb: 4, gap: 0.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <IconifyIcon icon="material-symbols:settings-outline-rounded" sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Manage facility configuration
        </Typography>
      </Stack>

      {/* SMS Notifications */}
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', mb: 0.5 }}>
            <IconifyIcon icon="material-symbols:sms-outline-rounded" sx={{ fontSize: 22, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>SMS Notifications</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Control whether SMS alerts are sent to staff and residents for visits, parcels, maintenance and unit requests.
          </Typography>

          {isLoading ? (
            <Stack sx={{ gap: 2 }}>
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          ) : (
            <Stack sx={{ gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Enable SMS for this facility
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      When off, no SMS alerts will be sent for any event in this facility.
                    </Typography>
                  </Stack>
                }
              />

              <Divider />

              {/* Custom credentials — Professional only */}
              <Box>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Custom Africa&apos;s Talking Credentials
                  </Typography>
                  <Chip
                    label="Professional"
                    size="small"
                    color="warning"
                    variant="soft"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {isProfessional
                    ? "Provide your own Africa's Talking account to send SMS under your branding and billing. Leave blank to use the platform's shared account."
                    : "Upgrade to Professional to use your own Africa's Talking account."}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="API Key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={!isProfessional || !smsEnabled}
                      placeholder={isProfessional ? 'Africa\'s Talking API key' : 'Professional plan required'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isProfessional || !smsEnabled}
                      placeholder={isProfessional ? 'Africa\'s Talking username' : 'Professional plan required'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender ID (optional)"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      disabled={!isProfessional || !smsEnabled}
                      placeholder="Alphanumeric sender name"
                      helperText="Leave blank to use a shortcode"
                    />
                  </Grid>
                </Grid>
              </Box>

              {success && (
                <Alert severity="success" onClose={() => setSuccess(false)}>
                  SMS settings saved successfully.
                </Alert>
              )}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Box>
                <Button
                  variant="contained"
                  loading={saving}
                  onClick={handleSmsSave}
                >
                  Save SMS Settings
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
