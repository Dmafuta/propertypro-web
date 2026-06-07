'use client';

import { useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton,
  InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
  useGetPasses, useGeneratePass, useRevokePass,
  PASS_TYPES, AccessPassDto,
} from 'services/swr/api-hooks/usePassesApi';
import { useGetVisits } from 'services/swr/api-hooks/useVisitorsApi';

// ── Generate Pass Dialog ──────────────────────────────────────────────────────
function GenerateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trigger: generate, isMutating } = useGeneratePass();
  const { enqueueSnackbar } = useSnackbar();

  // Load today's checked-in visits
  const { data: visitsData } = useGetVisits('today', '', 1);
  const checkedInVisits = (visitsData?.items ?? []).filter(v => v.status === 1); // CheckedIn

  const [visitId, setVisitId] = useState('');
  const [passType, setPassType] = useState(0);
  const [vehicleReg, setVehicleReg] = useState('');
  const [parkingBay, setParkingBay] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const reset = () => {
    setVisitId(''); setPassType(0); setVehicleReg(''); setParkingBay(''); setValidUntil('');
  };

  const handleSubmit = async () => {
    if (!visitId) return;
    try {
      await generate({
        visitId, passType,
        vehicleRegistration: vehicleReg || null,
        parkingBay: parkingBay || null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      });
      enqueueSnackbar('Pass generated', { variant: 'success' });
      onClose();
      reset();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.error ?? 'Failed to generate pass', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Generate Access Pass</Typography>
          <IconButton onClick={onClose}><Icon icon="material-symbols:close-rounded" /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select label="Visitor (checked-in today) *"
            value={visitId}
            onChange={e => setVisitId(e.target.value)}
            fullWidth
            helperText={checkedInVisits.length === 0 ? 'No checked-in visitors found for today' : undefined}
          >
            {checkedInVisits.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {v.visitor.fullName}
                {v.visitor.phone ? ` — ${v.visitor.phone}` : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Pass Type" value={passType} onChange={e => setPassType(Number(e.target.value))} fullWidth>
            {PASS_TYPES.map(t => (
              <MenuItem key={t.value} value={t.value}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Icon icon={t.icon} width={18} />
                  {t.label}
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {(passType === 1 || passType === 2) && (
            <Stack direction="row" gap={2}>
              <TextField
                label="Vehicle Registration"
                value={vehicleReg}
                onChange={e => setVehicleReg(e.target.value)}
                placeholder="e.g. KAA 123A"
                fullWidth
              />
              <TextField
                label="Parking Bay"
                value={parkingBay}
                onChange={e => setParkingBay(e.target.value)}
                placeholder="e.g. B-12"
                fullWidth
              />
            </Stack>
          )}

          <TextField
            label="Valid Until (optional)"
            type="datetime-local"
            value={validUntil}
            onChange={e => setValidUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Leave blank for open-ended"
            fullWidth
          />

          <Button
            variant="contained"
            disabled={!visitId || isMutating}
            onClick={handleSubmit}
            startIcon={<Icon icon="material-symbols:badge-outline-rounded" />}
            fullWidth
          >
            Generate Pass
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Revoke Dialog ─────────────────────────────────────────────────────────────
function RevokeDialog({
  pass, onClose,
}: {
  pass: AccessPassDto | null;
  onClose: () => void;
}) {
  const { trigger: revoke, isMutating } = useRevokePass();
  const { enqueueSnackbar } = useSnackbar();
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!pass) return;
    try {
      await revoke({ id: pass.id, reason: reason || null });
      enqueueSnackbar('Pass revoked', { variant: 'success' });
      onClose();
      setReason('');
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.error ?? 'Failed to revoke', { variant: 'error' });
    }
  };

  return (
    <Dialog open={!!pass} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Revoke Pass</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Revoking <strong>{pass?.passNumber}</strong> for <strong>{pass?.visitorName}</strong>.
          This cannot be undone.
        </Typography>
        <TextField
          label="Reason (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <Stack direction="row" gap={1.5} mt={2.5} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" color="error" disabled={isMutating} onClick={handleSubmit}>
            Revoke
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Status chip helper ────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { color: 'success' | 'error' | 'default'; icon: string }> = {
    Active:  { color: 'success', icon: 'material-symbols:check-circle-outline-rounded' },
    Revoked: { color: 'error',   icon: 'material-symbols:cancel-outline-rounded' },
    Expired: { color: 'default', icon: 'material-symbols:schedule-outline-rounded' },
  };
  const cfg = map[status] ?? map.Expired;
  return (
    <Chip
      label={status}
      color={cfg.color}
      size="small"
      icon={<Icon icon={cfg.icon} width={14} />}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PassesPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [revokePass, setRevokePass] = useState<AccessPassDto | null>(null);

  const { data, mutate } = useGetPasses({
    search, status: statusFilter || undefined, page: page + 1, pageSize: 25,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const activeCount  = rows.filter(p => p.status === 'Active').length;
  const revokedCount = rows.filter(p => p.status === 'Revoked').length;

  const columns: GridColDef<AccessPassDto>[] = [
    {
      field: 'passNumber', headerName: 'Pass No.', width: 160,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{value}</Typography>
      ),
    },
    { field: 'visitorName', headerName: 'Visitor', flex: 1.2, renderCell: ({ value }) => value ?? '—' },
    {
      field: 'passType', headerName: 'Type', width: 110,
      renderCell: ({ value }) => {
        const t = PASS_TYPES.find(x => x.label === value);
        return (
          <Chip
            label={value}
            size="small"
            variant="outlined"
            icon={t ? <Icon icon={t.icon} width={14} /> : undefined}
          />
        );
      },
    },
    {
      field: 'vehicleRegistration', headerName: 'Vehicle', width: 130,
      renderCell: ({ value }) => value ?? '—',
    },
    {
      field: 'validFrom', headerName: 'Valid From', width: 120,
      valueFormatter: (v: string) => dayjs(v).format('DD MMM HH:mm'),
    },
    {
      field: 'validUntil', headerName: 'Valid Until', width: 130,
      renderCell: ({ value }) => value
        ? <Typography variant="body2">{dayjs(value).format('DD MMM HH:mm')}</Typography>
        : <Chip label="Open" size="small" variant="outlined" />,
    },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: ({ value }: GridRenderCellParams<AccessPassDto, string>) => (
        <StatusChip status={value ?? ''} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false,
      renderCell: ({ row }: GridRenderCellParams<AccessPassDto>) =>
        row.status === 'Active' ? (
          <Tooltip title="Revoke pass">
            <IconButton size="small" color="error" onClick={() => setRevokePass(row)}>
              <Icon icon="material-symbols:cancel-outline-rounded" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  const STATUS_FILTERS = ['', 'active', 'revoked', 'expired'];
  const STATUS_LABELS  = ['All', 'Active', 'Revoked', 'Expired'];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Access Passes</Typography>
          <Typography variant="body2" color="text.secondary">
            Issue and manage visitor access passes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:badge-outline-rounded" />}
          onClick={() => setGenerateOpen(true)}
        >
          Generate Pass
        </Button>
      </Stack>

      {/* KPI chips */}
      <Stack direction="row" gap={1.5} mb={3} flexWrap="wrap">
        <Chip label={`${total} Total`} variant="outlined" />
        <Chip label={`${activeCount} Active`} color="success" variant="outlined" />
        {revokedCount > 0 && <Chip label={`${revokedCount} Revoked`} color="error" variant="outlined" />}
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} mb={2}>
        <TextField
          size="small"
          placeholder="Search pass no., visitor, vehicle…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Icon icon="material-symbols:search-rounded" /></InputAdornment>,
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          select size="small" label="Status" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          {STATUS_FILTERS.map((v, i) => (
            <MenuItem key={v} value={v}>{STATUS_LABELS[i]}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page, pageSize: 25 }}
        onPaginationModelChange={m => setPage(m.page)}
        pageSizeOptions={[25]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 0 }}
      />

      <GenerateDialog open={generateOpen} onClose={() => { setGenerateOpen(false); mutate(); }} />
      <RevokeDialog pass={revokePass} onClose={() => { setRevokePass(null); mutate(); }} />
    </Box>
  );
}
