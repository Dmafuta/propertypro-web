"use client";

import { useState } from "react";
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

interface Props {
  slug: string;
  mode: "staff" | "resident";
}

const schema = yup.object({ email: yup.string().email("Invalid email").required("Email is required") });

export default function FacilityForgotPasswordForm({ slug, mode }: Props) {
  const [devToken, setDevToken] = useState<string | null>(null);
  const loginHref = mode === "resident" ? `/${slug}/resident/login` : `/${slug}/login`;
  const resetHref = mode === "resident" ? `/${slug}/resident/reset-password` : `/${slug}/reset-password`;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<{ email: string }>({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email }: { email: string }) => {
    setTenantSlug(slug);
    try {
      const res: any = await axiosInstance.post("/auth/forgot-password", { email });
      // Dev mode: backend returns the token directly
      if (res?.token) setDevToken(res.token);
    } catch {
      setError("root", { message: "Something went wrong. Please try again." });
    }
  };

  return (
    <Stack sx={{ height: 1, alignItems: "center", justifyContent: "center", py: 8 }}>
      <Grid container sx={{ maxWidth: "35rem", width: "100%", rowGap: 4, p: { xs: 3, sm: 5 } }}>
        <Grid size={12}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h4">Forgot Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email and we will send you a reset link.
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}><Divider /></Grid>

        <Grid size={12}>
          {isSubmitSuccessful && !devToken && (
            <Alert severity="success" sx={{ mb: 3 }}>
              If that email exists, a reset link has been sent to your inbox.
            </Alert>
          )}
          {devToken && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Dev mode — reset token:</strong> {devToken}
              <br />
              <Link href={`${resetHref}?token=${encodeURIComponent(devToken)}`} sx={{ mt: 0.5, display: "block" }}>
                Click here to reset your password
              </Link>
            </Alert>
          )}
          {errors.root?.message && (
            <Alert severity="error" sx={{ mb: 3 }}>{errors.root.message}</Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container rowSpacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="large"
                  label="Email Address"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register("email")}
                />
              </Grid>
              <Grid size={12}>
                <Button fullWidth type="submit" size="large" variant="contained" loading={isSubmitting}>
                  Send Reset Link
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
