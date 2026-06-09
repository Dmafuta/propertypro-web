'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import axiosFetcher from 'services/axios/axiosFetcher';
import {
  HrStaffDto,
  HrStaffResponse,
  UpsertProfilePayload,
  useGetHrStaff,
  useUpsertProfile,
} from 'services/swr/api-hooks/useHrApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAFF_ROLES = ['Admin', 'Manager', 'HrManager', 'Receptionist', 'Security'] as const;
type RoleColor = 'error' | 'warning' | 'secondary' | 'info' | 'success' | 'neutral';

function getRoleColor(role: string): RoleColor {
  if (role === 'Admin')        return 'error';
  if (role === 'Manager')      return 'warning';
  if (role === 'HrManager')    return 'secondary';
  if (role === 'Receptionist') return 'info';
  if (role === 'Security')     return 'success';
  return 'neutral';
}

function getRoleLabel(role: string) {
  return role === 'HrManager' ? 'HR Manager' : role;
}

function primaryRole(roles: string[]) {
  return (STAFF_ROLES as readonly string[]).find((r) => roles.includes(r)) ?? null;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toDateInput(iso: string | null | undefined) {
  return iso ? iso.substring(0, 10) : '';
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color = 'neutral' }: {
  icon: string; label: string; value: number | string; color?: string;
}) {
  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, height: 1 }}>
      <Stack direction="row" gap={2} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{ width: 48, height: 48, bgcolor: `${color}.lighter`, borderRadius: 2, flexShrink: 0 }}
        >
          <IconifyIcon icon={icon} sx={{ fontSize: 26, color: `${color}.main` }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {value !== '' && value !== undefined ? value : <Skeleton width={40} />}
          </Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ── Profile Drawer ────────────────────────────────────────────────────────────

const ProfileDrawer = ({
  employee, onClose, onSaved,
}: {
  employee: HrStaffDto | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { trigger: upsert, isMutating: saving } = useUpsertProfile(employee?.id ?? '');
  const [editing, setEditing] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<UpsertProfilePayload>({});

  const openEdit = () => {
    const p = employee?.profile;
    setForm({
      middleName:            p?.middleName            ?? null,
      nationalId:            p?.nationalId            ?? null,
      passportNumber:        p?.passportNumber        ?? null,
      dateOfBirth:           p?.dateOfBirth           ?? null,
      gender:                p?.gender               ?? null,
      address:               p?.address              ?? null,
      joiningDate:           p?.joiningDate ?? employee?.joiningDate ?? null,
      contractType:          p?.contractType          ?? null,
      department:            p?.department            ?? null,
      emergencyContactName:  p?.emergencyContactName  ?? null,
      emergencyContactPhone: p?.emergencyContactPhone ?? null,
    });
    setError(null); setSuccess(false); setEditing(true);
  };

  const handleClose = () => { setEditing(false); setError(null); setSuccess(false); onClose(); };

  const handleSave = async () => {
    setError(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]),
      ) as UpsertProfilePayload;
      await upsert(payload);
      setSuccess(true); setEditing(false); onSaved();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save profile.');
    }
  };

  const set = useCallback(
    (key: keyof UpsertProfilePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value || null })),
    [],
  );

  const role = employee ? primaryRole(employee.roles) : null;
  const p    = employee?.profile;

  return (
    <Drawer
      anchor="right"
      open={!!employee}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' } }}
    >
      {employee && (
        <>
          {/* Header */}
          <Box
            sx={{
              p: 4, pb: 3,
              background: 'linear-gradient(135deg, var(--mui-palette-primary-lighter) 0%, var(--mui-palette-background-paper) 80%)',
              borderBottom: '1px solid', borderColor: 'divider',
            }}
          >
            <Stack direction="row" gap={2} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 64, height: 64,
                  bgcolor: 'primary.main', color: 'primary.contrastText',
                  fontWeight: 700, fontSize: 22, flexShrink: 0,
                }}
              >
                {getInitials(employee.fullName)}
              </Avatar>
              <Stack flex={1} minWidth={0}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{employee.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{employee.email}</Typography>
                {employee.phoneNumber && (
                  <Typography variant="caption" color="text.secondary">{employee.phoneNumber}</Typography>
                )}
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  {role && (
                    <Chip label={getRoleLabel(role)} color={getRoleColor(role)} variant="soft" size="small" />
                  )}
                  <Chip
                    label={employee.isActive ? 'Active' : 'Inactive'}
                    color={employee.isActive ? 'success' : 'neutral'}
                    variant="soft"
                    size="small"
                    icon={
                      <IconifyIcon
                        icon={employee.isActive
                          ? 'material-symbols:check-circle-outline-rounded'
                          : 'material-symbols:cancel-outline-rounded'}
                        width={14}
                      />
                    }
                  />
                  {(p?.department ?? employee.department) && (
                    <Chip label={p?.department ?? employee.department!} variant="soft" size="small" />
                  )}
                </Stack>
              </Stack>
              <Button variant="text" size="small" onClick={handleClose} sx={{ minWidth: 0, p: 0.5, flexShrink: 0 }}>
                <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
              </Button>
            </Stack>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
            {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>Profile saved.</Alert>}
            {editing ? <EditForm form={form} set={set} setForm={setForm} /> : <ReadView employee={employee} />}
          </Box>

          <Divider />

          {/* Footer */}
          <Stack direction="row" sx={{ p: 3, gap: 1.5, justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <Button variant="text" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="contained" loading={saving} onClick={handleSave}>Save Profile</Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" sx={{ fontSize: 18 }} />}
                onClick={openEdit}
              >
                Edit Profile
              </Button>
            )}
          </Stack>
        </>
      )}
    </Drawer>
  );
};

// ── Read View ─────────────────────────────────────────────────────────────────

const ReadView = ({ employee }: { employee: HrStaffDto }) => {
  const p = employee.profile;

  const row = (label: string, value: string | null | undefined, icon: string) => (
    <Stack direction="row" gap={1.5} sx={{ py: 1.25 }} alignItems="flex-start">
      <IconifyIcon icon={icon} sx={{ fontSize: 18, color: 'text.disabled', mt: 0.15, flexShrink: 0 }} />
      <Stack>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{value || '—'}</Typography>
      </Stack>
    </Stack>
  );

  const section = (title: string, children: React.ReactNode) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
        {title}
      </Typography>
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        {children}
      </Paper>
    </Box>
  );

  return (
    <>
      {section('Employment', (
        <Grid container>
          <Grid size={12}>
            {row('Department', p?.department ?? employee.department, 'material-symbols:corporate-fare-rounded')}
          </Grid>
          <Grid size={6}>
            {row('Contract', p?.contractType ?? employee.contractType, 'material-symbols:description-outline-rounded')}
          </Grid>
          <Grid size={6}>
            {row('Joined', fmtDate(p?.joiningDate ?? employee.joiningDate), 'material-symbols:calendar-today-outline-rounded')}
          </Grid>
        </Grid>
      ))}
      {section('Personal', (
        <Grid container>
          <Grid size={6}>{row('National ID', p?.nationalId, 'material-symbols:badge-outline-rounded')}</Grid>
          <Grid size={6}>{row('Passport', p?.passportNumber, 'material-symbols:flight-outline-rounded')}</Grid>
          <Grid size={6}>{row('Date of Birth', fmtDate(p?.dateOfBirth), 'material-symbols:cake-outline-rounded')}</Grid>
          <Grid size={6}>{row('Gender', p?.gender, 'material-symbols:person-outline-rounded')}</Grid>
          <Grid size={12}>{row('Middle Name', p?.middleName, 'material-symbols:badge-outline-rounded')}</Grid>
          <Grid size={12}>{row('Address', p?.address, 'material-symbols:location-on-outline-rounded')}</Grid>
        </Grid>
      ))}
      {section('Emergency Contact', (
        <Grid container>
          <Grid size={12}>{row('Name', p?.emergencyContactName, 'material-symbols:person-alert-outline-rounded')}</Grid>
          <Grid size={12}>{row('Phone', p?.emergencyContactPhone, 'material-symbols:phone-outline-rounded')}</Grid>
        </Grid>
      ))}
    </>
  );
};

// ── Edit Form ─────────────────────────────────────────────────────────────────

const GENDERS   = ['Male', 'Female', 'Other', 'Prefer not to say'];
const CONTRACTS = ['Permanent', 'Contract', 'Part-time', 'Intern', 'Consultant'];

const EditForm = ({
  form, set, setForm,
}: {
  form: UpsertProfilePayload;
  set: (key: keyof UpsertProfilePayload) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<UpsertProfilePayload>>;
}) => (
  <Stack gap={3}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Employment</Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField fullWidth size="small" label="Department" value={form.department ?? ''} onChange={set('department')} />
      </Grid>
      <Grid size={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Contract Type</InputLabel>
          <Select
            value={form.contractType ?? ''} label="Contract Type"
            onChange={(e) => setForm((f) => ({ ...f, contractType: e.target.value || null }))}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {CONTRACTS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={6}>
        <TextField fullWidth size="small" label="Joining Date" type="date"
          value={toDateInput(form.joiningDate)}
          onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
    </Grid>

    <Divider />
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Personal</Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField fullWidth size="small" label="Middle Name" value={form.middleName ?? ''} onChange={set('middleName')} />
      </Grid>
      <Grid size={6}>
        <TextField fullWidth size="small" label="National ID" value={form.nationalId ?? ''} onChange={set('nationalId')} />
      </Grid>
      <Grid size={6}>
        <TextField fullWidth size="small" label="Passport No." value={form.passportNumber ?? ''} onChange={set('passportNumber')} />
      </Grid>
      <Grid size={6}>
        <TextField fullWidth size="small" label="Date of Birth" type="date"
          value={toDateInput(form.dateOfBirth)}
          onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select value={form.gender ?? ''} label="Gender"
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value || null }))}>
            <MenuItem value=""><em>Prefer not to say</em></MenuItem>
            {GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <TextField fullWidth size="small" label="Address" multiline rows={2} value={form.address ?? ''} onChange={set('address')} />
      </Grid>
    </Grid>

    <Divider />
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Emergency Contact</Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField fullWidth size="small" label="Contact Name" value={form.emergencyContactName ?? ''} onChange={set('emergencyContactName')} />
      </Grid>
      <Grid size={12}>
        <TextField fullWidth size="small" label="Contact Phone" value={form.emergencyContactPhone ?? ''} onChange={set('emergencyContactPhone')}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">+</InputAdornment> } }}
        />
      </Grid>
    </Grid>
  </Stack>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HrStaffPage() {
  const [search,       setSearch]       = useState('');
  const [dSearch,      setDSearch]      = useState('');
  const [page,         setPage]         = useState(0);
  const [roleFilter,   setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected,     setSelected]     = useState<HrStaffDto | null>(null);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => { setDSearch(val); setPage(0); }, 400);
  }, []);

  // Server-paginated data for the main table
  const { data, isLoading, mutate } = useGetHrStaff(dSearch, page + 1);

  // Load all staff (large page size) once for KPI summary + client-side filtering
  const { data: allStaff } = useSWR<HrStaffResponse>(
    '/hr/staff?search=&page=1&pageSize=500',
    axiosFetcher,
  );

  const summary = useMemo(() => {
    const items = allStaff?.items ?? [];
    const total = allStaff?.total ?? 0;
    const active = items.filter((s) => s.isActive).length;
    const depts  = new Set(items.map((s) => s.department ?? s.profile?.department).filter(Boolean)).size;
    const roleCounts: Record<string, number> = {};
    items.forEach((s) => {
      const r = primaryRole(s.roles);
      if (r) roleCounts[r] = (roleCounts[r] ?? 0) + 1;
    });
    return { total, active, inactive: total - active, depts, roleCounts };
  }, [allStaff]);

  // Client-side filtered rows when role/status filter is active
  const isFiltered = !!roleFilter || !!statusFilter;
  const filteredRows = useMemo(() => {
    if (!isFiltered) return [];
    let items = allStaff?.items ?? [];
    if (dSearch) {
      const q = dSearch.toLowerCase();
      items = items.filter((s) =>
        s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter)   items = items.filter((s) => s.roles.includes(roleFilter));
    if (statusFilter) items = items.filter((s) =>
      statusFilter === 'active' ? s.isActive : !s.isActive,
    );
    return items;
  }, [isFiltered, allStaff, dSearch, roleFilter, statusFilter]);

  const rows     = isFiltered ? filteredRows : (data?.items ?? []);
  const rowCount = isFiltered ? filteredRows.length : (data?.total ?? 0);

  const columns: GridColDef<HrStaffDto>[] = [
    {
      field: 'fullName', headerName: 'Employee', flex: 1, minWidth: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ height: 1 }}>
          <Avatar sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.main', fontSize: 13, fontWeight: 700 }}>
            {getInitials(row.fullName)}
          </Avatar>
          <Stack minWidth={0}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'department', headerName: 'Department', width: 150,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">{row.department ?? '—'}</Typography>
      ),
    },
    {
      field: 'contractType', headerName: 'Contract', width: 130,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">{row.contractType ?? '—'}</Typography>
      ),
    },
    {
      field: 'joiningDate', headerName: 'Joined', width: 130,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">{fmtDate(row.joiningDate)}</Typography>
      ),
    },
    {
      field: 'roles', headerName: 'Role', width: 140,
      renderCell: ({ row }) => {
        const role = primaryRole(row.roles);
        return role
          ? <Chip label={getRoleLabel(role)} color={getRoleColor(role)} variant="soft" size="small" />
          : <Chip label="No role" variant="soft" size="small" />;
      },
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: ({ row }) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'neutral'}
          variant="soft"
          size="small"
        />
      ),
    },
    {
      field: '_actions', headerName: '', width: 52, sortable: false,
      renderCell: ({ row }) => (
        <Button variant="text" size="small" onClick={() => setSelected(row)} sx={{ minWidth: 0, p: 0.5 }}>
          <IconifyIcon icon="material-symbols:chevron-right-rounded" sx={{ fontSize: 22, color: 'text.secondary' }} />
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'primary.lighter', borderRadius: 2 }}>
            <IconifyIcon icon="material-symbols:badge-outline-rounded" sx={{ fontSize: 28, color: 'primary.main' }} />
          </Avatar>
          <Stack gap={0.5}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Staff Directory</Typography>
              {(data?.total ?? 0) > 0 && (
                <Chip label={data?.total} color="primary" variant="soft" size="small" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">View and manage employee profiles</Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* KPI summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: 'material-symbols:badge-outline-rounded',        label: 'Total Staff',  value: summary.total || (data?.total ?? '—'), color: 'primary'   },
          { icon: 'material-symbols:check-circle-outline-rounded', label: 'Active',       value: summary.total ? summary.active   : '—', color: 'success'   },
          { icon: 'material-symbols:cancel-outline-rounded',       label: 'Inactive',     value: summary.total ? summary.inactive : '—', color: 'neutral'   },
          { icon: 'material-symbols:corporate-fare-rounded',       label: 'Departments',  value: summary.depts || '—',                   color: 'secondary' },
        ].map((c) => (
          <Grid key={c.label} size={{ xs: 6, sm: 3 }}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      {/* Role distribution — clickable filter chips */}
      {Object.keys(summary.roleCounts).length > 0 && (
        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>By role:</Typography>
          {(STAFF_ROLES as readonly string[]).map((role) => {
            const count = summary.roleCounts[role];
            if (!count) return null;
            const active = roleFilter === role;
            return (
              <Chip
                key={role}
                label={`${getRoleLabel(role)} (${count})`}
                color={getRoleColor(role)}
                variant={active ? 'filled' : 'soft'}
                size="small"
                onClick={() => { setRoleFilter(active ? '' : role); setPage(0); }}
                sx={{ cursor: 'pointer' }}
              />
            );
          })}
        </Stack>
      )}

      {/* Filters + Table card */}
      <Paper>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
              <MenuItem value=""><em>All Roles</em></MenuItem>
              {STAFF_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <Chip label={getRoleLabel(r)} color={getRoleColor(r)} variant="soft" size="small" sx={{ pointerEvents: 'none' }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          {(isFiltered || dSearch) && (
            <Button
              variant="soft"
              color="neutral"
              size="small"
              onClick={() => { setRoleFilter(''); setStatusFilter(''); handleSearch(''); }}
              startIcon={<IconifyIcon icon="material-symbols:close-rounded" />}
            >
              Clear
            </Button>
          )}
        </Stack>

        {isLoading && !isFiltered ? (
          <Stack gap={1} sx={{ p: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}
          </Stack>
        ) : isFiltered ? (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            hideFooter={filteredRows.length <= 25}
            pageSizeOptions={[25]}
            onRowClick={(p) => setSelected(p.row)}
            sx={{ cursor: 'pointer', border: 0 }}
          />
        ) : (
          <DataGrid
            rows={data?.items ?? []}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={{ page, pageSize: 25 }}
            onPaginationModelChange={(m) => setPage(m.page)}
            pageSizeOptions={[25]}
            onRowClick={(p) => setSelected(p.row)}
            sx={{ cursor: 'pointer', border: 0 }}
          />
        )}
      </Paper>

      <ProfileDrawer employee={selected} onClose={() => setSelected(null)} onSaved={() => mutate()} />
    </Box>
  );
}
