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
  useGetBlacklistEntries, useAddBlacklistEntry, useRemoveBlacklistEntry,
  BLACKLIST_TYPES, BlacklistEntryDto,
} from 'services/swr/api-hooks/useBlacklistApi';

// ── Add Dialog ────────────────────────────────────────────────────────────────
function AddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trigger: add, isMutating } = useAddBlacklistEntry();
  const { enqueueSnackbar } = useSnackbar();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [entryType, setEntryType] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setFullName(''); setEmail(''); setPhone('');
    setReason(''); setEntryType(0); setExpiresAt(''); setNotes('');
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !reason.trim()) return;
    try {
      await add({
        fullName, email: email || null, phone: phone || null,
        reason, entryType,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        notes: notes || null,
      });
      enqueueSnackbar('Entry added', { variant: 'success' });
      onClose();
      reset();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.error ?? 'Failed to add entry', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Add to List</Typography>
          <IconButton onClick={onClose}><Icon icon="material-symbols:close-rounded" /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField select label="Type" value={entryType} onChange={e => setEntryType(Number(e.target.value))} fullWidth>
            {BLACKLIST_TYPES.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} fullWidth />
          <Stack direction="row" gap={2}>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
            <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
          </Stack>
          <TextField
            label="Reason *"
            value={reason}
            onChange={e => setReason(e.target.value)}
            multiline rows={2}
            fullWidth
          />
          <TextField
            label="Expires At (optional)"
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Leave blank for permanent"
            fullWidth
          />
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            multiline rows={2}
            fullWidth
          />
          <Button
            variant="contained"
            color="error"
            disabled={!fullName.trim() || !reason.trim() || isMutating}
            onClick={handleSubmit}
            fullWidth
          >
            Add to {entryType === 0 ? 'Blacklist' : 'Watchlist'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlacklistPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { trigger: remove } = useRemoveBlacklistEntry();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const { data, mutate } = useGetBlacklistEntries({
    search, type: typeFilter || undefined, page: page + 1, pageSize: 25,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleRemove = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      enqueueSnackbar('Entry removed', { variant: 'success' });
      mutate();
    } catch {
      enqueueSnackbar('Failed to remove', { variant: 'error' });
    }
    setConfirmId(null);
  };

  const columns: GridColDef<BlacklistEntryDto>[] = [
    { field: 'fullName', headerName: 'Name', flex: 1.2 },
    {
      field: 'entryType', headerName: 'Type', width: 120,
      renderCell: ({ value }) => {
        const t = BLACKLIST_TYPES.find(x => x.label === value);
        return <Chip label={value} color={t?.color ?? 'default'} size="small" />;
      },
    },
    { field: 'email', headerName: 'Email', flex: 1, renderCell: ({ value }) => value ?? '—' },
    { field: 'phone', headerName: 'Phone', width: 130, renderCell: ({ value }) => value ?? '—' },
    { field: 'reason', headerName: 'Reason', flex: 1.5 },
    {
      field: 'expiresAt', headerName: 'Expires', width: 120,
      renderCell: ({ value }) => {
        if (!value) return <Chip label="Permanent" size="small" variant="outlined" />;
        const expired = dayjs(value).isBefore(dayjs());
        return (
          <Chip
            label={dayjs(value).format('DD MMM YY')}
            size="small"
            color={expired ? 'default' : 'warning'}
            variant={expired ? 'outlined' : 'filled'}
          />
        );
      },
    },
    { field: 'addedByName', headerName: 'Added By', width: 140 },
    {
      field: 'addedAt', headerName: 'Added', width: 110,
      valueFormatter: (v: string) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false,
      renderCell: ({ row }: GridRenderCellParams<BlacklistEntryDto>) => (
        <Tooltip title="Remove from list">
          <IconButton
            size="small"
            color="error"
            onClick={() => { setConfirmId(row.id); setConfirmName(row.fullName); }}
          >
            <Icon icon="material-symbols:person-remove-outline-rounded" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Blacklist</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage banned and watchlisted persons
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<Icon icon="material-symbols:person-add-disabled-rounded" />}
          onClick={() => setAddOpen(true)}
        >
          Add to List
        </Button>
      </Stack>

      {/* KPI chips */}
      <Stack direction="row" gap={1.5} mb={3} flexWrap="wrap">
        <Chip label={`${total} Total`} variant="outlined" />
        <Chip
          label="Blacklisted"
          color="error"
          variant={typeFilter === 'blacklisted' ? 'filled' : 'outlined'}
          onClick={() => setTypeFilter(typeFilter === 'blacklisted' ? '' : 'blacklisted')}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label="Watchlisted"
          color="warning"
          variant={typeFilter === 'watchlisted' ? 'filled' : 'outlined'}
          onClick={() => setTypeFilter(typeFilter === 'watchlisted' ? '' : 'watchlisted')}
          sx={{ cursor: 'pointer' }}
        />
      </Stack>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, email, phone or reason…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Icon icon="material-symbols:search-rounded" /></InputAdornment>,
        }}
        sx={{ mb: 2, maxWidth: 420 }}
      />

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

      {/* Add dialog */}
      <AddDialog open={addOpen} onClose={() => { setAddOpen(false); mutate(); }} />

      {/* Confirm remove dialog */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove from list?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove <strong>{confirmName}</strong> from the blacklist? This action can be reversed by re-adding them.
          </Typography>
          <Stack direction="row" gap={1.5} mt={3} justifyContent="flex-end">
            <Button onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleRemove}>Remove</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
