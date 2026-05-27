"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import { usePreRegister, type PreRegisterInput } from "services/swr/api-hooks/useResidentApi";

const schema = yup.object({
  visitorName:   yup.string().required("Visitor name is required"),
  visitorPhone:  yup.string().required("Phone number is required"),
  visitorEmail:  yup.string().email("Invalid email").optional(),
  purpose:       yup.string().required("Purpose is required"),
  scheduledAt:   yup.string().required("Date & time is required"),
});

export default function PreRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { trigger, isMutating } = usePreRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<PreRegisterInput>({ resolver: yupResolver(schema) as any });

  const onSubmit = async (data: PreRegisterInput) => {
    try {
      await trigger(data);
      reset();
    } catch (err: any) {
      setError("root", { message: err?.data?.message ?? "Failed to pre-register visit. Please try again." });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <IconifyIcon icon="material-symbols:person-add-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>Pre-register a Visitor</Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          {isSubmitSuccessful && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Visitor pre-registered successfully! They will receive a QR code to present at the gate.
            </Alert>
          )}
          {errors.root?.message && (
            <Alert severity="error" sx={{ mb: 3 }}>{errors.root.message}</Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Visitor Full Name"
                  error={!!errors.visitorName}
                  helperText={errors.visitorName?.message}
                  {...register("visitorName")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  error={!!errors.visitorPhone}
                  helperText={errors.visitorPhone?.message}
                  {...register("visitorPhone")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email (optional)"
                  type="email"
                  error={!!errors.visitorEmail}
                  helperText={errors.visitorEmail?.message}
                  {...register("visitorEmail")}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Purpose of Visit"
                  error={!!errors.purpose}
                  helperText={errors.purpose?.message}
                  {...register("purpose")}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Date & Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledAt}
                  helperText={errors.scheduledAt?.message}
                  {...register("scheduledAt")}
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" color="neutral" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    loading={isMutating}
                    startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
                  >
                    Pre-register
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
