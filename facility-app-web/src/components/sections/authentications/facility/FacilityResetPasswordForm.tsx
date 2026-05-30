"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axiosInstance from "services/axios/axiosInstance";
import { setTenantSlug } from "services/axios/tenantSlug";
import PasswordTextField from "components/common/PasswordTextField";

interface Props {
  slug: string;
  mode: "staff" | "resident";
}

interface FormValues {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  email:           yup.string().email("Invalid email").required("Email is required"),
  token:           yup.string().required("Reset token is required"),
  password:        yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords do not match").required("Please confirm your password"),
});

export default function FacilityResetPasswordForm({ slug, mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginHref = mode === "resident" ? `/${slug}/resident/login` : `/${slug}/login`;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setTenantSlug(slug);
    try {
      await axiosInstance.post("/auth/reset-password", {
        slug,
        email:       data.email,
        token:       data.token,
        newPassword: data.password,
      });
      router.push(`${loginHref}?reset=1`);
    } catch (err: any) {
      const messages: string[] = err?.data?.errors ?? [];
      setError("root", {
        message: messages.length > 0 ? messages.join(" ") : err?.data?.error ?? "Reset failed. Please try again.",
      });
    }
  };

  return (
    <Stack sx={{ height: 1, alignItems: "center", justifyContent: "center", py: 8 }}>
      <Grid container sx={{ maxWidth: "35rem", width: "100%", rowGap: 4, p: { xs: 3, sm: 5 } }}>
        <Grid size={12}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h4">Reset Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email, reset token, and new password.
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}><Divider /></Grid>

        <Grid size={12}>
          {errors.root?.message && (
            <Alert severity="error" sx={{ mb: 3 }}>{errors.root.message}</Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container rowSpacing={3}>
              <Grid size={12}>
                <TextField fullWidth size="large" label="Email Address" type="email" error={!!errors.email} helperText={errors.email?.message} {...register("email")} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth size="large" label="Reset Token" error={!!errors.token} helperText={errors.token?.message} {...register("token")} />
              </Grid>
              <Grid size={12}>
                <PasswordTextField fullWidth size="large" label="New Password" error={!!errors.password} helperText={errors.password?.message} {...register("password")} />
              </Grid>
              <Grid size={12}>
                <PasswordTextField fullWidth size="large" label="Confirm Password" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} {...register("confirmPassword")} />
              </Grid>
              <Grid size={12}>
                <Button fullWidth type="submit" size="large" variant="contained" loading={isSubmitting}>
                  Reset Password
                </Button>
              </Grid>
              <Grid size={12} sx={{ textAlign: "center" }}>
                <Link href={loginHref} variant="body2">Back to Sign In</Link>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
