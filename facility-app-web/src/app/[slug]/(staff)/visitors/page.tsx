'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { useGetDashboard } from 'services/swr/api-hooks/useDashboardApi';
import {
  VisitDto,
  useCancelVisit,
  useCheckIn,
  useCheckOut,
  useGetHosts,
  useGetVisits,
  useNoShow,
  usePreRegister,
  useWalkIn,
} from 'services/swr/api-hooks/useVisitorsApi';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS = {
  0: { label: 'Scheduled',   color: 'warning' },
  1: { label: 'Checked In',  color: 'success' },
  2: { label: 'Checked Out', color: 'neutral' },
  3: { label: 'Cancelled',   color: 'error'   },
  4: { label: 'No Show',     color: 'neutral' },
} as const;

function statusInfo(s: number) {
  return STATUS[s as keyof typeof STATUS] ?? { label: 'Unknown', color: 'neutral' as const };
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── KPI cards ─────────────────────────────────────────────────────────────────

const KPI_ITEMS = [
  { key: 'todayVisits',         label: 'Visits Today',     icon: 'material-symbols:groups-outline-rounded',          color: 'primary' },
  { key: 'activeVisits',        label: 'Currently Inside', icon: 'material-symbols:door-open-outline-rounded',       color: 'success' },
  { key: 'pendingParcels',      label: 'Pending Parcels',  icon: 'material-symbols:package-2-outline-rounded',       color: 'warning' },
  { key: 'openMaintenance',     label: 'Open Maintenance', icon: 'material-symbols:build-outline-rounded',           color: 'error'   },
  { key: 'totalUnits',          label: 'Total Units',      icon: 'material-symbols:apartment-outline-rounded',       color: 'neutral' },
  { key: 'occupiedUnits',       label: 'Occupied Units',   icon: 'material-symbols:home-outline-rounded',            color: 'info'    },
  { key: 'openIncidents',       label: 'Open Incidents',   icon: 'material-symbols:warning-outline-rounded',         color: 'error'   },
  { key: 'pendingUnitRequests', label: 'Unit Requests',    icon: 'material-symbols:pending-actions-outline-rounded', color: 'warning' },
] as const;

// ── Host picker (shared) ──────────────────────────────────────────────────────

const HostSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const { data: hosts } = useGetHosts();
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Host (optional)</InputLabel>
      <Select value={value} label="Host (optional)" onChange={(e) => onChange(e.target.value)}>
        <MenuItem value=""><em>No host</em></MenuItem>
        {hosts?.map((h) => <MenuItem key={h.id} value={h.id}>{h.fullName}</MenuItem>)}
      </Select>
    </FormControl>
  );
};

// ── Walk-in dialog ────────────────────────────────────────────────────────────

const WalkInDialog = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const { trigger, isMutating } = useWalkIn();
  const [fullName, setFullName] = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [company,  setCompany]  = useState('');
  const [purpose,  setPurpose]  = useState('');
  const [hostId,   setHostId]   = useState('');
  const [notes,    setNotes]    = useState('');
  const [error,    setError]    = useState<string | null>(null);

  const reset = () => { setFullName(''); setPhone(''); setEmail(''); setCompany(''); setPurpose(''); setHostId(''); setNotes(''); setError(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError(null);
    try {
      await trigger({ fullName, phone, email: email || '', company: company || null, purpose, hostUserId: hostId || null, notes: notes || null });
      reset(); onSuccess();
    } catch (err: any) { setError(err?.data?.error ?? 'Failed to log walk-in.'); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Walk-in Visitor</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} /></Grid>
            <Grid size={12}><TextField fullWidth label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Meeting, Delivery" /></Grid>
            <Grid size={12}><HostSelect value={hostId} onChange={setHostId} /></Grid>
            <Grid size={12}><TextField fullWidth label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} /></Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="text" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" loading={isMutating} disabled={!fullName.trim() || !phone.trim() || !purpose.trim()} onClick={handleSubmit}>
          Log Walk-in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Pre-register dialog ───────────────────────────────────────────────────────

const PreRegisterDialog = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const { trigger, isMutating } = usePreRegister();
  const defaultScheduled = () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); return d.toISOString().slice(0, 16); };

  const [fullName,  setFullName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [company,   setCompany]   = useState('');
  const [purpose,   setPurpose]   = useState('');
  const [hostId,    setHostId]    = useState('');
  const [scheduled, setScheduled] = useState(defaultScheduled);
  const [notes,     setNotes]     = useState('');
  const [error,     setError]     = useState<string | null>(null);

  const reset = () => { setFullName(''); setPhone(''); setEmail(''); setCompany(''); setPurpose(''); setHostId(''); setScheduled(defaultScheduled()); setNotes(''); setError(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError(null);
    try {
      await trigger({ fullName, phone, email: email || '', company: company || null, purpose, hostUserId: hostId || null, notes: notes || null, scheduledAt: new Date(scheduled).toISOString() });
      reset(); onSuccess();
    } catch (err: any) { setError(err?.data?.error ?? 'Failed to pre-register visit.'); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Pre-register Visit</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} /></Grid>
            <Grid size={12}><TextField fullWidth label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Meeting, Interview" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><HostSelect value={hostId} onChange={setHostId} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Scheduled Date & Time" type="datetime-local" value={scheduled}
                onChange={(e) => setScheduled(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={12}><TextField fullWidth label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} /></Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="text" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" loading={isMutating} disabled={!fullName.trim() || !phone.trim() || !purpose.trim() || !scheduled} onClick={handleSubmit}>
          Pre-register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Visit detail drawer ───────────────────────────────────────────────────────

const VisitDrawer = ({ visit, onClose, onRefresh }: { visit: VisitDto | null; onClose: () => void; onRefresh: () => void }) => {
  const { trigger: checkIn,  isMutating: checkingIn   } = useCheckIn();
  const { trigger: checkOut, isMutating: checkingOut  } = useCheckOut();
  const { trigger: cancel,   isMutating: cancelling   } = useCancelVisit();
  const { trigger: noShow,   isMutating: markingNoShow } = useNoShow();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { if (visit) setActionError(null); }, [visit]);

  const doAction = async (fn: () => Promise<any>) => {
    setActionError(null);
    try { await fn(); onRefresh(); onClose(); }
    catch (err: any) { setActionError(err?.data?.error ?? 'Action failed.'); }
  };

  if (!visit) return null;
  const st = statusInfo(visit.status);
  const displayTime = visit.checkedInAt ? `Checked in ${fmtDateTime(visit.checkedInAt)}` : `Scheduled ${fmtDateTime(visit.scheduledAt)}`;

  return (
    <Drawer anchor="right" open={!!visit} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 4 } }}>
      <Stack sx={{ height: 1 }}>
        {/* Header */}
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 700, fontSize: 20 }}>
            {getInitials(visit.visitor.fullName)}
          </Avatar>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineClamp: 1 }}>{visit.visitor.fullName}</Typography>
            {visit.visitor.company && <Typography variant="body2" color="text.secondary">{visit.visitor.company}</Typography>}
            <Chip label={st.label} color={st.color} variant="soft" size="small" sx={{ alignSelf: 'flex-start', mt: 0.5 }} />
          </Stack>
          <Button variant="text" size="small" onClick={onClose} sx={{ flexShrink: 0, minWidth: 0 }}>
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Contact */}
        <Stack sx={{ gap: 1.5, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Contact</Typography>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <IconifyIcon icon="material-symbols:call-outline-rounded" sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{visit.visitor.phone}</Typography>
          </Stack>
          {visit.visitor.email && (
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <IconifyIcon icon="material-symbols:mail-outline-rounded" sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">{visit.visitor.email}</Typography>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Details */}
        <Stack sx={{ gap: 1.5, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Visit Details</Typography>
          {([
            ['Purpose',     visit.purpose],
            ['Time',        displayTime],
            visit.checkedOutAt ? ['Checked out', fmtTime(visit.checkedOutAt)] : null,
            visit.host           ? ['Host',       visit.host.fullName]         : null,
            visit.entryEntrance  ? ['Entry gate', visit.entryEntrance.name]    : null,
            visit.notes          ? ['Notes',      visit.notes]                 : null,
          ] as ([string, string] | null)[]).filter(Boolean).map(([label, value]) => (
            <Stack key={label} direction="row" sx={{ gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, flexShrink: 0 }}>{label}</Typography>
              <Typography variant="body2">{value}</Typography>
            </Stack>
          ))}
        </Stack>

        {/* Actions */}
        {actionError && <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2 }}>{actionError}</Alert>}

        {visit.status === 0 && (
          <Stack sx={{ gap: 1.5 }}>
            <Button variant="contained" color="success" loading={checkingIn}
              startIcon={<IconifyIcon icon="material-symbols:how-to-reg-outline-rounded" />}
              onClick={() => doAction(() => checkIn(visit.id))}>
              Check In
            </Button>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button fullWidth variant="outlined" color="error" size="small" loading={cancelling}
                onClick={() => doAction(() => cancel(visit.id))}>Cancel</Button>
              <Button fullWidth variant="outlined" size="small" loading={markingNoShow}
                onClick={() => doAction(() => noShow(visit.id))}>No Show</Button>
            </Stack>
          </Stack>
        )}

        {visit.status === 1 && (
          <Button variant="contained" loading={checkingOut}
            startIcon={<IconifyIcon icon="material-symbols:logout-rounded" />}
            onClick={() => doAction(() => checkOut(visit.id))}>
            Check Out
          </Button>
        )}

        <Box sx={{ mt: 'auto', pt: 3 }}>
          <Typography variant="caption" color="text.secondary">Created {fmtDateTime(visit.createdAt)}</Typography>
        </Box>
      </Stack>
    </Drawer>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { value: 'today',    label: 'Today'    },
  { value: 'active',   label: 'Active'   },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'history',  label: 'History'  },
  { value: 'all',      label: 'All'      },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VisitorsPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboard();

  const [tab,        setTab]        = useState('today');
  const [search,     setSearch]     = useState('');
  const [debSearch,  setDebSearch]  = useState('');
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [walkInOpen,  setWalkInOpen]  = useState(false);
  const [preRegOpen,  setPreRegOpen]  = useState(false);
  const [drawerVisit, setDrawerVisit] = useState<VisitDto | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPagination((p) => ({ ...p, page: 0 })); }, [tab, debSearch]);

  const { data, isLoading, mutate } = useGetVisits(tab, debSearch, pagination.page + 1);

  const columns: GridColDef<VisitDto>[] = [
    {
      field: 'visitor', headerName: 'Visitor', flex: 1, minWidth: 180,
      renderCell: (params) => (
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', height: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.lighter', color: 'primary.main', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(params.row.visitor.fullName)}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>{params.row.visitor.fullName}</Typography>
            {params.row.visitor.company && <Typography variant="caption" color="text.secondary" sx={{ lineClamp: 1 }}>{params.row.visitor.company}</Typography>}
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'purpose', headerName: 'Purpose', flex: 1, minWidth: 120,
      renderCell: (params) => <Typography variant="subtitle2" color="text.secondary" sx={{ lineClamp: 1 }}>{params.row.purpose}</Typography>,
    },
    {
      field: 'host', headerName: 'Host', width: 150,
      renderCell: (params) => <Typography variant="subtitle2" color="text.secondary">{params.row.host?.fullName ?? '—'}</Typography>,
    },
    {
      field: 'scheduledAt', headerName: 'Time', width: 155,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {fmtDateTime(params.row.checkedInAt ?? params.row.scheduledAt)}
        </Typography>
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 130,
      renderCell: (params) => { const st = statusInfo(params.row.status); return <Chip label={st.label} color={st.color} variant="soft" size="small" />; },
    },
  ];

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 5, gap: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Visitors</Typography>
          <Typography variant="body2" color="text.secondary">Live overview and visitor management</Typography>
        </Stack>
        <Stack direction="row" sx={{ gap: 1.5 }}>
          <Button variant="outlined" startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />} onClick={() => setPreRegOpen(true)}>
            Pre-register
          </Button>
          <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:how-to-reg-outline-rounded" />} onClick={() => setWalkInOpen(true)}>
            Walk In
          </Button>
        </Stack>
      </Stack>

      {/* KPI cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPI_ITEMS.map(({ key, label, icon, color }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
            <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>{label}</Typography>
              <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: `${color}.lighter`, borderRadius: 2, mb: 1 }}>
                <IconifyIcon icon={icon} sx={{ fontSize: 28, color: `${color}.main` }} />
              </Avatar>
              {statsLoading ? <Skeleton variant="text" width={64} height={44} /> : (
                <Typography variant="h4" sx={{ fontWeight: 500 }}>{(stats as any)?.[key] ?? 0}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Visit list */}
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 0 }}>
            {TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} sx={{ minHeight: 40, textTransform: 'none', fontWeight: 600 }} />
            ))}
          </Tabs>
          <TextField
            size="small" placeholder="Search visitor, purpose…" value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 240 } }}
            slotProps={{ input: { startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ) } }}
          />
        </Stack>

        {isLoading ? (
          <Stack sx={{ gap: 1 }}>{[1,2,3,4,5].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
        ) : (
          <DataGrid
            rows={data?.items ?? []} columns={columns} getRowId={(row) => row.id}
            rowCount={data?.total ?? 0} paginationMode="server"
            paginationModel={pagination} onPaginationModelChange={setPagination}
            pageSizeOptions={[25]} autoHeight
            onRowClick={(params) => setDrawerVisit(params.row)}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Paper>

      <WalkInDialog   open={walkInOpen}  onClose={() => setWalkInOpen(false)}  onSuccess={() => { setWalkInOpen(false);  mutate(); }} />
      <PreRegisterDialog open={preRegOpen} onClose={() => setPreRegOpen(false)} onSuccess={() => { setPreRegOpen(false); mutate(); }} />
      <VisitDrawer visit={drawerVisit} onClose={() => setDrawerVisit(null)} onRefresh={() => mutate()} />
    </Box>
  );
}
