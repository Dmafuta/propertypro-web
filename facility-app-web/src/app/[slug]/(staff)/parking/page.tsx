'use client';

import { useRef, useState } from 'react';
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
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
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
  useGetVehicles, useGetActiveParking, useGetParkingHistory, useGetSticker,
  useRegisterVehicle, useDeleteVehicle, useIssueTag, useUpdateTagStatus,
  useLogEntryByTag, useLogVisitorEntry, useLogExit,
  VEHICLE_TYPES, OWNER_CATEGORIES, TAG_STATUSES,
  type VehicleDto, type ParkingRecordDto,
} from 'services/swr/api-hooks/useParkingApi';

// ── helpers ──────────────────────────────────────────────────────────────────

const today     = new Date();
const thirtyAgo = new Date(today);
thirtyAgo.setDate(today.getDate() - 30);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  Car:        'material-symbols:directions-car-outline-rounded',
  Motorcycle: 'material-symbols:two-wheeler-rounded',
  Truck:      'material-symbols:local-shipping-outline-rounded',
  Van:        'material-symbols:airport-shuttle-outline-rounded',
  Other:      'material-symbols:directions-car-outline-rounded',
};

function tagColor(status: string | null): 'success' | 'warning' | 'error' | 'neutral' {
  if (!status) return 'neutral';
  return TAG_STATUSES[status] ?? 'neutral';
}

// ── sticker print ─────────────────────────────────────────────────────────────

function StickerPrint({ vehicleId, tenantName }: { vehicleId: string; tenantName: string }) {
  const { data: sticker, isLoading } = useGetSticker(vehicleId);

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  if (!sticker) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="error">No tag issued for this vehicle.</Typography>
    </Box>
  );

  const qrData = JSON.stringify({ tag: sticker.tagNumber, plate: sticker.plate });
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return (
    <Box>
      {/* Printable sticker */}
      <Box
        id="vehicle-sticker"
        sx={{
          width: 320,
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
          mx: 'auto',
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
          {tenantName}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="Vehicle QR" width={160} height={160} style={{ display: 'block', margin: '0 auto 8px' }} />
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 3, mb: 0.5 }}>
          {sticker.tagNumber}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {sticker.plate}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {sticker.make} {sticker.model} · {sticker.colour}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {sticker.vehicleType} · {sticker.ownerCategory}
        </Typography>
        {sticker.expiresAt && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            Expires: {new Date(sticker.expiresAt).toLocaleDateString()}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          Issued: {new Date(sticker.issuedAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:print-rounded" />}
          onClick={() => {
            const el = document.getElementById('vehicle-sticker');
            if (!el) return;
            const win = window.open('', '_blank')!;
            win.document.write(`
              <html><head><title>Vehicle Sticker</title>
              <style>body{margin:0;font-family:sans-serif;display:flex;justify-content:center;padding:16px}</style>
              </head><body>${el.outerHTML}</body></html>`);
            win.document.close();
            win.print();
          }}
        >
          Print Sticker
        </Button>
      </Stack>
    </Box>
  );
}

// ── Register vehicle dialog ───────────────────────────────────────────────────

const EMPTY_VEHICLE = { ownerId: '', ownerName: '', ownerCategory: 0, plate: '', make: '', model: '', colour: '', type: 0, notes: '' };

function RegisterVehicleDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_VEHICLE);
  const [err, setErr]   = useState('');
  const { trigger, isMutating } = useRegisterVehicle();

  const needsLinkedUser = form.ownerCategory === 0 || form.ownerCategory === 1; // Resident / Staff

  const handleSave = async () => {
    if (!form.plate.trim()) { setErr('Plate number is required.'); return; }
    if (needsLinkedUser && !form.ownerId.trim()) { setErr('User ID is required for Resident/Staff.'); return; }
    if (!needsLinkedUser && !form.ownerName.trim()) { setErr('Owner name is required.'); return; }
    try {
      await trigger({
        ownerId:       needsLinkedUser ? form.ownerId.trim() : null,
        ownerName:     needsLinkedUser ? null : form.ownerName.trim(),
        ownerCategory: form.ownerCategory,
        plate: form.plate.trim(), make: form.make.trim(), model: form.model.trim(),
        colour: form.colour.trim(), type: form.type, notes: form.notes.trim() || null,
      });
      onSaved();
      setForm(EMPTY_VEHICLE);
      setErr('');
      onClose();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Failed to register vehicle.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register Vehicle</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}

          <FormControl fullWidth size="small">
            <InputLabel>Owner Category</InputLabel>
            <Select value={form.ownerCategory} label="Owner Category"
              onChange={e => setForm(f => ({ ...f, ownerCategory: Number(e.target.value) }))}>
              {OWNER_CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>

          {needsLinkedUser ? (
            <TextField label="User ID (from Users list) *" fullWidth size="small" value={form.ownerId}
              onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
              helperText="Copy the user's ID from the Users management page" />
          ) : (
            <TextField label="Owner Name *" fullWidth size="small" value={form.ownerName}
              onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
          )}

          <TextField label="Plate Number *" fullWidth size="small" value={form.plate}
            onChange={e => setForm(f => ({ ...f, plate: e.target.value.toUpperCase() }))}
            inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 2 } }} />

          <Stack direction="row" spacing={2}>
            <TextField label="Make" fullWidth size="small" value={form.make}
              onChange={e => setForm(f => ({ ...f, make: e.target.value }))} />
            <TextField label="Model" fullWidth size="small" value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField label="Colour" fullWidth size="small" value={form.colour}
              onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} />
            <FormControl fullWidth size="small">
              <InputLabel>Vehicle Type</InputLabel>
              <Select value={form.type} label="Vehicle Type"
                onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) }))}>
                {VEHICLE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <TextField label="Notes" fullWidth size="small" multiline rows={2} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isMutating}>Register</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Issue tag dialog ──────────────────────────────────────────────────────────

function IssueTagDialog({ vehicle, open, onClose, onSaved }: { vehicle: VehicleDto | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes]         = useState('');
  const [err, setErr]             = useState('');
  const { trigger, isMutating }   = useIssueTag();

  const handleIssue = async () => {
    if (!vehicle) return;
    try {
      await trigger({ vehicleId: vehicle.id, expiresAt: expiresAt || null, notes: notes || null });
      onSaved();
      setExpiresAt('');
      setNotes('');
      setErr('');
      onClose();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Failed to issue tag.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Issue Tag — {vehicle?.plate}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <TextField label="Expires At (optional)" type="date" size="small" fullWidth
            value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            InputLabelProps={{ shrink: true }} />
          <TextField label="Notes" size="small" fullWidth multiline rows={2}
            value={notes} onChange={e => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleIssue} disabled={isMutating}>Issue Tag</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ParkingPage() {
  const [tab, setTab] = useState(0);

  // Active Now
  const { data: active = [], mutate: mutateActive } = useGetActiveParking();
  const { trigger: logExit } = useLogExit();

  // Vehicles
  const { data: vehicles = [], mutate: mutateVehicles } = useGetVehicles();
  const { trigger: deleteVehicle } = useDeleteVehicle();
  const { trigger: updateTagStatus } = useUpdateTagStatus();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [issueTagVehicle, setIssueTagVehicle] = useState<VehicleDto | null>(null);
  const [stickerVehicleId, setStickerVehicleId] = useState<string | null>(null);

  // Log Entry
  const [tagInput, setTagInput] = useState('');
  const [tagResult, setTagResult] = useState<ParkingRecordDto | null>(null);
  const [tagErr, setTagErr] = useState('');
  const { trigger: logByTag, isMutating: loggingTag } = useLogEntryByTag();

  const [visitorPlate, setVisitorPlate] = useState('');
  const [visitorNotes, setVisitorNotes]  = useState('');
  const [visitorResult, setVisitorResult] = useState<ParkingRecordDto | null>(null);
  const [visitorErr, setVisitorErr] = useState('');
  const { trigger: logVisitor, isMutating: loggingVisitor } = useLogVisitorEntry();

  // History
  const [from, setFrom] = useState(fmt(thirtyAgo));
  const [to, setTo]     = useState(fmt(today));
  const [appliedRange, setAppliedRange] = useState({ from: fmt(thirtyAgo), to: fmt(today) });
  const { data: history = [], isLoading: histLoading } = useGetParkingHistory(appliedRange.from, appliedRange.to);

  // ── Active columns ──────────────────────────────────────────────────────────
  const activeCols: GridColDef<ParkingRecordDto>[] = [
    { field: 'plate',        headerName: 'Plate',   width: 130,
      renderCell: ({ row }) => <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1 }}>{row.plate}</Typography> },
    { field: 'tagNumber',    headerName: 'Tag',     width: 110,
      renderCell: ({ row }) => row.tagNumber
        ? <Chip label={row.tagNumber} color="success" variant="soft" size="small" />
        : <Chip label="Visitor" color="neutral" variant="soft" size="small" /> },
    { field: 'ownerDisplay', headerName: 'Owner',   flex: 1, minWidth: 140,
      renderCell: ({ row }) => <Typography variant="subtitle2">{row.ownerDisplay}</Typography> },
    { field: 'entryGate',    headerName: 'Gate',    width: 120,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.entryGate ?? '—'}</Typography> },
    { field: 'enteredAt',    headerName: 'Entered', width: 150,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{new Date(row.enteredAt).toLocaleTimeString()}</Typography> },
    { field: 'actions',      headerName: '',        width: 100, sortable: false,
      renderCell: ({ row }) => (
        <Button size="small" variant="soft" color="error"
          onClick={async () => { await logExit({ recordId: row.id }); mutateActive(); }}>
          Exit
        </Button>
      ) },
  ];

  // ── Vehicle columns ─────────────────────────────────────────────────────────
  const vehicleCols: GridColDef<VehicleDto>[] = [
    { field: 'plate', headerName: 'Plate', width: 130,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconifyIcon icon={VEHICLE_TYPE_ICONS[row.vehicleType] ?? VEHICLE_TYPE_ICONS.Car} sx={{ color: 'text.disabled', fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1 }}>{row.plate}</Typography>
        </Stack>
      ) },
    { field: 'makeModel', headerName: 'Vehicle', flex: 1, minWidth: 140,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2">{row.make} {row.model}</Typography>
          <Typography variant="caption" color="text.secondary">{row.colour}</Typography>
        </Box>
      ) },
    { field: 'ownerDisplay', headerName: 'Owner', flex: 1, minWidth: 140,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2">{row.ownerDisplay}</Typography>
          <Typography variant="caption" color="text.secondary">{row.ownerCategory}</Typography>
        </Box>
      ) },
    { field: 'tagNumber', headerName: 'Tag', width: 130,
      renderCell: ({ row }) => row.tagNumber
        ? <Chip label={row.tagNumber} color={tagColor(row.tagStatus)} variant="soft" size="small" />
        : <Chip label="No Tag" color="neutral" variant="soft" size="small" /> },
    { field: 'actions', headerName: '', width: 180, sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {!row.tagNumber ? (
            <Tooltip title="Issue Tag">
              <IconButton size="small" color="primary" onClick={() => setIssueTagVehicle(row)}>
                <IconifyIcon icon="material-symbols:label-outline-rounded" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Print Sticker">
                <IconButton size="small" onClick={() => setStickerVehicleId(row.id)}>
                  <IconifyIcon icon="material-symbols:print-rounded" />
                </IconButton>
              </Tooltip>
              {row.tagStatus === 'Active' && (
                <Tooltip title="Suspend Tag">
                  <IconButton size="small" color="warning"
                    onClick={async () => {
                      await updateTagStatus({ tagId: row.tagId!, status: 1 });
                      mutateVehicles();
                    }}>
                    <IconifyIcon icon="material-symbols:pause-circle-outline-rounded" />
                  </IconButton>
                </Tooltip>
              )}
              {row.tagStatus === 'Suspended' && (
                <Tooltip title="Activate Tag">
                  <IconButton size="small" color="success"
                    onClick={async () => {
                      await updateTagStatus({ tagId: row.tagId!, status: 0 });
                      mutateVehicles();
                    }}>
                    <IconifyIcon icon="material-symbols:play-circle-outline-rounded" />
                  </IconButton>
                </Tooltip>
              )}
              {row.tagStatus !== 'Revoked' && (
                <Tooltip title="Revoke Tag">
                  <IconButton size="small" color="error"
                    onClick={async () => {
                      await updateTagStatus({ tagId: row.tagId!, status: 2 });
                      mutateVehicles();
                    }}>
                    <IconifyIcon icon="material-symbols:block-rounded" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
          <Tooltip title="Delete Vehicle">
            <IconButton size="small" color="error"
              onClick={async () => {
                if (!confirm('Delete this vehicle?')) return;
                await deleteVehicle(row.id);
                mutateVehicles();
              }}>
              <IconifyIcon icon="material-symbols:delete-outline-rounded" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) },
  ];

  // ── History columns ─────────────────────────────────────────────────────────
  const historyCols: GridColDef<ParkingRecordDto>[] = [
    { field: 'plate',        headerName: 'Plate',    width: 120,
      renderCell: ({ row }) => <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1 }}>{row.plate}</Typography> },
    { field: 'recordType',   headerName: 'Type',     width: 100,
      renderCell: ({ row }) => <Chip label={row.recordType} color={row.recordType === 'Resident' ? 'primary' : 'neutral'} variant="soft" size="small" /> },
    { field: 'tagNumber',    headerName: 'Tag',      width: 110,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.tagNumber ?? '—'}</Typography> },
    { field: 'ownerDisplay', headerName: 'Owner',    flex: 1, minWidth: 140,
      renderCell: ({ row }) => <Typography variant="subtitle2">{row.ownerDisplay}</Typography> },
    { field: 'enteredAt',    headerName: 'Entered',  width: 170,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{new Date(row.enteredAt).toLocaleString()}</Typography> },
    { field: 'exitedAt',     headerName: 'Exited',   width: 170,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.exitedAt ? new Date(row.exitedAt).toLocaleString() : '—'}</Typography> },
    { field: 'duration',     headerName: 'Duration', width: 100,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.duration ?? '—'}</Typography> },
    { field: 'entryGate',    headerName: 'Gate',     width: 120,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.entryGate ?? '—'}</Typography> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Parking</Typography>
          <Typography variant="body2" color="text.secondary">
            Vehicle access control — registered tags, active vehicles, entry logging and history
          </Typography>
        </Box>
        {tab === 1 && (
          <Button variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={() => setRegisterOpen(true)}>
            Register Vehicle
          </Button>
        )}
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Active Now (${active.length})`} />
        <Tab label={`Vehicles (${vehicles.length})`} />
        <Tab label="Log Entry" />
        <Tab label="History" />
      </Tabs>

      {/* Tab 0 — Active Now */}
      {tab === 0 && (
        <Paper sx={{ height: 520 }}>
          <DataGrid
            rows={active}
            columns={activeCols}
            getRowId={r => r.id}
            hideFooter={active.length <= 100}
            disableRowSelectionOnClick
            disableColumnMenu
          />
        </Paper>
      )}

      {/* Tab 1 — Registered Vehicles */}
      {tab === 1 && (
        <Paper sx={{ height: 560 }}>
          <DataGrid
            rows={vehicles}
            columns={vehicleCols}
            getRowId={r => r.id}
            disableRowSelectionOnClick
            disableColumnMenu
          />
        </Paper>
      )}

      {/* Tab 2 — Log Entry */}
      {tab === 2 && (
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
          {/* By Tag */}
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
              Entry by Tag Number
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Tag Number"
                placeholder="TAG-0001"
                size="small"
                fullWidth
                value={tagInput}
                onChange={e => setTagInput(e.target.value.toUpperCase())}
                inputProps={{ style: { letterSpacing: 2, fontWeight: 700 } }}
              />
              {tagErr && <Typography color="error" variant="body2">{tagErr}</Typography>}
              {tagResult && (
                <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    Entry Logged
                  </Typography>
                  <Typography variant="body2">{tagResult.plate} · {tagResult.tagNumber}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(tagResult.enteredAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              )}
              <Button
                variant="contained"
                disabled={!tagInput.trim() || loggingTag}
                onClick={async () => {
                  setTagErr('');
                  setTagResult(null);
                  try {
                    const rec = await logByTag({ tagNumber: tagInput.trim(), entranceId: null });
                    setTagResult(rec);
                    setTagInput('');
                    mutateActive();
                  } catch (e: any) {
                    setTagErr(e?.data?.error ?? 'Entry failed.');
                  }
                }}
              >
                {loggingTag ? 'Logging…' : 'Log Entry'}
              </Button>
            </Stack>
          </Paper>

          {/* Manual / Visitor */}
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
              Manual / Visitor Entry
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Plate Number *"
                size="small"
                fullWidth
                value={visitorPlate}
                onChange={e => setVisitorPlate(e.target.value.toUpperCase())}
                inputProps={{ style: { letterSpacing: 2, fontWeight: 700 } }}
              />
              <TextField
                label="Notes (optional)"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={visitorNotes}
                onChange={e => setVisitorNotes(e.target.value)}
              />
              {visitorErr && <Typography color="error" variant="body2">{visitorErr}</Typography>}
              {visitorResult && (
                <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark' }}>
                    Visitor Entry Logged
                  </Typography>
                  <Typography variant="body2">{visitorResult.plate}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(visitorResult.enteredAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              )}
              <Button
                variant="contained"
                color="info"
                disabled={!visitorPlate.trim() || loggingVisitor}
                onClick={async () => {
                  setVisitorErr('');
                  setVisitorResult(null);
                  try {
                    const rec = await logVisitor({ plate: visitorPlate.trim(), visitId: null, entranceId: null, notes: visitorNotes || null });
                    setVisitorResult(rec);
                    setVisitorPlate('');
                    setVisitorNotes('');
                    mutateActive();
                  } catch (e: any) {
                    setVisitorErr(e?.data?.error ?? 'Entry failed.');
                  }
                }}
              >
                {loggingVisitor ? 'Logging…' : 'Log Entry'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Tab 3 — History */}
      {tab === 3 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <TextField label="From" type="date" size="small" value={from}
                onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="To" type="date" size="small" value={to}
                onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={() => setAppliedRange({ from, to })}>Apply</Button>
              {histLoading && <CircularProgress size={20} />}
            </Stack>
          </Paper>
          <Paper sx={{ height: 520 }}>
            <DataGrid
              rows={history}
              columns={historyCols}
              getRowId={r => r.id}
              disableRowSelectionOnClick
              disableColumnMenu
            />
          </Paper>
        </>
      )}

      {/* Dialogs */}
      <RegisterVehicleDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={() => mutateVehicles()}
      />

      <IssueTagDialog
        vehicle={issueTagVehicle}
        open={!!issueTagVehicle}
        onClose={() => setIssueTagVehicle(null)}
        onSaved={() => mutateVehicles()}
      />

      {/* Sticker dialog */}
      <Dialog open={!!stickerVehicleId} onClose={() => setStickerVehicleId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Vehicle Sticker</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {stickerVehicleId && (
            <StickerPrint vehicleId={stickerVehicleId} tenantName="Facility" />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStickerVehicleId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
