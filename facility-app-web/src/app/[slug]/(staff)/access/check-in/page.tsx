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
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetVisits, useGetHosts, useCheckIn, useCheckOut, useWalkIn,
  type VisitDto, type WalkInPayload,
} from 'services/swr/api-hooks/useVisitorsApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS = {
  0: { label: 'Scheduled',   color: 'warning'  },
  1: { label: 'Checked In',  color: 'success'  },
  2: { label: 'Checked Out', color: 'neutral'  },
  3: { label: 'Cancelled',   color: 'error'    },
  4: { label: 'No Show',     color: 'neutral'  },
} as const;

function statusInfo(s: number) {
  return STATUS[s as keyof typeof STATUS] ?? { label: 'Unknown', color: 'neutral' as const };
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Visitor card ──────────────────────────────────────────────────────────────

function VisitorCard({
  visit,
  onCheckIn,
  onCheckOut,
  loading,
}: {
  visit: VisitDto;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  loading?: boolean;
}) {
  const si = statusInfo(visit.status);
  const canCheckIn  = visit.status === 0;
  const canCheckOut = visit.status === 1;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 700, flexShrink: 0 }}>
          {visit.visitor.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={visit.visitor.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : getInitials(visit.visitor.fullName)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineClamp: 1 }}>
              {visit.visitor.fullName}
            </Typography>
            <Chip label={si.label} color={si.color as any} variant="soft" size="small" />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {visit.visitor.phone}
            {visit.visitor.company && ` · ${visit.visitor.company}`}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="small"
              variant="soft"
              color="neutral"
              label={visit.purpose}
              icon={<IconifyIcon icon="material-symbols:info-outline-rounded" sx={{ fontSize: 14 }} />}
            />
            <Chip
              size="small"
              variant="soft"
              color="neutral"
              label={fmtTime(visit.checkedInAt ?? visit.scheduledAt)}
              icon={<IconifyIcon icon="material-symbols:schedule-outline-rounded" sx={{ fontSize: 14 }} />}
            />
            {visit.host && (
              <Chip
                size="small"
                variant="soft"
                color="neutral"
                label={visit.host.fullName}
                icon={<IconifyIcon icon="material-symbols:person-outline-rounded" sx={{ fontSize: 14 }} />}
              />
            )}
            {visit.entryEntrance && (
              <Chip
                size="small"
                variant="soft"
                color="neutral"
                label={visit.entryEntrance.name}
                icon={<IconifyIcon icon="material-symbols:sensor-door-outline-rounded" sx={{ fontSize: 14 }} />}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      {(canCheckIn || canCheckOut) && (
        <>
          <Divider sx={{ mt: 2, mb: 1.5 }} />
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            {canCheckIn && (
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={loading}
                startIcon={loading
                  ? <CircularProgress size={14} />
                  : <IconifyIcon icon="material-symbols:how-to-reg-outline-rounded" />}
                onClick={onCheckIn}
              >
                Check In
              </Button>
            )}
            {canCheckOut && (
              <Button
                size="small"
                variant="soft"
                color="neutral"
                disabled={loading}
                startIcon={loading
                  ? <CircularProgress size={14} />
                  : <IconifyIcon icon="material-symbols:logout-rounded" />}
                onClick={onCheckOut}
              >
                Check Out
              </Button>
            )}
          </Stack>
        </>
      )}
    </Paper>
  );
}

// ── Walk-in dialog ────────────────────────────────────────────────────────────

const EMPTY_WALKIN: WalkInPayload = {
  fullName: '', email: '', phone: '', company: null,
  purpose: '', hostUserId: null, notes: null,
};

function WalkInDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<WalkInPayload>(EMPTY_WALKIN);
  const [err, setErr]   = useState('');
  const { data: hosts = [] }           = useGetHosts();
  const { trigger, isMutating: saving } = useWalkIn();

  const handleSave = async () => {
    if (!form.fullName.trim()) { setErr('Full name is required.'); return; }
    if (!form.phone.trim())    { setErr('Phone number is required.'); return; }
    if (!form.purpose.trim())  { setErr('Purpose is required.'); return; }
    try {
      await trigger(form);
      onSaved();
      setForm(EMPTY_WALKIN);
      setErr('');
      onClose();
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Walk-in failed.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Walk-in Check-in</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}

          <Stack direction="row" spacing={2}>
            <TextField
              label="Full Name *"
              fullWidth
              size="small"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            />
            <TextField
              label="Phone *"
              fullWidth
              size="small"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Company"
              fullWidth
              size="small"
              value={form.company ?? ''}
              onChange={e => setForm(f => ({ ...f, company: e.target.value || null }))}
            />
          </Stack>

          <TextField
            label="Purpose *"
            fullWidth
            size="small"
            value={form.purpose}
            onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
          />

          {hosts.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Host (optional)</InputLabel>
              <Select
                value={form.hostUserId ?? ''}
                label="Host (optional)"
                onChange={e => setForm(f => ({ ...f, hostUserId: e.target.value || null }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {hosts.map(h => (
                  <MenuItem key={h.id} value={h.id}>{h.fullName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Notes"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={form.notes ?? ''}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleSave} disabled={saving}>
          Check In
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const [search,   setSearch]   = useState('');
  const [dSearch,  setDSearch]  = useState('');
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [loadingId, setLoadingId]  = useState<string | null>(null);

  const debounce = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((debounce as any)._t);
    (debounce as any)._t = setTimeout(() => setDSearch(val), 350);
  }, []);

  const { data: scheduledData, mutate: mutateScheduled, isLoading: loadingScheduled } =
    useGetVisits('today', dSearch, 1);

  const { data: activeData, mutate: mutateActive, isLoading: loadingActive } =
    useGetVisits('active', dSearch, 1);

  const { trigger: checkIn }  = useCheckIn();
  const { trigger: checkOut } = useCheckOut();

  const scheduled = (scheduledData?.items ?? []).filter(v => v.status === 0);
  const active    = activeData?.items ?? [];

  const handleCheckIn = async (visitId: string) => {
    setLoadingId(visitId);
    try {
      await checkIn(visitId);
      await Promise.all([mutateScheduled(), mutateActive()]);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCheckOut = async (visitId: string) => {
    setLoadingId(visitId);
    try {
      await checkOut(visitId);
      await Promise.all([mutateScheduled(), mutateActive()]);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Check-in</Typography>
          <Typography variant="body2" color="text.secondary">
            Gate operations — check visitors in and out
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
          onClick={() => setWalkInOpen(true)}
        >
          Walk-in
        </Button>
      </Stack>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, phone or company…"
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
                  <Tooltip title="Clear search">
                    <IconButton size="small" onClick={() => { setSearch(''); setDSearch(''); }}>
                      <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </Paper>

      {/* Two columns */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>

        {/* Scheduled / Expected */}
        <Box sx={{ flex: 1, width: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Expected Today
            </Typography>
            <Chip label={scheduled.length} color="warning" variant="soft" size="small" />
            {loadingScheduled && <CircularProgress size={16} />}
          </Stack>

          {!loadingScheduled && scheduled.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {dSearch ? 'No matching scheduled visitors' : 'No scheduled visitors today'}
              </Typography>
            </Paper>
          )}

          <Stack spacing={1.5}>
            {scheduled.map(v => (
              <VisitorCard
                key={v.id}
                visit={v}
                loading={loadingId === v.id}
                onCheckIn={() => handleCheckIn(v.id)}
              />
            ))}
          </Stack>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />
        <Divider sx={{ display: { xs: 'block', lg: 'none' }, width: 1 }} />

        {/* Currently Inside */}
        <Box sx={{ flex: 1, width: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Currently Inside
            </Typography>
            <Chip label={active.length} color="success" variant="soft" size="small" />
            {loadingActive && <CircularProgress size={16} />}
          </Stack>

          {!loadingActive && active.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {dSearch ? 'No matching active visitors' : 'No visitors currently inside'}
              </Typography>
            </Paper>
          )}

          <Stack spacing={1.5}>
            {active.map(v => (
              <VisitorCard
                key={v.id}
                visit={v}
                loading={loadingId === v.id}
                onCheckOut={() => handleCheckOut(v.id)}
              />
            ))}
          </Stack>
        </Box>
      </Stack>

      <WalkInDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSaved={() => { mutateScheduled(); mutateActive(); }}
      />
    </Box>
  );
}
