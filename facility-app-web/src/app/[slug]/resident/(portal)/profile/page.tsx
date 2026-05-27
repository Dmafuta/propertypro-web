"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
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

const schema = yup.object({
  firstName:   yup.string().required("First name is required"),
  lastName:    yup.string().required("Last name is required"),
  phoneNumber: yup.string().optional(),
});

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
        firstName:   profile.firstName,
        lastName:    profile.lastName,
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

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <IconifyIcon icon="material-symbols:account-circle-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>My Profile</Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          {/* Avatar + email */}
          <Stack alignItems="center" sx={{ mb: 3, gap: 1 }}>
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
                <Typography variant="subtitle1" fontWeight={600}>
                  {profile?.firstName} {profile?.lastName}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isLoading}
                  {...register("firstName")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isLoading}
                  {...register("lastName")}
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
    </Container>
  );
}
