'use client';

import { useCallback, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  ResidentDetailDto,
  ResidentListItemDto,
  ResidentProfileDataDto,
  OwnerProfileDataDto,
  ResidentUnitLinkDto,
  UpsertResidentProfilePayload,
  UpsertOwnerProfilePayload,
  UpdateTenancyPayload,
  CreateResidentPayload,
  useGetResidents,
  useSearchResidents,
  useGetResident,
  useCreateResident,
  useUpsertResidentProfile,
  useUpsertOwnerProfile,
  useUpdateTenancy,
} from 'services/swr/api-hooks/useResidentsApi';

// ── helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtCurrency(val: number | null | undefined) {
  if (val == null) return '—';
  return `KES ${val.toLocaleString()}`;
}

function typeColor(userType: string): 'secondary' | 'info' {
  return userType === 'HomeOwner' ? 'secondary' : 'info';
}

function typeLabel(userType: string) {
  return userType === 'HomeOwner' ? 'Owner' : 'Resident';
}

// ── Create dialog ─────────────────────────────────────────────────────────────

const EMPTY_CREATE: CreateResidentPayload = {
  firstName: '', middleName: null, lastName: '',
  email: '', phoneNumber: null, userType: 2, password: '',
};

function CreateResidentDialog({
  open, onClose, onSaved,
}: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<CreateResidentPayload>(EMPTY_CREATE);
  const [err, setErr]   = useState('');
  const { trigger, isMutating } = useCreateResident();

  const handleSave = async () => {
    if (!form.firstName.trim()) { setErr('First name is required.'); return; }
    if (!form.lastName.trim())  { setErr('Last name is required.'); return; }
    if (!form.email.trim())     { setErr('Email is required.'); return; }
    if (!form.password.trim())  { setErr('Password is required.'); return; }
    try {
      await trigger(form);
      onSaved();
      setForm(EMPTY_CREATE);
      setErr('');
      onClose();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Failed to create account.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add {form.userType === 1 ? 'Homeowner' : 'Tenant / Resident'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}

          <FormControl fullWidth size="small">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={form.userType}
              label="Account Type"
              onChange={e => setForm(f => ({ ...f, userType: Number(e.target.value) }))}
            >
              <MenuItem value={1}>Homeowner</MenuItem>
              <MenuItem value={2}>Tenant / Resident</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <TextField
              label="First Name *" fullWidth size="small"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            />
            <TextField
              label="Last Name *" fullWidth size="small"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Email *" fullWidth size="small" type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Phone" fullWidth size="small"
              value={form.phoneNumber ?? ''}
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value || null }))}
            />
          </Stack>

          <TextField
            label="Password *" fullWidth size="small" type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isMutating}>
          {isMutating ? <CircularProgress size={16} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Resident Profile form ─────────────────────────────────────────────────────

function ResidentProfileForm({
  residentId, data, onSaved,
}: { residentId: string; data: ResidentProfileDataDto | null; onSaved: () => void }) {
  const [form, setForm] = useState<UpsertResidentProfilePayload>({
    nationalId:              data?.nationalId ?? null,
    passportNumber:          data?.passportNumber ?? null,
    dateOfBirth:             data?.dateOfBirth ? data.dateOfBirth.split('T')[0] : null,
    gender:                  data?.gender ?? null,
    physicalAddress:         data?.physicalAddress ?? null,
    emergencyContactName:    data?.emergencyContactName ?? null,
    emergencyContactPhone:   data?.emergencyContactPhone ?? null,
    nextOfKinName:           data?.nextOfKinName ?? null,
    nextOfKinPhone:          data?.nextOfKinPhone ?? null,
    nextOfKinRelationship:   data?.nextOfKinRelationship ?? null,
  });
  const [err, setErr] = useState('');
  const { trigger, isMutating } = useUpsertResidentProfile(residentId);

  const handleSave = async () => {
    try {
      await trigger(form);
      setErr('');
      onSaved();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Save failed.');
    }
  };

  const f = form;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value || null }));

  return (
    <Stack spacing={2.5}>
      {err && <Typography color="error" variant="body2">{err}</Typography>}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Identity</Typography>
      <Stack direction="row" spacing={2}>
        <TextField label="National ID" fullWidth size="small" value={f.nationalId ?? ''} onChange={set('nationalId')} />
        <TextField label="Passport Number" fullWidth size="small" value={f.passportNumber ?? ''} onChange={set('passportNumber')} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Date of Birth" type="date" fullWidth size="small"
          value={f.dateOfBirth ?? ''}
          onChange={e => setForm(prev => ({ ...prev, dateOfBirth: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Gender</InputLabel>
          <Select value={f.gender ?? ''} label="Gender"
            onChange={e => setForm(prev => ({ ...prev, gender: e.target.value || null }))}>
            <MenuItem value=""><em>Not specified</em></MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Address</Typography>
      <TextField label="Physical Address" fullWidth size="small" multiline rows={2}
        value={f.physicalAddress ?? ''} onChange={set('physicalAddress')} />

      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Emergency Contact</Typography>
      <Stack direction="row" spacing={2}>
        <TextField label="Name" fullWidth size="small" value={f.emergencyContactName ?? ''} onChange={set('emergencyContactName')} />
        <TextField label="Phone" fullWidth size="small" value={f.emergencyContactPhone ?? ''} onChange={set('emergencyContactPhone')} />
      </Stack>

      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Next of Kin</Typography>
      <Stack direction="row" spacing={2}>
        <TextField label="Name" fullWidth size="small" value={f.nextOfKinName ?? ''} onChange={set('nextOfKinName')} />
        <TextField label="Phone" fullWidth size="small" value={f.nextOfKinPhone ?? ''} onChange={set('nextOfKinPhone')} />
      </Stack>
      <TextField label="Relationship" fullWidth size="small" value={f.nextOfKinRelationship ?? ''} onChange={set('nextOfKinRelationship')} />

      <Button variant="contained" onClick={handleSave} disabled={isMutating} sx={{ alignSelf: 'flex-end' }}>
        {isMutating ? <CircularProgress size={16} /> : 'Save Profile'}
      </Button>
    </Stack>
  );
}

// ── Owner Profile form ────────────────────────────────────────────────────────

function OwnerProfileForm({
  residentId, data, onSaved,
}: { residentId: string; data: OwnerProfileDataDto | null; onSaved: () => void }) {
  const [form, setForm] = useState<UpsertOwnerProfilePayload>({
    kraPin:               data?.kraPin ?? null,
    bankName:             data?.bankName ?? null,
    bankAccountNumber:    data?.bankAccountNumber ?? null,
    bankBranch:           data?.bankBranch ?? null,
    levyPaymentMethod:    data?.levyPaymentMethod ?? null,
    titleDeedRef:         data?.titleDeedRef ?? null,
    isAbsenteeOwner:      data?.isAbsenteeOwner ?? false,
    managingAgentName:    data?.managingAgentName ?? null,
    managingAgentContact: data?.managingAgentContact ?? null,
  });
  const [err, setErr] = useState('');
  const { trigger, isMutating } = useUpsertOwnerProfile(residentId);

  const handleSave = async () => {
    try {
      await trigger(form);
      setErr('');
      onSaved();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Save failed.');
    }
  };

  const f = form;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value || null }));

  return (
    <Stack spacing={2.5}>
      {err && <Typography color="error" variant="body2">{err}</Typography>}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Financial</Typography>
      <Stack direction="row" spacing={2}>
        <TextField label="KRA PIN" fullWidth size="small" value={f.kraPin ?? ''} onChange={set('kraPin')} />
        <TextField label="Levy Payment Method" fullWidth size="small" value={f.levyPaymentMethod ?? ''} onChange={set('levyPaymentMethod')} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Bank Name" fullWidth size="small" value={f.bankName ?? ''} onChange={set('bankName')} />
        <TextField label="Branch" fullWidth size="small" value={f.bankBranch ?? ''} onChange={set('bankBranch')} />
      </Stack>
      <TextField label="Account Number" fullWidth size="small" value={f.bankAccountNumber ?? ''} onChange={set('bankAccountNumber')} />

      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Property</Typography>
      <TextField label="Title Deed Reference" fullWidth size="small" value={f.titleDeedRef ?? ''} onChange={set('titleDeedRef')} />
      <FormControl fullWidth size="small">
        <InputLabel>Absentee Owner?</InputLabel>
        <Select
          value={f.isAbsenteeOwner ? 'yes' : 'no'}
          label="Absentee Owner?"
          onChange={e => setForm(prev => ({ ...prev, isAbsenteeOwner: e.target.value === 'yes' }))}
        >
          <MenuItem value="no">No — owner is on-site</MenuItem>
          <MenuItem value="yes">Yes — absentee / remote owner</MenuItem>
        </Select>
      </FormControl>

      {f.isAbsenteeOwner && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Managing Agent</Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="Agent Name" fullWidth size="small" value={f.managingAgentName ?? ''} onChange={set('managingAgentName')} />
            <TextField label="Contact" fullWidth size="small" value={f.managingAgentContact ?? ''} onChange={set('managingAgentContact')} />
          </Stack>
        </>
      )}

      <Button variant="contained" onClick={handleSave} disabled={isMutating} sx={{ alignSelf: 'flex-end' }}>
        {isMutating ? <CircularProgress size={16} /> : 'Save Owner Profile'}
      </Button>
    </Stack>
  );
}

// ── Tenancy form ──────────────────────────────────────────────────────────────

function TenancyForm({
  link, onSaved,
}: { link: ResidentUnitLinkDto; onSaved: () => void }) {
  const [form, setForm] = useState<UpdateTenancyPayload>({
    leaseStartDate:     link.leaseStartDate ? link.leaseStartDate.split('T')[0] : null,
    leaseEndDate:       link.leaseEndDate   ? link.leaseEndDate.split('T')[0]   : null,
    monthlyRent:        link.monthlyRent,
    depositAmount:      link.depositAmount,
    depositPaid:        link.depositPaid,
    employerName:       link.employerName,
    employerPhone:      link.employerPhone,
    guarantorName:      link.guarantorName,
    guarantorIdNumber:  link.guarantorIdNumber,
    guarantorPhone:     link.guarantorPhone,
    rentalAgreementRef: link.rentalAgreementRef,
  });
  const [err, setErr] = useState('');
  const { trigger, isMutating } = useUpdateTenancy(link.userUnitId);

  const handleSave = async () => {
    try {
      await trigger(form);
      setErr('');
      onSaved();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Save failed.');
    }
  };

  const f = form;
  const setStr = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value || null }));
  const setNum = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value ? Number(e.target.value) : null }));

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {err && <Typography color="error" variant="body2">{err}</Typography>}
      <Stack direction="row" spacing={2}>
        <TextField label="Lease Start" type="date" fullWidth size="small"
          value={f.leaseStartDate ?? ''}
          onChange={e => setForm(p => ({ ...p, leaseStartDate: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Lease End" type="date" fullWidth size="small"
          value={f.leaseEndDate ?? ''}
          onChange={e => setForm(p => ({ ...p, leaseEndDate: e.target.value || null }))}
          slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Monthly Rent (KES)" type="number" fullWidth size="small"
          value={f.monthlyRent ?? ''} onChange={setNum('monthlyRent')} />
        <TextField label="Deposit Amount (KES)" type="number" fullWidth size="small"
          value={f.depositAmount ?? ''} onChange={setNum('depositAmount')} />
      </Stack>
      <FormControl fullWidth size="small">
        <InputLabel>Deposit Paid?</InputLabel>
        <Select value={f.depositPaid == null ? 'unset' : f.depositPaid ? 'yes' : 'no'}
          label="Deposit Paid?"
          onChange={e => setForm(p => ({ ...p, depositPaid: e.target.value === 'unset' ? null : e.target.value === 'yes' }))}>
          <MenuItem value="unset"><em>Not set</em></MenuItem>
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" spacing={2}>
        <TextField label="Employer Name" fullWidth size="small" value={f.employerName ?? ''} onChange={setStr('employerName')} />
        <TextField label="Employer Phone" fullWidth size="small" value={f.employerPhone ?? ''} onChange={setStr('employerPhone')} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Guarantor Name" fullWidth size="small" value={f.guarantorName ?? ''} onChange={setStr('guarantorName')} />
        <TextField label="Guarantor ID" fullWidth size="small" value={f.guarantorIdNumber ?? ''} onChange={setStr('guarantorIdNumber')} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Guarantor Phone" fullWidth size="small" value={f.guarantorPhone ?? ''} onChange={setStr('guarantorPhone')} />
        <TextField label="Agreement Ref" fullWidth size="small" value={f.rentalAgreementRef ?? ''} onChange={setStr('rentalAgreementRef')} />
      </Stack>
      <Button variant="contained" onClick={handleSave} disabled={isMutating} sx={{ alignSelf: 'flex-end' }}>
        {isMutating ? <CircularProgress size={16} /> : 'Save Tenancy'}
      </Button>
    </Stack>
  );
}

// ── Side drawer ───────────────────────────────────────────────────────────────

function ResidentDrawer({
  residentId, open, onClose,
}: { residentId: string | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const { data, mutate, isLoading } = useGetResident(residentId);

  const reload = useCallback(() => { mutate(); }, [mutate]);

  const isOwner = data?.userType === 'HomeOwner';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onClose()}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, display: 'flex', flexDirection: 'column' } }}
    >
      <>{/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        {data && (
          <Avatar sx={{ bgcolor: isOwner ? 'secondary.lighter' : 'info.lighter',
            color: isOwner ? 'secondary.main' : 'info.main',
            fontWeight: 700, mr: 2 }}>
            {getInitials(`${data.firstName} ${data.lastName}`)}
          </Avatar>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <Typography variant="subtitle1">Loading…</Typography>
          ) : data ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {data.firstName} {data.middleName ? `${data.middleName} ` : ''}{data.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">{data.email}</Typography>
            </>
          ) : null}
        </Box>
        {data && (
          <Chip
            label={typeLabel(data.userType)}
            color={typeColor(data.userType)}
            variant="soft"
            size="small"
            sx={{ mr: 1 }}
          />
        )}
        <IconButton size="small" onClick={onClose}>
          <IconifyIcon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tab label="Profile" />
        {isOwner && <Tab label="Owner" />}
        <Tab label="Units" />
        <Tab label="Vehicles" />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {isLoading && (
          <Stack sx={{ alignItems: 'center', pt: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {data && tab === 0 && (
          <ResidentProfileForm residentId={data.id} data={data.residentProfile} onSaved={reload} />
        )}

        {data && isOwner && tab === 1 && (
          <OwnerProfileForm residentId={data.id} data={data.ownerProfile} onSaved={reload} />
        )}

        {data && tab === (isOwner ? 2 : 1) && (
          <Stack spacing={2}>
            {data.units.length === 0 && (
              <Typography variant="body2" color="text.secondary">No unit links yet.</Typography>
            )}
            {data.units.map((link) => (
              <Paper key={link.userUnitId} sx={{ p: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', mb: 1, gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {link.block ? `${link.block} · ` : ''}{link.unitNumber}
                  </Typography>
                  <Chip label={link.linkType} color={link.linkType === 'Owner' ? 'secondary' : 'info'} variant="soft" size="small" />
                  {link.moveOutDate && <Chip label="Moved out" color="neutral" variant="soft" size="small" />}
                </Stack>
                <Stack direction="row" spacing={3} sx={{ mb: link.linkType === 'Occupant' && !link.moveOutDate ? 1.5 : 0 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Move in</Typography>
                    <Typography variant="body2">{fmtDate(link.moveInDate)}</Typography>
                  </Box>
                  {link.moveOutDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Move out</Typography>
                      <Typography variant="body2">{fmtDate(link.moveOutDate)}</Typography>
                    </Box>
                  )}
                  {link.monthlyRent && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Monthly rent</Typography>
                      <Typography variant="body2">{fmtCurrency(link.monthlyRent)}</Typography>
                    </Box>
                  )}
                </Stack>
                {link.linkType === 'Occupant' && !link.moveOutDate && (
                  <TenancyForm link={link} onSaved={reload} />
                )}
              </Paper>
            ))}
          </Stack>
        )}

        {data && tab === (isOwner ? 3 : 2) && (
          <Stack spacing={1.5}>
            {data.vehicles.length === 0 && (
              <Typography variant="body2" color="text.secondary">No registered vehicles.</Typography>
            )}
            {data.vehicles.map((v) => (
              <Paper key={v.id} sx={{ p: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: 'primary.lighter', borderRadius: 2 }}>
                    <IconifyIcon icon="material-symbols:directions-car-outline-rounded" sx={{ color: 'primary.main' }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {v.plate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {v.make} {v.model} · {v.colour} · {v.vehicleType}
                    </Typography>
                  </Box>
                  {v.tagNumber && (
                    <Chip
                      label={v.tagNumber}
                      color={
                        v.tagStatus === 'Active'    ? 'success' :
                        v.tagStatus === 'Suspended' ? 'warning' :
                        v.tagStatus === 'Revoked'   ? 'error'   : 'neutral'
                      }
                      variant="soft"
                      size="small"
                    />
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
      </>
    </Drawer>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const columns: GridColDef<ResidentListItemDto>[] = [
  {
    field: 'fullName',
    headerName: 'Name',
    flex: 1.5,
    minWidth: 160,
    renderCell: ({ row }) => (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, height: 1 }}>
        <Avatar sx={{
          width: 32, height: 32, fontSize: 12, fontWeight: 700,
          bgcolor: row.userType === 'HomeOwner' ? 'secondary.lighter' : 'info.lighter',
          color: row.userType === 'HomeOwner' ? 'secondary.main' : 'info.main',
        }}>
          {getInitials(row.fullName)}
        </Avatar>
        <Box>
          <Typography variant="subtitle2">{row.fullName}</Typography>
          {row.nationalId && (
            <Typography variant="caption" color="text.secondary">ID: {row.nationalId}</Typography>
          )}
        </Box>
      </Stack>
    ),
  },
  {
    field: 'userType',
    headerName: 'Type',
    width: 110,
    renderCell: ({ value }) => (
      <Chip label={typeLabel(value)} color={typeColor(value)} variant="soft" size="small" />
    ),
  },
  {
    field: 'phoneNumber',
    headerName: 'Phone',
    width: 140,
    valueFormatter: (v) => v ?? '—',
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'units',
    headerName: 'Unit(s)',
    width: 130,
    renderCell: (params) => {
      const value = params.value as string[];
      return value.length === 0 ? (
        <Typography variant="caption" color="text.secondary">Unassigned</Typography>
      ) : (
        <Typography variant="subtitle2">{value.join(', ')}</Typography>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Joined',
    width: 120,
    valueFormatter: (v) => fmtDate(v),
  },
];

export default function ResidentsPage() {
  const [search,      setSearch]      = useState('');
  const [dSearch,     setDSearch]     = useState('');
  const [page,        setPage]        = useState(1);
  const [createOpen,  setCreateOpen]  = useState(false);
  const [createType,  setCreateType]  = useState<1 | 2>(2);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const debounce = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((debounce as any)._t);
    (debounce as any)._t = setTimeout(() => setDSearch(val), 350);
  }, []);

  const { data: listData,   mutate: mutateList,   isLoading: listLoading }   = useGetResidents(page);
  const { data: searchData, mutate: mutateSearch, isLoading: searchLoading } = useSearchResidents(dSearch);

  const rows    = dSearch ? (searchData ?? []) : (listData?.items ?? []);
  const total   = dSearch ? rows.length        : (listData?.total ?? 0);
  const loading = dSearch ? searchLoading      : listLoading;

  const reload = () => { mutateList(); mutateSearch(); };

  const handleRowClick = (params: any) => {
    setSelectedId(params.row.id);
    setDrawerOpen(true);
  };

  const openCreate = (type: 1 | 2) => {
    setCreateType(type);
    setCreateOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Residents</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage homeowners and tenants — profiles, units and vehicles
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="soft"
            color="secondary"
            startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
            onClick={() => openCreate(1)}
          >
            Add Homeowner
          </Button>
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
            onClick={() => openCreate(2)}
          >
            Add Tenant
          </Button>
        </Stack>
      </Stack>

      {/* Search + table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth size="small"
            placeholder="Search by name, phone or National ID…"
            value={search}
            onChange={e => debounce(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="material-symbols:search-rounded" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear">
                      <IconButton size="small" onClick={() => { setSearch(''); setDSearch(''); }}>
                        <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={total}
          paginationMode={dSearch ? 'client' : 'server'}
          paginationModel={{ page: page - 1, pageSize: 50 }}
          onPaginationModelChange={({ page: p }) => setPage(p + 1)}
          onRowClick={handleRowClick}
          sx={{ border: 0, cursor: 'pointer' }}
          autoHeight
          pageSizeOptions={[50]}
        />
      </Paper>

      <CreateResidentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={reload}
      />

      <ResidentDrawer
        residentId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  );
}
