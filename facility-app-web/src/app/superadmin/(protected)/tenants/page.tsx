"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TablePaginationActions from "@mui/material/TablePaginationActions";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
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

// ── Sorting helpers ────────────────────────────────────────────────────────────

type Order = "asc" | "desc";
type SortKey = "name" | "isActive" | "plan" | "createdAt";

function descendingComparator(a: TenantItem, b: TenantItem, key: SortKey) {
  const av = a[key];
  const bv = b[key];
  if (bv < av) return -1;
  if (bv > av) return 1;
  return 0;
}

function getComparator(order: Order, key: SortKey) {
  return order === "desc"
    ? (a: TenantItem, b: TenantItem) => descendingComparator(a, b, key)
    : (a: TenantItem, b: TenantItem) => -descendingComparator(a, b, key);
}

// ── Column definitions ─────────────────────────────────────────────────────────

interface HeadCell {
  id: SortKey;
  label: string;
  width?: number;
  align?: "left" | "right" | "center";
}

const HEAD_CELLS: HeadCell[] = [
  { id: "name",      label: "Facility",  width: 280 },
  { id: "isActive",  label: "Status",    width: 110 },
  { id: "plan",      label: "Plan",      width: 120 },
  { id: "createdAt", label: "Created",   width: 130 },
];

// ── Selection toolbar ──────────────────────────────────────────────────────────

function SelectionToolbar({ selected, onClear }: { selected: string[]; onClear: () => void }) {
  if (!selected.length) return null;
  return (
    <Toolbar
      sx={{
        px: 2,
        bgcolor: "primary.softBg",
        borderRadius: 1,
        mb: 1,
        justifyContent: "space-between",
      }}
    >
      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
        {selected.length} selected
      </Typography>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button size="small" color="inherit" onClick={onClear}>
          Clear
        </Button>
      </Stack>
    </Toolbar>
  );
}

// ── Row actions ────────────────────────────────────────────────────────────────

function TenantRowActions({ tenant, onMutate }: { tenant: TenantItem; onMutate: () => void }) {
  const router = useRouter();
  const { trigger: toggle,     isMutating: toggling     } = useToggleTenant(tenant.id);
  const { trigger: updatePlan, isMutating: updatingPlan } = useUpdateTenantPlan(tenant.id);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: "center", justifyContent: "flex-end" }}>
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
          <IconButton
            size="small"
            disabled={toggling}
            color={tenant.isActive ? "error" : "success"}
            onClick={async () => { await toggle(); onMutate(); }}
          >
            <IconifyIcon
              icon={tenant.isActive ? "material-symbols:block-rounded" : "material-symbols:check-circle-outline-rounded"}
              sx={{ fontSize: 18 }}
            />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="View details">
        <IconButton size="small" onClick={() => router.push(`/superadmin/tenants/${tenant.id}`)}>
          <IconifyIcon icon="material-symbols:arrow-forward-rounded" sx={{ fontSize: 18 }} />
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
  );
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = yup.object({
  name:         yup.string().required("Facility name is required"),
  slug:         yup.string().matches(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only").required("Organisation code is required"),
  contactEmail: yup.string().email("Invalid email").required("Contact email is required"),
});

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SuperAdminTenantsPage() {
  const { data: tenants, isLoading, mutate } = useListTenants();
  const { trigger: createTenant, isMutating: creating } = useCreateTenant();

  const [order,    setOrder]    = useState<Order>("desc");
  const [orderBy,  setOrderBy]  = useState<SortKey>("createdAt");
  const [selected, setSelected] = useState<string[]>([]);
  const [page,     setPage]     = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search,   setSearch]   = useState("");
  const [open,     setOpen]     = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateTenantPayload>({ resolver: yupResolver(schema) });

  const filtered = useMemo(() =>
    (tenants ?? []).filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    ),
    [tenants, search],
  );

  const sorted = useMemo(() =>
    [...filtered].sort(getComparator(order, orderBy)),
    [filtered, order, orderBy],
  );

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (key: SortKey) => {
    const isAsc = orderBy === key && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(key);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? filtered.map((t) => t.id) : []);
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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

  const numSelected   = selected.length;
  const rowCount      = filtered.length;

  return (
    <Grid container>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ mb: 4, gap: 2, justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box>
              <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
                <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Facilities</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {rowCount} of {tenants?.length ?? 0} registered {(tenants?.length ?? 0) === 1 ? "facility" : "facilities"}
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
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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

          {/* Selection toolbar */}
          <SelectionToolbar selected={selected} onClear={() => setSelected([])} />

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Select-all checkbox */}
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={numSelected > 0 && numSelected < rowCount}
                      checked={rowCount > 0 && numSelected === rowCount}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>

                  {HEAD_CELLS.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align ?? "left"}
                      width={col.width}
                      sortDirection={orderBy === col.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                        {orderBy === col.id && (
                          <Box component="span" sx={visuallyHidden}>
                            {order === "desc" ? "sorted descending" : "sorted ascending"}
                          </Box>
                        )}
                      </TableSortLabel>
                    </TableCell>
                  ))}

                  {/* Actions column — no sort */}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Box sx={{ height: 40, bgcolor: "action.hover", borderRadius: 1 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  : !paginated.length
                  ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Stack sx={{ alignItems: "center", gap: 1 }}>
                            <IconifyIcon icon="material-symbols:search-off-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
                            <Typography variant="body2" color="text.disabled">
                              {search ? "No facilities match your search." : "No facilities registered yet."}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  : paginated.map((tenant) => {
                      const isSelected = selected.includes(tenant.id);
                      return (
                        <TableRow
                          key={tenant.id}
                          hover
                          selected={isSelected}
                          sx={{ "&:last-child td": { border: 0 } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelect(tenant.id)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <Stack sx={{ gap: 0.25 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                                {tenant.name}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                /{tenant.slug}
                                {tenant.contactEmail ? ` · ${tenant.contactEmail}` : ""}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={tenant.isActive ? "Active" : "Inactive"}
                              size="small"
                              color={tenant.isActive ? "success" : "default"}
                              variant="soft"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={tenant.plan === 1 ? "Professional" : "Starter"}
                              size="small"
                              color={tenant.plan === 1 ? "warning" : "default"}
                              variant="soft"
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(tenant.createdAt).format("DD MMM YYYY")}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <TenantRowActions tenant={tenant} onMutate={mutate} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            ActionsComponent={TablePaginationActions}
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
                <TextField
                  fullWidth label="Facility Name" placeholder="e.g. Greenview Estates"
                  error={!!errors.name} helperText={errors.name?.message}
                  {...register("name")}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth label="Organisation Code (slug)" placeholder="e.g. greenview"
                  error={!!errors.slug}
                  helperText={errors.slug?.message ?? "Lowercase letters, numbers and hyphens. Used in login URLs."}
                  {...register("slug")}
                  inputProps={{ style: { textTransform: "lowercase" } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth label="Contact Email" type="email"
                  error={!!errors.contactEmail} helperText={errors.contactEmail?.message}
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
    </Grid>
  );
}
