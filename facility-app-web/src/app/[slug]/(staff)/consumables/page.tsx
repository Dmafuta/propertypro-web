'use client';

import React, { useState, useMemo } from 'react';
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs,
  TextField, Tooltip, Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
  useGetConsumableTypes,
  useGetConsumableIssuances,
  useCreateConsumableType,
  useRestockConsumable,
  useToggleConsumableType,
  useIssueConsumable,
  ConsumableTypeDto,
} from 'services/swr/api-hooks/useConsumablesApi';
import { useGetUnits } from 'services/swr/api-hooks/useUnitsApi';

// ── Issue Dialog ──────────────────────────────────────────────────────────────
function IssueDialog({
  open, onClose, types,
}: {
  open: boolean;
  onClose: () => void;
  types: ConsumableTypeDto[];
}) {
  const { data: units = [] } = useGetUnits();
  const { trigger: issue, isMutating } = useIssueConsumable();
  const { enqueueSnackbar } = useSnackbar();

  const [typeId, setTypeId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');

  const selectedType = types.find(t => t.id === typeId);

  const handleSubmit = async () => {
    if (!typeId || !unitId || quantity < 1) return;
    try {
      await issue({
        consumableTypeId: typeId, unitId, quantity,
        issuedAt: new Date(date).toISOString(), notes: notes || null,
      });
      enqueueSnackbar('Issued successfully', { variant: 'success' });
      onClose();
      setTypeId(''); setUnitId(''); setQuantity(1); setNotes('');
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.error ?? 'Failed to issue', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Issue to Unit</Typography>
          <IconButton onClick={onClose}><Icon icon="material-symbols:close-rounded" /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField select label="Consumable" value={typeId} onChange={e => setTypeId(e.target.value)} fullWidth>
            {types.filter(t => t.isActive).map(t => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({t.currentStock} {t.unit} in stock)
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Unit" value={unitId} onChange={e => setUnitId(e.target.value)} fullWidth>
            {(units as any[]).map((u: any) => (
              <MenuItem key={u.id} value={u.id}>
                {u.block ? `${u.block} - ` : ''}{u.unitNumber}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            InputProps={{
              endAdornment: selectedType ? (
                <InputAdornment position="end">{selectedType.unit}</InputAdornment>
              ) : undefined,
            }}
            fullWidth
          />

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
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
            disabled={!typeId || !unitId || quantity < 1 || isMutating}
            onClick={handleSubmit}
            fullWidth
          >
            Confirm Issuance
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Restock Dialog ────────────────────────────────────────────────────────────
function RestockDialog({ type, onClose }: { type: ConsumableTypeDto | null; onClose: () => void }) {
  const { trigger: restock, isMutating } = useRestockConsumable();
  const { enqueueSnackbar } = useSnackbar();
  const [qty, setQty] = useState(1);

  const handleSubmit = async () => {
    if (!type) return;
    try {
      await restock({ id: type.id, quantity: qty });
      enqueueSnackbar(`Added ${qty} ${type.unit} to stock`, { variant: 'success' });
      onClose();
      setQty(1);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.error ?? 'Restock failed', { variant: 'error' });
    }
  };

  return (
    <Dialog open={!!type} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Restock — {type?.name}</Typography>
          <IconButton onClick={onClose}><Icon icon="material-symbols:close-rounded" /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Current stock: <strong>{type?.currentStock} {type?.unit}</strong>
          </Typography>
          <TextField
            label="Quantity to add"
            type="number"
            value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value)))}
            InputProps={{ endAdornment: <InputAdornment position="end">{type?.unit}</InputAdornment> }}
            fullWidth
          />
          <Button variant="contained" disabled={qty < 1 || isMutating} onClick={handleSubmit} fullWidth>
            Add Stock
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Type Dialog ───────────────────────────────────────────────────────────
function AddTypeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trigger: create, isMutating } = useCreateConsumableType();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !unit.trim()) return;
    try {
      await create({ name, unit, lowStockThreshold: threshold ? Number(threshold) : null });
      enqueueSnackbar('Consumable type created', { variant: 'success' });
      onClose();
      setName(''); setUnit(''); setThreshold('');
    } catch {
      enqueueSnackbar('Failed to create type', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">New Consumable Type</Typography>
          <IconButton onClick={onClose}><Icon icon="material-symbols:close-rounded" /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Garbage Bags"
            fullWidth
          />
          <TextField
            label="Unit"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            placeholder="e.g. bags, rolls, pieces"
            fullWidth
          />
          <TextField
            label="Low stock alert threshold (optional)"
            type="number"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            helperText="Show a warning when stock falls below this number"
            fullWidth
          />
          <Button
            variant="contained"
            disabled={!name.trim() || !unit.trim() || isMutating}
            onClick={handleSubmit}
            fullWidth
          >
            Create
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConsumablesPage() {
  const { data: types = [], mutate: mutateTypes } = useGetConsumableTypes();
  const { data: issuances = [], mutate: mutateIssuances } = useGetConsumableIssuances();
  const { trigger: toggleType } = useToggleConsumableType();
  const { enqueueSnackbar } = useSnackbar();

  const [tab, setTab] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [restockType, setRestockType] = useState<ConsumableTypeDto | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const handleToggle = async (id: string) => {
    try {
      await toggleType(id);
      mutateTypes();
    } catch {
      enqueueSnackbar('Failed to update', { variant: 'error' });
    }
  };

  const handleDialogClose = () => {
    setIssueOpen(false);
    setAddTypeOpen(false);
    setRestockType(null);
    mutateTypes();
    mutateIssuances();
  };

  // KPIs
  const activeTypes = types.filter(t => t.isActive).length;
  const lowStockCount = types.filter(
    t => t.isActive && t.lowStockThreshold != null && t.currentStock <= t.lowStockThreshold,
  ).length;
  const issuedThisMonth = useMemo(() => {
    const start = dayjs().startOf('month');
    return issuances
      .filter(i => dayjs(i.issuedAt).isAfter(start))
      .reduce((s, i) => s + i.quantity, 0);
  }, [issuances]);

  // Filtered issuances
  const filteredIssuances = useMemo(() => {
    let rows = issuances;
    if (typeFilter) rows = rows.filter(i => i.consumableTypeId === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(i =>
        i.unitNumber.toLowerCase().includes(q) ||
        i.consumableTypeName.toLowerCase().includes(q) ||
        (i.block ?? '').toLowerCase().includes(q) ||
        i.issuedBy.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [issuances, typeFilter, search]);

  const issuanceColumns: GridColDef[] = [
    {
      field: 'unit', headerName: 'Unit', flex: 1,
      valueGetter: (_v: any, row: any) => `${row.block ? row.block + ' - ' : ''}${row.unitNumber}`,
    },
    { field: 'consumableTypeName', headerName: 'Consumable', flex: 1 },
    {
      field: 'quantity', headerName: 'Qty', width: 100,
      renderCell: ({ row }) => `${row.quantity} ${row.consumableUnit}`,
    },
    {
      field: 'issuedAt', headerName: 'Date', width: 130,
      valueFormatter: (v: string) => dayjs(v).format('DD MMM YYYY'),
    },
    { field: 'issuedBy', headerName: 'Issued By', flex: 1 },
    {
      field: 'notes', headerName: 'Notes', flex: 1.5,
      renderCell: ({ value }) => value ?? '—',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Consumables</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage stock and track issuances to units
          </Typography>
        </Box>
        <Stack direction="row" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<Icon icon="material-symbols:add-rounded" />}
            onClick={() => setAddTypeOpen(true)}
          >
            New Type
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="material-symbols:output-rounded" />}
            onClick={() => setIssueOpen(true)}
            disabled={activeTypes === 0}
          >
            Issue to Unit
          </Button>
        </Stack>
      </Stack>

      {/* KPI chips */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} mb={3}>
        <Chip
          icon={<Icon icon="material-symbols:inventory-2-outline-rounded" />}
          label={`${types.length} Types`}
          variant="outlined"
        />
        <Chip
          icon={<Icon icon="material-symbols:check-circle-outline-rounded" />}
          label={`${activeTypes} Active`}
          color="success"
          variant="outlined"
        />
        {lowStockCount > 0 && (
          <Chip
            icon={<Icon icon="material-symbols:warning-outline-rounded" />}
            label={`${lowStockCount} Low Stock`}
            color="warning"
            variant="outlined"
          />
        )}
        <Chip
          icon={<Icon icon="material-symbols:output-rounded" />}
          label={`${issuedThisMonth} issued this month`}
          variant="outlined"
        />
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Stock" />
        <Tab label="Issuances" />
      </Tabs>

      {/* ── Stock Tab ── */}
      {tab === 0 && (
        <Stack spacing={2}>
          {types.length === 0 && (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
              <Icon icon="material-symbols:inventory-2-outline-rounded" width={48} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" mt={1}>
                No consumable types yet. Add one to get started.
              </Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => setAddTypeOpen(true)}>
                Add Type
              </Button>
            </Paper>
          )}
          {types.map(type => {
            const isLow = type.isActive && type.lowStockThreshold != null && type.currentStock <= type.lowStockThreshold;
            return (
              <Paper key={type.id} variant="outlined" sx={{ p: 2.5, opacity: type.isActive ? 1 : 0.6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography fontWeight={600}>{type.name}</Typography>
                      {!type.isActive && <Chip label="Inactive" size="small" />}
                      {isLow && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          color="warning"
                          icon={<Icon icon="material-symbols:warning-outline-rounded" width={14} />}
                        />
                      )}
                    </Stack>
                    <Typography variant="h4" fontWeight={700} mt={0.5}>
                      {type.currentStock}
                      <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                        {type.unit}
                      </Typography>
                    </Typography>
                    {type.lowStockThreshold != null && (
                      <Typography variant="caption" color="text.secondary">
                        Alert threshold: {type.lowStockThreshold} {type.unit}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Icon icon="material-symbols:add-rounded" />}
                      onClick={() => setRestockType(type)}
                      disabled={!type.isActive}
                    >
                      Restock
                    </Button>
                    <Tooltip title={type.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => handleToggle(type.id)}>
                        <Icon
                          icon={type.isActive
                            ? 'material-symbols:toggle-on-rounded'
                            : 'material-symbols:toggle-off-rounded'}
                          width={24}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* ── Issuances Tab ── */}
      {tab === 1 && (
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} mb={2}>
            <TextField
              size="small"
              placeholder="Search unit, consumable, issued by…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="material-symbols:search-rounded" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              select size="small" label="Consumable" value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All types</MenuItem>
              {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
          </Stack>

          <DataGrid
            rows={filteredIssuances}
            columns={issuanceColumns}
            autoHeight
            pageSizeOptions={[20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            disableRowSelectionOnClick
            sx={{ border: 0 }}
          />
        </Box>
      )}

      {/* Dialogs */}
      <IssueDialog open={issueOpen} onClose={handleDialogClose} types={types} />
      <AddTypeDialog open={addTypeOpen} onClose={handleDialogClose} />
      <RestockDialog type={restockType} onClose={handleDialogClose} />
    </Box>
  );
}
