"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import {
  useResidentMaintenance,
  useSubmitMaintenance,
  type MaintenanceInput,
  type MaintenanceStatus,
} from "services/swr/api-hooks/useResidentApi";

const schema = yup.object({
  title:       yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  category:    yup.string().required("Category is required"),
  priority:    yup.string().required("Priority is required"),
});

const statusColor: Record<MaintenanceStatus, "default" | "primary" | "warning" | "success" | "error"> = {
  Open:       "primary",
  InProgress: "warning",
  Resolved:   "success",
  Closed:     "default",
};

const priorityColor: Record<string, "default" | "warning" | "error" | "success"> = {
  Low:    "success",
  Medium: "default",
  High:   "warning",
  Urgent: "error",
};

export default function MaintenancePage() {
  const [open, setOpen] = useState(false);
  const { data: requests, isLoading, error, mutate } = useResidentMaintenance();
  if (error) return <ComingSoon onRetry={mutate} />;
  const { trigger, isMutating } = useSubmitMaintenance();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<MaintenanceInput>({ resolver: yupResolver(schema) as any });

  const onSubmit = async (data: MaintenanceInput) => {
    try {
      await trigger(data);
      await mutate();
      reset();
      setOpen(false);
    } catch (err: any) {
      setError("root", { message: err?.data?.message ?? "Failed to submit request." });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <IconifyIcon icon="material-symbols:build-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Maintenance Requests</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => setOpen(true)}
        >
          New Request
        </Button>
      </Stack>

      <Card variant="outlined">
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 1 }} />)}
          </Box>
        ) : !requests?.length ? (
          <Stack sx={{ py: 6, gap: 1, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:build-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No maintenance requests yet.</Typography>
            <Button size="small" variant="soft" color="primary" onClick={() => setOpen(true)}>Submit a request</Button>
          </Stack>
        ) : (
          requests.map((req, i) => (
            <Box key={req.id}>
              {i > 0 && <Divider />}
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ px: 2.5, py: 2, gap: 1, justifyContent: "space-between" }}>
                <Box>
                  <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.title}</Typography>
                    <Chip label={req.priority} size="small" color={priorityColor[req.priority]} variant="soft" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{req.category} · {dayjs(req.createdAt).format("DD MMM YYYY")}</Typography>
                  {req.staffNote && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      Staff note: {req.staffNote}
                    </Typography>
                  )}
                </Box>
                <Chip label={req.status} size="small" color={statusColor[req.status]} variant="soft" sx={{ alignSelf: "flex-start" }} />
              </Stack>
            </Box>
          ))
        )}
      </Card>

      {/* New request dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Maintenance Request</DialogTitle>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {errors.root?.message && <Alert severity="error" sx={{ mb: 2 }}>{errors.root.message}</Alert>}
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} {...register("title")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Category" defaultValue="" error={!!errors.category} helperText={errors.category?.message} {...register("category")}>
                  {["Plumbing","Electrical","HVAC","Structural","Appliance","Pest","Cleaning","Other"].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Priority" defaultValue="" error={!!errors.priority} helperText={errors.priority?.message} {...register("priority")}>
                  {["Low","Medium","High","Urgent"].map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth multiline rows={3} label="Description" error={!!errors.description} helperText={errors.description?.message} {...register("description")} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" color="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" loading={isMutating}>Submit</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
