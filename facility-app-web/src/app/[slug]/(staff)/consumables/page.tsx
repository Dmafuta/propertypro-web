'use client';

import React, { useState, useMemo } from 'react';
import {
  Avatar, Box, Button, Chip, Dialog, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, LinearProgress, MenuItem,
  Paper, Stack, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import {
  useGetConsumableTypes,
  useGetConsumableIssuances,
  useGetRestockLog,
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
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!type) return;
    try {
      await restock({ id: type.id, quantity: qty, notes: notes || null });
      enqueueSnackbar(`Added ${qty} ${type.unit} to stock`, { variant: 'success' });
      onClose();
      setQty(1);
      setNotes('');
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
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Supplier name, batch no."
            multiline rows={2}
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
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Garbage Bags" fullWidth />
          <TextField label="Unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. bags, rolls, pieces" fullWidth />
          <TextField
            label="Low stock alert threshold (optional)"
            type="number"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            helperText="Show a warning when stock falls below this number"
            fullWidth
          />
          <Button variant="contained" disabled={!name.trim() || !unit.trim() || isMutating} onClick={handleSubmit} fullWidth>
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
  const { data: restockLogs = [], mutate: mutateRestockLogs } = useGetRestockLog();
  const { trigger: toggleType } = useToggleConsumableType();
  const { enqueueSnackbar } = useSnackbar();

  const [tab, setTab] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [restockType, setRestockType] = useState<ConsumableTypeDto | null>(null);

  // Issuances tab filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Restocks tab filters
  const [restockTypeFilter, setRestockTypeFilter] = useState('');
  const [restockSearch, setRestockSearch] = useState('');

  const { data: issuances = [], mutate: mutateIssuances } = useGetConsumableIssuances({
    typeId: typeFilter || undefined,
    from: fromDate ? new Date(fromDate).toISOString() : undefined,
    to: toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined,
  });

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
    mutateRestockLogs();
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

  // Client-side search filter on issuances
  const filteredIssuances = useMemo(() => {
    if (!search) return issuances;
    const q = search.toLowerCase();
    return issuances.filter(i =>
      i.unitNumber.toLowerCase().includes(q) ||
      i.consumableTypeName.toLowerCase().includes(q) ||
      (i.block ?? '').toLowerCase().includes(q) ||
      i.issuedBy.toLowerCase().includes(q),
    );
  }, [issuances, search]);

  // Restock log filters (client-side)
  const filteredRestockLogs = useMemo(() => {
    let rows = restockLogs;
    if (restockTypeFilter) rows = rows.filter(r => r.consumableTypeId === restockTypeFilter);
    if (restockSearch) {
      const q = restockSearch.toLowerCase();
      rows = rows.filter(r =>
        r.consumableTypeName.toLowerCase().includes(q) ||
        r.restockedBy.toLowerCase().includes(q) ||
        (r.notes ?? '').toLowerCase().includes(q),
      );
    }
    return rows;
  }, [restockLogs, restockTypeFilter, restockSearch]);

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
    { field: 'notes', headerName: 'Notes', flex: 1.5, renderCell: ({ value }) => value ?? '—' },
  ];

  const restockColumns: GridColDef[] = [
    { field: 'consumableTypeName', headerName: 'Consumable', flex: 1 },
    {
      field: 'quantity', headerName: 'Qty Added', width: 110,
      renderCell: ({ row }) => `+${row.quantity} ${row.consumableUnit}`,
    },
    {
      field: 'createdAt', headerName: 'Date', width: 130,
      valueFormatter: (v: string) => dayjs(v).format('DD MMM YYYY'),
    },
    { field: 'restockedBy', headerName: 'Restocked By', flex: 1 },
    { field: 'notes', headerName: 'Notes', flex: 1.5, renderCell: ({ value }) => value ?? '—' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        gap={2}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" gap={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{ width: 44, height: 44, bgcolor: 'primary.lighter', borderRadius: 2 }}
          >
            <Icon icon="material-symbols:inventory-2-outline-rounded" width={26} color="var(--mui-palette-primary-main)" />
          </Avatar>
          <Box>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>Consumables</Typography>
              {types.length > 0 && (
                <Chip label={types.length} color="primary" variant="soft" size="small" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Manage stock and track issuances to units
            </Typography>
          </Box>
        </Stack>

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

      {/* ── KPI Stat Cards ───────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Types',       value: types.length,    color: 'primary', icon: 'material-symbols:inventory-2-outline-rounded'   },
          { label: 'Active',            value: activeTypes,     color: 'success', icon: 'material-symbols:check-circle-outline-rounded'  },
          { label: 'Low Stock',         value: lowStockCount,   color: 'warning', icon: 'material-symbols:warning-outline-rounded'       },
          { label: 'Issued This Month', value: issuedThisMonth, color: 'info',    icon: 'material-symbols:output-rounded'                },
        ].map(({ label, value, color, icon }) => (
          <Grid key={label} size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2.5 }}>
              <Avatar
                variant="rounded"
                sx={{ width: 40, height: 40, bgcolor: `${color}.lighter`, borderRadius: 1.5, mb: 1.5 }}
              >
                <Icon icon={icon} width={22} color={`var(--mui-palette-${color}-main)`} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} lineHeight={1}>{value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Tabs + Content in Paper ──────────────────────────────────────────── */}
      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 52 },
          }}
        >
          <Tab
            label="Stock"
            icon={<Icon icon="material-symbols:inventory-2-outline-rounded" width={18} />}
            iconPosition="start"
            sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
          />
          <Tab
            label="Issuances"
            icon={<Icon icon="material-symbols:output-rounded" width={18} />}
            iconPosition="start"
            sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
          />
          <Tab
            label="Restock History"
            icon={<Icon icon="material-symbols:history-rounded" width={18} />}
            iconPosition="start"
            sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
          />
        </Tabs>

        {/* ── Stock Tab ── */}
        {tab === 0 && (
          <Box sx={{ p: 2.5 }}>
            {types.length === 0 ? (
              <Stack alignItems="center" gap={1.5} sx={{ py: 8 }}>
                <Avatar
                  variant="rounded"
                  sx={{ width: 72, height: 72, bgcolor: 'background.elevation1', borderRadius: 3 }}
                >
                  <Icon icon="material-symbols:inventory-2-outline-rounded" width={40} style={{ opacity: 0.4 }} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  No consumable types yet
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Add a type to start tracking stock
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 0.5 }}
                  startIcon={<Icon icon="material-symbols:add-rounded" />}
                  onClick={() => setAddTypeOpen(true)}
                >
                  Add Type
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {types.map(type => {
                  const isLow = type.isActive && type.lowStockThreshold != null && type.currentStock <= type.lowStockThreshold;
                  const stockColor = !type.isActive ? 'neutral' : isLow ? 'warning' : 'success';
                  const stockPct = type.lowStockThreshold
                    ? Math.min(100, Math.round((type.currentStock / (type.lowStockThreshold * 2)) * 100))
                    : null;

                  return (
                    <Paper
                      key={type.id}
                      background={1}
                      sx={{ p: 2.5, opacity: type.isActive ? 1 : 0.55 }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>

                        {/* Icon */}
                        <Avatar
                          variant="rounded"
                          sx={{ width: 44, height: 44, bgcolor: `${stockColor}.lighter`, borderRadius: 2, flexShrink: 0 }}
                        >
                          <Icon
                            icon="material-symbols:inventory-2-outline-rounded"
                            width={24}
                            color={`var(--mui-palette-${stockColor}-main)`}
                          />
                        </Avatar>

                        {/* Details */}
                        <Box flex={1} minWidth={0}>
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={700}>{type.name}</Typography>
                            {!type.isActive && <Chip label="Inactive" size="small" color="neutral" variant="soft" />}
                            {isLow && (
                              <Chip
                                label="Low Stock"
                                size="small"
                                color="warning"
                                variant="soft"
                                icon={<Icon icon="material-symbols:warning-outline-rounded" width={13} />}
                              />
                            )}
                          </Stack>

                          <Stack direction="row" alignItems="baseline" gap={0.75}>
                            <Typography variant="h5" fontWeight={700} lineHeight={1}>
                              {type.currentStock}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">{type.unit}</Typography>
                          </Stack>

                          {stockPct !== null && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={stockPct}
                                color={isLow ? 'warning' : 'success'}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Alert at {type.lowStockThreshold} {type.unit}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" gap={1} alignItems="center" sx={{ flexShrink: 0 }}>
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
                                icon={type.isActive ? 'material-symbols:toggle-on-rounded' : 'material-symbols:toggle-off-rounded'}
                                width={26}
                                color={type.isActive ? 'var(--mui-palette-success-main)' : undefined}
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
          </Box>
        )}

        {/* ── Issuances Tab ── */}
        {tab === 1 && (
          <Box>
            {/* Filter bar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              gap={1.5}
              sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <TextField
                size="small"
                placeholder="Search unit, consumable, issued by…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="material-symbols:search-rounded" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Icon
                        icon="material-symbols:close-rounded"
                        width={18}
                        style={{ cursor: 'pointer', opacity: 0.6 }}
                        onClick={() => setSearch('')}
                      />
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                select size="small" label="Consumable" value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)} sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All types</MenuItem>
                {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
              <TextField
                size="small" label="From" type="date" value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
              />
              <TextField
                size="small" label="To" type="date" value={toDate}
                onChange={e => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
              />
              {(fromDate || toDate || search || typeFilter) && (
                <Button
                  size="small"
                  onClick={() => { setSearch(''); setTypeFilter(''); setFromDate(''); setToDate(''); }}
                >
                  Clear
                </Button>
              )}
            </Stack>

            {filteredIssuances.length === 0 ? (
              <Stack alignItems="center" gap={1} sx={{ py: 8 }}>
                <Icon icon="material-symbols:search-off-rounded" width={40} style={{ opacity: 0.35 }} />
                <Typography variant="body2" color="text.disabled">No issuances found</Typography>
              </Stack>
            ) : (
              <DataGrid
                rows={filteredIssuances}
                columns={issuanceColumns}
                autoHeight
                pageSizeOptions={[20, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                disableRowSelectionOnClick
                sx={{ border: 0 }}
              />
            )}
          </Box>
        )}

        {/* ── Restock History Tab ── */}
        {tab === 2 && (
          <Box>
            {/* Filter bar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={1.5}
              sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <TextField
                size="small"
                placeholder="Search consumable, restocked by, notes…"
                value={restockSearch}
                onChange={e => setRestockSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="material-symbols:search-rounded" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: restockSearch ? (
                    <InputAdornment position="end">
                      <Icon
                        icon="material-symbols:close-rounded"
                        width={18}
                        style={{ cursor: 'pointer', opacity: 0.6 }}
                        onClick={() => setRestockSearch('')}
                      />
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                select size="small" label="Consumable" value={restockTypeFilter}
                onChange={e => setRestockTypeFilter(e.target.value)} sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All types</MenuItem>
                {types.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
              {(restockSearch || restockTypeFilter) && (
                <Button size="small" onClick={() => { setRestockSearch(''); setRestockTypeFilter(''); }}>
                  Clear
                </Button>
              )}
            </Stack>

            {filteredRestockLogs.length === 0 ? (
              <Stack alignItems="center" gap={1} sx={{ py: 8 }}>
                <Icon icon="material-symbols:history-rounded" width={40} style={{ opacity: 0.35 }} />
                <Typography variant="body2" color="text.disabled">No restock history found</Typography>
              </Stack>
            ) : (
              <DataGrid
                rows={filteredRestockLogs}
                columns={restockColumns}
                autoHeight
                pageSizeOptions={[20, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                disableRowSelectionOnClick
                sx={{ border: 0 }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <IssueDialog open={issueOpen} onClose={handleDialogClose} types={types} />
      <AddTypeDialog open={addTypeOpen} onClose={handleDialogClose} />
      <RestockDialog type={restockType} onClose={handleDialogClose} />
    </Box>
  );
}
