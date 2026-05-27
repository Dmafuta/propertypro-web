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
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import IconifyIcon from "components/base/IconifyIcon";
import {
  useListTenants,
  useCreateTenant,
  useToggleTenant,
  useUpdateTenantPlan,
  type TenantItem,
  type CreateTenantPayload,
} from "services/swr/api-hooks/useSuperAdminApi";

const schema = yup.object({
  name: yup.string().required("Facility name is required"),
  slug: yup
    .string()
    .matches(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only")
    .required("Organisation code is required"),
  contactEmail: yup.string().email("Invalid email").required("Contact email is required"),
});

function TenantRow({ tenant, onMutate }: { tenant: TenantItem; onMutate: () => void }) {
  const { trigger: toggle, isMutating: toggling } = useToggleTenant(tenant.id);
  const { trigger: updatePlan, isMutating: updatingPlan } = useUpdateTenantPlan(tenant.id);

  const handleToggle = async () => {
    await toggle();
    onMutate();
  };

  const handlePlanChange = async (plan: number) => {
    await updatePlan({ plan });
    onMutate();
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ px: 2.5, py: 2, gap: 2 }}
      >
        {/* Identity */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {tenant.name}
            </Typography>
            <Chip
              label={tenant.isActive ? "Active" : "Inactive"}
              size="small"
              color={tenant.isActive ? "success" : "default"}
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" alignItems="center" sx={{ gap: 0.5, mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary">
              /{tenant.slug}
            </Typography>
            {tenant.contactEmail && (
              <Typography variant="caption" color="text.disabled">
                &nbsp;·&nbsp;{tenant.contactEmail}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
            Created {dayjs(tenant.createdAt).format("DD MMM YYYY")}
          </Typography>
        </Box>

        {/* Plan selector + actions */}
        <Stack direction="row" alignItems="center" sx={{ gap: 1.5, flexShrink: 0 }}>
          <Select
            size="small"
            value={tenant.plan}
            disabled={updatingPlan}
            onChange={(e) => handlePlanChange(Number(e.target.value))}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value={0}>Starter</MenuItem>
            <MenuItem value={1}>Professional</MenuItem>
          </Select>

          <Tooltip title={tenant.isActive ? "Deactivate" : "Activate"}>
            <IconButton
              size="small"
              disabled={toggling}
              onClick={handleToggle}
              color={tenant.isActive ? "error" : "success"}
            >
              <IconifyIcon
                icon={
                  tenant.isActive
                    ? "material-symbols:block-rounded"
                    : "material-symbols:check-circle-outline-rounded"
                }
                sx={{ fontSize: 20 }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open portal">
            <IconButton
              size="small"
              component="a"
              href={`/${tenant.slug}/login`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
    </Box>
  );
}

export default function SuperAdminTenantsPage() {
  const { data: tenants, isLoading, mutate } = useListTenants();
  const { trigger: createTenant, isMutating: creating } = useCreateTenant();
  const [open, setOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTenantPayload>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: CreateTenantPayload) => {
    setCreateError(null);
    try {
      await createTenant({ ...data, slug: data.slug.toLowerCase() });
      await mutate();
      setOpen(false);
      reset();
    } catch (err: any) {
      setCreateError(err?.data?.error ?? "Failed to create facility.");
    }
  };

  const filtered = (tenants ?? []).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 4, gap: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 0.5 }}>
            <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700}>Facilities</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Manage all registered facilities and their plans.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => { setCreateError(null); reset(); setOpen(true); }}
        >
          New Facility
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Search by name or org code…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 360 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Table */}
      <Card variant="outlined">
        {/* Column header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2.5, py: 1.25, bgcolor: "action.hover" }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Facility
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Plan / Actions
          </Typography>
        </Stack>
        <Divider />

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="text" height={64} />)}
          </Box>
        ) : !filtered.length ? (
          <Stack alignItems="center" sx={{ py: 6, gap: 1 }}>
            <IconifyIcon icon="material-symbols:search-off-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">
              {search ? "No facilities match your search." : "No facilities registered yet."}
            </Typography>
          </Stack>
        ) : (
          filtered.map((t) => (
            <TenantRow key={t.id} tenant={t} onMutate={mutate} />
          ))
        )}
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: "block" }}>
        {filtered.length} of {tenants?.length ?? 0} facility{(tenants?.length ?? 0) !== 1 ? "ies" : "y"}
      </Typography>

      {/* Create dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Facility</DialogTitle>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
            )}
            <Grid container rowSpacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Facility Name"
                  placeholder="e.g. Greenview Estates"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register("name")}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Organisation Code (slug)"
                  placeholder="e.g. greenview"
                  error={!!errors.slug}
                  helperText={errors.slug?.message ?? "Lowercase letters, numbers and hyphens. Used in login URLs."}
                  {...register("slug")}
                  inputProps={{ style: { textTransform: "lowercase" } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
                  {...register("contactEmail")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" loading={creating}>Create Facility</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
