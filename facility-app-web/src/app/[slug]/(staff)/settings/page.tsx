'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetSettings,
  useUpdateBranding,
  useUpdateSettings,
  useUpdateSms,
} from 'services/swr/api-hooks/useSettingsApi';

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({
  icon,
  title,
  description,
  badge,
}: {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}) => (
  <Stack sx={{ mb: 4 }}>
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', mb: 0.5 }}>
      <Avatar
        variant="rounded"
        sx={{ width: 36, height: 36, bgcolor: 'primary.lighter', borderRadius: 1.5 }}
      >
        <IconifyIcon icon={icon} sx={{ fontSize: 20, color: 'primary.main' }} />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {badge && (
        <Chip label={badge} size="small" color="warning" variant="soft" />
      )}
    </Stack>
    <Typography variant="body2" color="text.secondary" sx={{ ml: 6.5 }}>
      {description}
    </Typography>
  </Stack>
);

// ── General tab ───────────────────────────────────────────────────────────────
const GeneralTab = () => {
  const { data: settings, isLoading, mutate } = useGetSettings();
  const { trigger: save, isMutating: saving } = useUpdateSettings();

  const isProfessional = settings?.plan === 1;

  const [name,         setName]         = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address,      setAddress]      = useState('');
  const [website,      setWebsite]      = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setName(settings.name ?? '');
      setContactEmail(settings.contactEmail ?? '');
      setContactPhone(settings.contactPhone ?? '');
      setAddress(settings.address ?? '');
      setWebsite(settings.website ?? '');
      setCustomDomain(settings.customDomain ?? '');
    }
  }, [settings]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    try {
      await save({
        name,
        contactEmail:  contactEmail  || null,
        contactPhone:  contactPhone  || null,
        address:       address       || null,
        website:       website       || null,
        customDomain:  isProfessional ? (customDomain || null) : null,
      });
      await mutate();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save settings.');
    }
  };

  if (isLoading) {
    return (
      <Stack sx={{ gap: 2 }}>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      {/* Facility details */}
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <SectionHeader
          icon="material-symbols:location-city-rounded"
          title="Facility Information"
          description="Basic details about your facility shown across the platform."
        />
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Facility Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Greenwood Estates"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="admin@yourfacility.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+254 700 000 000"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Nairobi"
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourfacility.com"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Custom domain — Professional only */}
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <SectionHeader
          icon="material-symbols:language-rounded"
          title="Custom Domain"
          description={
            isProfessional
              ? 'Point your own domain to this facility. Residents and staff will use your domain instead of the shared platform URL.'
              : 'Upgrade to Professional to use your own custom domain.'
          }
          badge={isProfessional ? undefined : 'Professional'}
        />
        <TextField
          fullWidth
          label="Custom Domain"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          disabled={!isProfessional}
          placeholder={isProfessional ? 'yourfacility.com' : 'Professional plan required'}
          helperText={isProfessional ? 'Enter the domain without https:// — e.g. greatwallgardens.estate' : undefined}
        />
      </Paper>

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Settings saved successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box>
        <Button variant="contained" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Stack>
  );
};

// ── Branding tab ──────────────────────────────────────────────────────────────
const BrandingTab = () => {
  const { data: settings, isLoading, mutate } = useGetSettings();
  const { trigger: save, isMutating: saving } = useUpdateBranding();

  const [logoUrl,       setLogoUrl]       = useState('');
  const [primaryColour, setPrimaryColour] = useState('#3385F0');
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logoUrl ?? '');
      setPrimaryColour(settings.primaryColour ?? '#3385F0');
    }
  }, [settings]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    try {
      await save({
        logoUrl:       logoUrl       || null,
        primaryColour: primaryColour || null,
      });
      await mutate();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save branding.');
    }
  };

  if (isLoading) {
    return (
      <Stack sx={{ gap: 2 }}>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <SectionHeader
          icon="material-symbols:palette-outline-rounded"
          title="Branding"
          description="Customise your facility's look. Changes appear on login pages and throughout the portal."
        />
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Logo URL"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://cdn.yoursite.com/logo.png"
              helperText="Publicly accessible URL for your facility logo (PNG or SVG recommended)"
              slotProps={{
                input: {
                  endAdornment: logoUrl ? (
                    <Avatar
                      src={logoUrl}
                      variant="rounded"
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                  ) : null,
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Primary Colour
            </Typography>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Box
                component="input"
                type="color"
                value={primaryColour}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrimaryColour(e.target.value)
                }
                sx={{
                  width: 48,
                  height: 48,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  p: 0.5,
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              />
              <TextField
                size="small"
                label="Hex value"
                value={primaryColour}
                onChange={(e) => setPrimaryColour(e.target.value)}
                placeholder="#3385F0"
                sx={{ width: 160 }}
              />
              <Typography variant="caption" color="text.secondary">
                Used as the accent colour on login pages and resident portal.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Branding saved successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box>
        <Button variant="contained" loading={saving} onClick={handleSave}>
          Save Branding
        </Button>
      </Box>
    </Stack>
  );
};

// ── SMS tab ───────────────────────────────────────────────────────────────────
const SmsTab = () => {
  const { data: settings, isLoading, mutate } = useGetSettings();
  const { trigger: save, isMutating: saving } = useUpdateSms();

  const isProfessional = settings?.plan === 1;

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [apiKey,     setApiKey]     = useState('');
  const [username,   setUsername]   = useState('');
  const [senderId,   setSenderId]   = useState('');
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setSmsEnabled(settings.smsEnabled);
      setApiKey(settings.smsApiKey ?? '');
      setUsername(settings.smsUsername ?? '');
      setSenderId(settings.smsSenderId ?? '');
    }
  }, [settings]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    try {
      await save({
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

  if (isLoading) {
    return (
      <Stack sx={{ gap: 2 }}>
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={56} />
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <SectionHeader
          icon="material-symbols:sms-outline-rounded"
          title="SMS Notifications"
          description="Control whether SMS alerts are sent to staff and residents for visits, parcels, maintenance and unit requests."
        />

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

          <Box>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Custom Africa&apos;s Talking Credentials
              </Typography>
              {!isProfessional && (
                <Chip label="Professional" size="small" color="warning" variant="soft" />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
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
                  placeholder={isProfessional ? "Africa's Talking API key" : 'Professional plan required'}
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
                  placeholder={isProfessional ? "Africa's Talking username" : 'Professional plan required'}
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
        </Stack>
      </Paper>

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
        <Button variant="contained" loading={saving} onClick={handleSave}>
          Save SMS Settings
        </Button>
      </Box>
    </Stack>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'General',  icon: 'material-symbols:tune-rounded'          },
  { label: 'Branding', icon: 'material-symbols:palette-outline-rounded' },
  { label: 'SMS',      icon: 'material-symbols:sms-outline-rounded'    },
];

export default function StaffSettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* Page header */}
      <Stack sx={{ mb: 4, gap: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your facility configuration, branding and notifications
        </Typography>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map(({ label, icon }) => (
          <Tab
            key={label}
            label={label}
            icon={<IconifyIcon icon={icon} sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{ minHeight: 48, textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      {tab === 0 && <GeneralTab />}
      {tab === 1 && <BrandingTab />}
      {tab === 2 && <SmsTab />}
    </Box>
  );
}
