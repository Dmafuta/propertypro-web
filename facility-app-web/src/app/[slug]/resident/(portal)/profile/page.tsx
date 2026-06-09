"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import {
  useResidentProfile,
  useUpdateProfile,
  type ProfileUpdateInput,
} from "services/swr/api-hooks/useResidentApi";
import {
  useTelegramLinkStatus,
  useTelegramGenerateLink,
  useTelegramUnlink,
} from "services/swr/api-hooks/useSettingsApi";

const schema = yup.object({
  fullName:    yup.string().optional(),
  phoneNumber: yup.string().optional(),
});

// ── Telegram link card ────────────────────────────────────────────────────────
const TelegramLinkCard = () => {
  const { data: status, mutate: reloadStatus } = useTelegramLinkStatus();
  const { trigger: generateLink, isMutating: generating } = useTelegramGenerateLink();
  const { trigger: unlink, isMutating: unlinking }        = useTelegramUnlink();

  const [linkInfo,  setLinkInfo]  = useState<{ linkToken: string; expiresInMinutes: number } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setLinkError(null);
    setLinkInfo(null);
    try {
      const res = await generateLink();
      setLinkInfo((res as any)?.data ?? null);
    } catch (err: any) {
      setLinkError(err?.data?.error ?? 'Telegram is not configured for this facility.');
    }
  };

  const handleUnlink = async () => {
    await unlink();
    setLinkInfo(null);
    await reloadStatus();
  };

  if (status === undefined) return null; // error or loading — skip silently

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', mb: 2 }}>
          <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: 'info.lighter', borderRadius: 1.5 }}>
            <IconifyIcon icon="la:telegram" sx={{ fontSize: 20, color: 'info.main' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Telegram Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Receive visit, parcel and maintenance alerts on Telegram
            </Typography>
          </Box>
          {status?.linked && (
            <Chip label="Linked" color="success" variant="soft" size="small" sx={{ ml: 'auto' }} />
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {status?.linked ? (
          <Stack sx={{ gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Your Telegram account is linked. You will receive notifications directly in Telegram.
            </Typography>
            <Button
              variant="soft"
              color="error"
              size="small"
              loading={unlinking}
              onClick={handleUnlink}
              startIcon={<IconifyIcon icon="material-symbols:link-off-rounded" />}
            >
              Unlink Telegram
            </Button>
          </Stack>
        ) : (
          <Stack sx={{ gap: 1.5 }}>
            {!linkInfo ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Link your Telegram account to get notifications without SMS.
                </Typography>
                {linkError && <Alert severity="warning">{linkError}</Alert>}
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  loading={generating}
                  onClick={handleGenerateLink}
                  startIcon={<IconifyIcon icon="la:telegram" />}
                >
                  Link Telegram
                </Button>
              </>
            ) : (
              <>
                <Alert severity="info" icon={false}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Open the facility bot on Telegram and send this command:
                  </Typography>
                  <Box
                    sx={{
                      p: 1, mt: 1, borderRadius: 1,
                      bgcolor: 'background.elevation1',
                      border: '1px solid', borderColor: 'divider',
                      fontFamily: 'monospace', fontSize: 13,
                      wordBreak: 'break-all',
                    }}
                  >
                    /start {linkInfo.linkToken}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    This link expires in {linkInfo.expiresInMinutes} minutes.
                  </Typography>
                </Alert>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button size="small" onClick={() => setLinkInfo(null)}>Cancel</Button>
                  <Button size="small" variant="soft" color="success" onClick={() => reloadStatus()}>
                    Check if Linked
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

// ── Profile page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: profile, isLoading, mutate } = useResidentProfile();
  const { trigger, isMutating } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ProfileUpdateInput>({ resolver: yupResolver(schema) as any });

  useEffect(() => {
    if (profile) {
      reset({
        fullName:    profile.fullName,
        phoneNumber: profile.phoneNumber ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      await trigger(data);
      await mutate();
    } catch (err: any) {
      setError("root", { message: err?.data?.message ?? "Failed to update profile." });
    }
  };

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ gap: 1, mb: 3, alignItems: "center" }}>
        <IconifyIcon icon="material-symbols:account-circle-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Profile</Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          {/* Avatar */}
          <Stack sx={{ mb: 3, gap: 1, alignItems: "center" }}>
            {isLoading ? (
              <Skeleton variant="circular" width={72} height={72} />
            ) : (
              <Avatar sx={{ width: 72, height: 72, fontSize: "1.5rem", bgcolor: "primary.main" }}>
                {initials}
              </Avatar>
            )}
            {isLoading ? (
              <Skeleton variant="text" width={160} />
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {profile?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                {profile?.unitNumber && (
                  <Typography variant="caption" color="text.secondary">Unit {profile.unitNumber}</Typography>
                )}
              </>
            )}
          </Stack>

          {isSubmitSuccessful && (
            <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully.</Alert>
          )}
          {errors.root?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>{errors.root.message}</Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  disabled={isLoading}
                  {...register("fullName")}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile?.email ?? ""}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  disabled={isLoading}
                  {...register("phoneNumber")}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  loading={isMutating}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <TelegramLinkCard />
    </Container>
  );
}
