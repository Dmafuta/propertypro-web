'use client';

import { useCallback, useMemo, useState } from 'react';
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
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  HrStaffDto,
  UpsertProfilePayload,
  useGetHrStaff,
  useUpsertProfile,
} from 'services/swr/api-hooks/useHrApi';

// ── helpers ───────────────────────────────────────────────────────────────────

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
  if (!iso) return '';
  return iso.substring(0, 10);
}

// ── Profile drawer ────────────────────────────────────────────────────────────

interface ProfileDrawerProps {
  employee: HrStaffDto | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProfileDrawer = ({ employee, onClose, onSaved }: ProfileDrawerProps) => {
  const { trigger: upsert, isMutating: saving } = useUpsertProfile(employee?.id ?? '');

  const [editing, setEditing] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // form state — mirrors UpsertProfilePayload
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
    setError(null);
    setSuccess(false);
    setEditing(true);
  };

  const handleClose = () => {
    setEditing(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSave = async () => {
    setError(null);
    try {
      // convert empty strings to null
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]),
      ) as UpsertProfilePayload;
      await upsert(payload);
      setSuccess(true);
      setEditing(false);
      onSaved();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save profile.');
    }
  };

  const set = useCallback(
    (key: keyof UpsertProfilePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value || null })),
    [],
  );

  const role   = employee ? primaryRole(employee.roles) : null;
  const p      = employee?.profile;

  return (
    <Drawer
      anchor="right"
      open={!!employee}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' } }}
    >
      {employee && (
        <>
          {/* ── header ── */}
          <Stack sx={{ p: 4, gap: 2 }}>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
              <Avatar
                sx={{
                  width: 56, height: 56,
                  bgcolor: 'primary.lighter', color: 'primary.main',
                  fontWeight: 700, fontSize: 20, flexShrink: 0,
                }}
              >
                {getInitials(employee.fullName)}
              </Avatar>

              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {employee.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.email}
                </Typography>
                {employee.phoneNumber && (
                  <Typography variant="caption" color="text.secondary">
                    {employee.phoneNumber}
                  </Typography>
                )}
              </Stack>

              <Button variant="text" size="small" onClick={handleClose} sx={{ flexShrink: 0, minWidth: 0 }}>
                <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
              </Button>
            </Stack>

            {/* chips */}
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {role && (
                <Chip label={getRoleLabel(role)} color={getRoleColor(role)} variant="soft" size="small" />
              )}
              <Chip
                label={employee.isActive ? 'Active' : 'Inactive'}
                color={employee.isActive ? 'success' : 'neutral'}
                variant="soft"
                size="small"
              />
              {employee.department && (
                <Chip label={employee.department} variant="soft" size="small" />
              )}
            </Stack>
          </Stack>

          <Divider />

          {/* ── body ── */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
            {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>Profile saved.</Alert>}

            {editing ? (
              <EditForm form={form} set={set} setForm={setForm} />
            ) : (
              <ReadView employee={employee} />
            )}
          </Box>

          <Divider />

          {/* ── footer ── */}
          <Stack direction="row" sx={{ p: 3, gap: 1.5, justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <Button variant="text" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="contained" loading={saving} onClick={handleSave}>
                  Save Profile
                </Button>
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

// ── Read view ─────────────────────────────────────────────────────────────────

const ReadView = ({ employee }: { employee: HrStaffDto }) => {
  const p = employee.profile;

  const row = (label: string, value: string | null | undefined) => (
    <Stack direction="row" sx={{ gap: 1, py: 1.5 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
        {value || '—'}
      </Typography>
    </Stack>
  );

  return (
    <Stack sx={{ gap: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Employment
      </Typography>
      {row('Department',     p?.department   ?? employee.department)}
      {row('Contract Type',  p?.contractType ?? employee.contractType)}
      {row('Joining Date',   fmtDate(p?.joiningDate ?? employee.joiningDate))}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Personal
      </Typography>
      {row('Middle Name',    p?.middleName)}
      {row('National ID',    p?.nationalId)}
      {row('Passport No.',   p?.passportNumber)}
      {row('Date of Birth',  fmtDate(p?.dateOfBirth))}
      {row('Gender',         p?.gender)}
      {row('Address',        p?.address)}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Emergency Contact
      </Typography>
      {row('Name',  p?.emergencyContactName)}
      {row('Phone', p?.emergencyContactPhone)}
    </Stack>
  );
};

// ── Edit form ─────────────────────────────────────────────────────────────────

interface EditFormProps {
  form: UpsertProfilePayload;
  set: (key: keyof UpsertProfilePayload) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<UpsertProfilePayload>>;
}

const GENDERS  = ['Male', 'Female', 'Other', 'Prefer not to say'];
const CONTRACTS = ['Permanent', 'Contract', 'Part-time', 'Intern', 'Consultant'];

const EditForm = ({ form, set, setForm }: EditFormProps) => (
  <Stack sx={{ gap: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      Employment
    </Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          fullWidth size="small" label="Department"
          value={form.department ?? ''}
          onChange={set('department')}
        />
      </Grid>
      <Grid size={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Contract Type</InputLabel>
          <Select
            value={form.contractType ?? ''}
            label="Contract Type"
            onChange={(e) => setForm((f) => ({ ...f, contractType: e.target.value || null }))}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {CONTRACTS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={6}>
        <TextField
          fullWidth size="small" label="Joining Date" type="date"
          value={toDateInput(form.joiningDate)}
          onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
    </Grid>

    <Divider />

    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      Personal
    </Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          fullWidth size="small" label="Middle Name"
          value={form.middleName ?? ''}
          onChange={set('middleName')}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          fullWidth size="small" label="National ID"
          value={form.nationalId ?? ''}
          onChange={set('nationalId')}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          fullWidth size="small" label="Passport No."
          value={form.passportNumber ?? ''}
          onChange={set('passportNumber')}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          fullWidth size="small" label="Date of Birth" type="date"
          value={toDateInput(form.dateOfBirth)}
          onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid>
      <Grid size={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={form.gender ?? ''}
            label="Gender"
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value || null }))}
          >
            <MenuItem value=""><em>Prefer not to say</em></MenuItem>
            {GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth size="small" label="Address" multiline rows={2}
          value={form.address ?? ''}
          onChange={set('address')}
        />
      </Grid>
    </Grid>

    <Divider />

    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      Emergency Contact
    </Typography>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          fullWidth size="small" label="Contact Name"
          value={form.emergencyContactName ?? ''}
          onChange={set('emergencyContactName')}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth size="small" label="Contact Phone"
          value={form.emergencyContactPhone ?? ''}
          onChange={set('emergencyContactPhone')}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">+</InputAdornment> } }}
        />
      </Grid>
    </Grid>
  </Stack>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HrStaffPage() {
  const [search,  setSearch]  = useState('');
  const [dSearch, setDSearch] = useState('');
  const [page,    setPage]    = useState(0);
  const [pageSize]            = useState(25);

  const [selected, setSelected] = useState<HrStaffDto | null>(null);

  // debounce search
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => { setDSearch(val); setPage(0); }, 400);
  }, []);

  const { data, isLoading, mutate } = useGetHrStaff(dSearch, page + 1);

  const paginationModel = useMemo<GridPaginationModel>(
    () => ({ page, pageSize }),
    [page, pageSize],
  );

  const columns: GridColDef<HrStaffDto>[] = [
    {
      field: 'fullName',
      headerName: 'Employee',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', height: 1 }}>
          <Avatar
            sx={{
              width: 32, height: 32, flexShrink: 0,
              bgcolor: 'primary.lighter', color: 'primary.main',
              fontSize: 13, fontWeight: 700,
            }}
          >
            {getInitials(params.row.fullName)}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>
              {params.row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineClamp: 1 }}>
              {params.row.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {params.row.department ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'contractType',
      headerName: 'Contract',
      width: 130,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {params.row.contractType ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'joiningDate',
      headerName: 'Joined',
      width: 130,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {fmtDate(params.row.joiningDate)}
        </Typography>
      ),
    },
    {
      field: 'roles',
      headerName: 'Role',
      width: 140,
      renderCell: (params) => {
        const role = primaryRole(params.row.roles);
        return role
          ? <Chip label={getRoleLabel(role)} color={getRoleColor(role)} variant="soft" size="small" />
          : <Chip label="No role" variant="soft" size="small" />;
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          color={params.row.isActive ? 'success' : 'neutral'}
          variant="soft"
          size="small"
        />
      ),
    },
    {
      field: '_actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="text"
          size="small"
          onClick={() => setSelected(params.row)}
          sx={{ minWidth: 0, p: 0.5 }}
        >
          <IconifyIcon
            icon="material-symbols:chevron-right-rounded"
            sx={{ fontSize: 22, color: 'text.secondary' }}
          />
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 4, gap: 2, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Staff Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage employee profiles
          </Typography>
        </Stack>

        <TextField
          size="small"
          placeholder="Search staff…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 260 } }}
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
      </Stack>

      {/* table */}
      <Paper sx={{ p: 0 }}>
        {isLoading || data === undefined ? (
          <Stack sx={{ gap: 1, p: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}
          </Stack>
        ) : (
          <DataGrid
            rows={data.items}
            columns={columns}
            getRowId={(row) => row.id}
            autoHeight
            paginationMode="server"
            rowCount={data.total}
            paginationModel={paginationModel}
            onPaginationModelChange={(m) => setPage(m.page)}
            onRowClick={(params) => setSelected(params.row)}
            sx={{ cursor: 'pointer', border: 0 }}
          />
        )}
      </Paper>

      {/* employee profile drawer */}
      <ProfileDrawer
        employee={selected}
        onClose={() => setSelected(null)}
        onSaved={() => mutate()}
      />
    </Box>
  );
}
