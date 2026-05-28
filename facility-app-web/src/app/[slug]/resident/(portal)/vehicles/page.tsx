"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentVehicles, useRegisterVehicle, type VehicleInput } from "services/swr/api-hooks/useResidentApi";

const schema = yup.object({
  licensePlate: yup.string().required("License plate is required"),
  make:         yup.string().optional(),
  model:        yup.string().optional(),
  colour:       yup.string().optional(),
});

const tagColor: Record<string, "success" | "warning" | "error" | "default"> = {
  Active:    "success",
  Suspended: "warning",
  Revoked:   "error",
};

export default function VehiclesPage() {
  const [open, setOpen] = useState(false);
  const { data: vehicles, isLoading, error, mutate } = useResidentVehicles();
  if (error) return <ComingSoon onRetry={mutate} />;
  const { trigger, isMutating } = useRegisterVehicle();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<VehicleInput>({ resolver: yupResolver(schema) as any });

  const onSubmit = async (data: VehicleInput) => {
    try {
      await trigger(data);
      await mutate();
      reset();
      setOpen(false);
    } catch (err: any) {
      setError("root", { message: err?.data?.message ?? "Failed to register vehicle." });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <IconifyIcon icon="material-symbols:directions-car-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>My Vehicles</Typography>
        </Stack>
        <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:add-rounded" />} onClick={() => setOpen(true)}>
          Add Vehicle
        </Button>
      </Stack>

      <Card variant="outlined">
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 1 }} />)}
          </Box>
        ) : !vehicles?.length ? (
          <Stack sx={{ py: 6, gap: 1, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:directions-car-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No vehicles registered.</Typography>
            <Button size="small" variant="soft" color="primary" onClick={() => setOpen(true)}>Register a vehicle</Button>
          </Stack>
        ) : (
          vehicles.map((v, i) => (
            <Box key={v.id}>
              {i > 0 && <Divider />}
              <Stack direction="row" sx={{ px: 2.5, py: 2, justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                  <IconifyIcon icon="material-symbols:directions-car-outline-rounded" sx={{ fontSize: 28, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.licensePlate}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[v.colour, v.make, v.model].filter(Boolean).join(" · ") || "No details"}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
                  {v.tagNumber && (
                    <Chip label={`TAG: ${v.tagNumber}`} size="small" variant="outlined" />
                  )}
                  {v.tagStatus && (
                    <Chip label={v.tagStatus} size="small" color={tagColor[v.tagStatus] ?? "default"} variant="soft" />
                  )}
                  {!v.tagNumber && (
                    <Chip label="No tag" size="small" variant="outlined" color="default" />
                  )}
                </Stack>
              </Stack>
            </Box>
          ))
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register Vehicle</DialogTitle>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {errors.root?.message && <Alert severity="error" sx={{ mb: 2 }}>{errors.root.message}</Alert>}
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="License Plate" error={!!errors.licensePlate} helperText={errors.licensePlate?.message} {...register("licensePlate")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Make (optional)" {...register("make")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Model (optional)" {...register("model")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Colour (optional)" {...register("colour")} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" color="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" loading={isMutating}>Register</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
