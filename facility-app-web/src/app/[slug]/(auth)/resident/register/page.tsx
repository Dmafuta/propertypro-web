"use client";

import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import PasswordTextField from "components/common/PasswordTextField";

interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  fullName:        yup.string().required("Full name is required"),
  email:           yup.string().email("Invalid email").required("Email is required"),
  phone:           yup.string().optional().default(""),
  password:        yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function ResidentRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // 1. Register via API
      await axiosInstance.post("/auth/register", {
        fullName: data.fullName,
        email:    data.email,
        password: data.password,
        phone:    data.phone || undefined,
      });

      // 2. Auto sign-in with the new credentials
      const res = await signIn("credentials", {
        email:      data.email,
        password:   data.password,
        tenantSlug: slug,
        staffOnly:  "false",
        redirect:   false,
      });

      if (res?.ok) {
        router.push(`/${slug}/resident/dashboard`);
        router.refresh();
      } else {
        // Registered but sign-in failed — send to login
        router.push(`/${slug}/resident/login`);
      }
    } catch (err: any) {
      const messages: string[] = err?.data?.errors ?? [];
      const msg =
        messages.length > 0
          ? messages.join(" ")
          : err?.data?.error ?? "Registration failed. Please try again.";
      setError("root", { message: msg });
    }
  };

  return (
    <Stack sx={{ height: 1, alignItems: "center", justifyContent: "center", py: 8 }}>
      <Grid container sx={{ maxWidth: "35rem", width: "100%", rowGap: 4, p: { xs: 3, sm: 5 } }}>
        <Grid size={12}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h4">Create Account</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Sign up for the resident portal
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.root.message}
              </Alert>
            )}

            <Grid container rowSpacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="large"
                  label="Full Name"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  {...register("fullName")}
                />
              </Grid>

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
                <TextField
                  fullWidth
                  size="large"
                  label="Phone Number (optional)"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  {...register("phone")}
                />
              </Grid>

              <Grid size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  label="Password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register("password")}
                />
              </Grid>

              <Grid size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  label="Confirm Password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </Grid>

              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Create Account
                </Button>
              </Grid>

              <Grid size={12} sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Already have an account?{" "}
                  <Link href={`/${slug}/resident/login`}>Sign in</Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
