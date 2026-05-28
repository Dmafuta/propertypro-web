"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, gridClasses, type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import IconifyIcon from "components/base/IconifyIcon";
import DataGridPagination from "components/pagination/DataGridPagination";
import {
  useListTenants,
  useCreateTenant,
  useToggleTenant,
  useUpdateTenantPlan,
  type TenantItem,
  type CreateTenantPayload,
} from "services/swr/api-hooks/useSuperAdminApi";

const schema = yup.object({
  name:         yup.string().required("Facility name is required"),
  slug:         yup.string().matches(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only").required("Organisation code is required"),
  contactEmail: yup.string().email("Invalid email").required("Contact email is required"),
});

function ActionCell({ tenant, onMutate }: { tenant: TenantItem; onMutate: () => void }) {
  const router = useRouter();
  const { trigger: toggle, isMutating: toggling } = useToggleTenant(tenant.id);
  const { trigger: updatePlan, isMutating: updatingPlan } = useUpdateTenantPlan(tenant.id);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: "center", height: "100%" }}>
      <Select
        size="small"
        value={tenant.plan}
        disabled={updatingPlan}
        onChange={async (e) => { await updatePlan({ plan: Number(e.target.value) }); onMutate(); }}
        sx={{ minWidth: 130, fontSize: "0.8rem" }}
      >
        <MenuItem value={0}>Starter</MenuItem>
        <MenuItem value={1}>Professional</MenuItem>
      </Select>

      <Tooltip title={tenant.isActive ? "Deactivate" : "Activate"}>
        <span>
          <IconButton size="small" disabled={toggling} color={tenant.isActive ? "error" : "success"}
            onClick={async () => { await toggle(); onMutate(); }}>
            <IconifyIcon icon={tenant.isActive ? "material-symbols:block-rounded" : "material-symbols:check-circle-outline-rounded"} sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="View details">
        <IconButton size="small" onClick={() => router.push(`/superadmin/tenants/${tenant.id}`)}>
          <IconifyIcon icon="material-symbols:arrow-forward-rounded" sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Open portal">
        <IconButton size="small" component="a" href={`/${tenant.slug}/login`} target="_blank" rel="noopener noreferrer">
          <IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default function SuperAdminTenantsPage() {
  const { data: tenants, isLoading, mutate } = useListTenants();
  const { trigger: createTenant, isMutating: creating } = useCreateTenant();
  const [open, setOpen]               = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateTenantPayload>({ resolver: yupResolver(schema) });

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

  const rows = useMemo(() =>
    (tenants ?? []).filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    ),
    [tenants, search],
  );

  const columns: GridColDef<TenantItem>[] = useMemo(() => [
    {
      field: "name",
      headerName: "Facility",
      headerClassName: "name-header",
      cellClassName: "name-cell",
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Stack sx={{ gap: 0.25, justifyContent: "center", height: "100%" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            /{params.row.slug}
            {params.row.contactEmail ? ` · ${params.row.contactEmail}` : ""}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      headerClassName: "status-header",
      cellClassName: "status-cell",
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? "Active" : "Inactive"}
          size="small"
          color={params.row.isActive ? "success" : "default"}
          variant="soft"
        />
      ),
    },
    {
      field: "plan",
      headerName: "Plan",
      headerClassName: "plan-header",
      cellClassName: "plan-cell",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.plan === 1 ? "Professional" : "Starter"}
          size="small"
          color={params.row.plan === 1 ? "warning" : "default"}
          variant="soft"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      headerClassName: "created-header",
      cellClassName: "created-cell",
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {dayjs(params.row.createdAt).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "",
      headerClassName: "action-header",
      cellClassName: "action-cell",
      sortable: false,
      width: 280,
      renderCell: (params) => <ActionCell tenant={params.row} onMutate={mutate} />,
    },
  ], [mutate]);

  return (
    <Grid container>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header */}
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 4, gap: 2, justifyContent: "space-between", alignItems: { sm: "center" } }}>
            <Box>
              <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
                <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Facilities</Typography>
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
            sx={{ mb: 3, maxWidth: 360 }}
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

          {/* DataGrid */}
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={64}
            loading={isLoading}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{
              basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
            }}
            sx={({ spacing }) => ({
              border: 0,
              [`& .${gridClasses.columnHeaders}`]: {
                [`& .${gridClasses.columnHeader}`]: {
                  "&:not(.action-header)": { p: `0 ${spacing(1.25)}` },
                  "&.action-header": { pl: spacing(1.25) },
                },
              },
              [`& .${gridClasses.row}`]: {
                [`& .${gridClasses.cell}`]: {
                  "&.aurora-data-grid-cell": {
                    "&:not(.action-cell)": { p: `0 ${spacing(1.25)}` },
                    "&.action-cell": { pl: spacing(1.25) },
                  },
                },
              },
            })}
          />
        </Paper>
      </Grid>

      {/* Create dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Facility</DialogTitle>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
            <Grid container rowSpacing={2.5}>
              <Grid size={12}>
                <TextField fullWidth label="Facility Name" placeholder="e.g. Greenview Estates"
                  error={!!errors.name} helperText={errors.name?.message} {...register("name")} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Organisation Code (slug)" placeholder="e.g. greenview"
                  error={!!errors.slug} helperText={errors.slug?.message ?? "Lowercase letters, numbers and hyphens. Used in login URLs."}
                  {...register("slug")} inputProps={{ style: { textTransform: "lowercase" } }} />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Contact Email" type="email"
                  error={!!errors.contactEmail} helperText={errors.contactEmail?.message} {...register("contactEmail")} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" loading={creating}>Create Facility</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Grid>
  );
}
