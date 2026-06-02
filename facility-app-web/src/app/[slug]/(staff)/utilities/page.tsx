'use client';

import { useState, useMemo } from 'react';
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
  MeterListItemDto,
  MeterReadingDto,
  PrepaidTokenDto,
  MeterAlertDto,
  UTILITY_TYPES,
  METER_MODES,
  READING_TYPES,
  ALERT_SEVERITIES,
  useGetAllMeters,
  useGetMeterReadings,
  useGetPrepaidTokens,
  useGetMeterAlerts,
  useAddReading,
  useAddToken,
  useAcknowledgeAlert,
} from 'services/swr/api-hooks/useMetersApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const UTILITY_COLORS: Record<number, string> = {
  0: 'warning',  // Electricity
  1: 'info',     // Water
  2: 'secondary',// Sewerage
  3: 'error',    // Gas
  4: 'success',  // Internet
  5: 'neutral',  // Other
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function utilityMeta(v: number) {
  return UTILITY_TYPES.find(u => u.value === v) ?? { label: 'Other', icon: 'material-symbols:settings-outline-rounded' };
}

// ── Log Reading Dialog ────────────────────────────────────────────────────────

function LogReadingDialog({ meter, open, onClose, onSaved }: {
  meter: MeterListItemDto | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [value, setValue]         = useState('');
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [type, setType]           = useState(1);
  const [notes, setNotes]         = useState('');
  const [err, setErr]             = useState('');
  const { trigger, isMutating }   = useAddReading();

  const handleSubmit = async () => {
    if (!meter || !value) { setErr('Reading value is required.'); return; }
    try {
      await trigger({ meterId: meter.id, value: Number(value), readingDate: date, readingType: type, notes: notes || null });
      setValue(''); setNotes(''); setErr('');
      onSaved(); onClose();
    } catch { setErr('Failed to log reading.'); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Log Reading — {meter?.meterNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <TextField label={`Value (${meter?.unitOfMeasure ?? 'units'})`} type="number" fullWidth size="small"
            value={value} onChange={e => setValue(e.target.value)} />
          <TextField label="Reading Date" type="date" fullWidth size="small"
            value={date} onChange={e => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} />
          <FormControl fullWidth size="small">
            <InputLabel>Reading Type</InputLabel>
            <Select value={type} label="Reading Type" onChange={e => setType(Number(e.target.value))}>
              {READING_TYPES.filter(t => t.value !== 0 && t.value !== 4).map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Notes" fullWidth size="small" multiline rows={2}
            value={notes} onChange={e => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isMutating}>
          {isMutating ? <CircularProgress size={16} /> : 'Log Reading'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Log Token Dialog ──────────────────────────────────────────────────────────

function LogTokenDialog({ meter, open, onClose, onSaved }: {
  meter: MeterListItemDto | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [code, setCode]           = useState('');
  const [amount, setAmount]       = useState('');
  const [units, setUnits]         = useState('');
  const [purchasedAt, setPurchasedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes]         = useState('');
  const [err, setErr]             = useState('');
  const { trigger, isMutating }   = useAddToken();

  const handleSubmit = async () => {
    if (!meter || !code.trim()) { setErr('Token code is required.'); return; }
    if (!amount) { setErr('Amount paid is required.'); return; }
    try {
      await trigger({
        meterId: meter.id, tokenCode: code.trim(), amountPaid: Number(amount),
        unitsLoaded: units ? Number(units) : null, purchasedAt, notes: notes || null,
      });
      setCode(''); setAmount(''); setUnits(''); setNotes(''); setErr('');
      onSaved(); onClose();
    } catch { setErr('Failed to log token.'); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Log Token — {meter?.meterNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <TextField label="Token Code" fullWidth size="small" value={code} onChange={e => setCode(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <TextField label="Amount Paid (KES)" type="number" fullWidth size="small" value={amount} onChange={e => setAmount(e.target.value)} />
            <TextField label={`Units (${meter?.unitOfMeasure ?? ''})`} type="number" fullWidth size="small" value={units} onChange={e => setUnits(e.target.value)} />
          </Stack>
          <TextField label="Purchase Date" type="date" fullWidth size="small"
            value={purchasedAt} onChange={e => setPurchasedAt(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Notes" fullWidth size="small" value={notes} onChange={e => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isMutating}>
          {isMutating ? <CircularProgress size={16} /> : 'Log Token'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Meter Detail Dialog ───────────────────────────────────────────────────────

function MeterDetailDialog({ meter, open, onClose, onReadingLogged }: {
  meter: MeterListItemDto | null; open: boolean; onClose: () => void; onReadingLogged: () => void;
}) {
  const [tab, setTab]             = useState(0);
  const [logReadingOpen, setLogReadingOpen] = useState(false);
  const [logTokenOpen, setLogTokenOpen]     = useState(false);

  const { data: readings = [], mutate: mutateReadings } = useGetMeterReadings(open ? meter?.id ?? null : null);
  const { data: tokens   = [], mutate: mutateTokens   } = useGetPrepaidTokens(
    open && meter?.meterModeValue === 1 ? meter.id : null,
  );
  const { data: alerts   = [], mutate: mutateAlerts   } = useGetMeterAlerts(open ? meter?.id ?? null : null);
  const { trigger: acknowledge } = useAcknowledgeAlert();

  const isPrepaid   = meter?.meterModeValue === 1;
  const activeAlerts = alerts.filter(a => !a.acknowledgedAt);
  const severityMeta = (s: string) => ALERT_SEVERITIES.find(x => x.label === s) ?? { color: 'neutral' };

  const handleAck = async (alertId: string) => {
    await acknowledge(alertId);
    mutateAlerts();
  };

  if (!meter) return null;

  const ut = utilityMeta(meter.utilityValue);
  const color = UTILITY_COLORS[meter.utilityValue] ?? 'neutral';

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: `${color}.lighter`, borderRadius: 2 }} variant="rounded">
              <IconifyIcon icon={ut.icon} sx={{ color: `${color}.main` }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{meter.meterNumber}</Typography>
                <Chip label={meter.utilityType} color={color as any} variant="soft" size="small" />
                <Chip label={meter.meterMode} color="neutral" variant="soft" size="small" />
                {!meter.isActive && <Chip label="Retired" color="error" variant="soft" size="small" />}
                {activeAlerts.length > 0 && (
                  <Chip label={`${activeAlerts.length} Alert${activeAlerts.length > 1 ? 's' : ''}`} color="error" variant="soft" size="small" />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Unit {meter.block ? `${meter.block} · ` : ''}{meter.unitNumber}
                {meter.location ? ` · ${meter.location}` : ''}
              </Typography>
            </Box>
            {meter.isActive && (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined"
                  startIcon={<IconifyIcon icon="material-symbols:edit-square-outline-rounded" />}
                  onClick={() => setLogReadingOpen(true)}>
                  Log Reading
                </Button>
                {isPrepaid && (
                  <Button size="small" variant="outlined"
                    startIcon={<IconifyIcon icon="material-symbols:token-outline-rounded" />}
                    onClick={() => setLogTokenOpen(true)}>
                    Log Token
                  </Button>
                )}
              </Stack>
            )}
            <IconButton onClick={onClose}><IconifyIcon icon="material-symbols:close-rounded" /></IconButton>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 3, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tab label="Details" />
          <Tab label={`Readings (${readings.length})`} />
          {isPrepaid && <Tab label={`Tokens (${tokens.length})`} />}
          <Tab label={`Alerts${activeAlerts.length > 0 ? ` (${activeAlerts.length})` : ''}`} />
        </Tabs>

        <Box sx={{ overflowY: 'auto', p: 3 }}>
          {/* Details */}
          {tab === 0 && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                {[
                  ['Serial No.', meter.serialNumber],
                  ['Unit of Measure', meter.unitOfMeasure],
                  ['Installed', fmt(meter.installDate)],
                  ['Retired', fmt(meter.retiredAt)],
                ].filter(r => r[1]).map(([label, val]) => (
                  <Box key={label!}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2">{val}</Typography>
                  </Box>
                ))}
              </Stack>
              {meter.latestReading && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Latest Reading</Typography>
                    <Typography variant="body2">
                      {meter.latestReading.readingValue} {meter.unitOfMeasure} — {fmt(meter.latestReading.readingDate)}
                    </Typography>
                  </Box>
                </>
              )}
              <Divider />
              <Typography variant="body2" color="text.secondary">
                {meter.readingCount} reading{meter.readingCount !== 1 ? 's' : ''} logged
              </Typography>
            </Stack>
          )}

          {/* Readings */}
          {tab === 1 && (
            <Stack spacing={1}>
              {readings.length === 0 && (
                <Typography variant="body2" color="text.secondary">No readings logged yet.</Typography>
              )}
              {readings.map((r: MeterReadingDto) => (
                <Paper key={r.id} sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip label={r.readingType} size="small" color="neutral" variant="soft" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {r.readingValue} {meter.unitOfMeasure}
                      </Typography>
                      {r.isVerified && (
                        <Chip label="Verified" size="small" color="success" variant="soft" />
                      )}
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">{fmt(r.readingDate)}</Typography>
                      {r.readBy && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          by {r.readBy}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {r.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {r.notes}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )}

          {/* Tokens */}
          {isPrepaid && tab === 2 && (
            <Stack spacing={1}>
              {tokens.length === 0 && (
                <Typography variant="body2" color="text.secondary">No tokens logged yet.</Typography>
              )}
              {tokens.map((t: PrepaidTokenDto) => (
                <Paper key={t.id} sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {t.tokenCode}
                      </Typography>
                      {t.unitsLoaded && (
                        <Typography variant="caption" color="text.secondary">
                          {t.unitsLoaded} {meter.unitOfMeasure} loaded
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>KES {t.amountPaid.toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">{fmt(t.purchasedAt)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Alerts */}
          {tab === (isPrepaid ? 3 : 2) && (
            <Stack spacing={1}>
              {alerts.length === 0 && (
                <Typography variant="body2" color="text.secondary">No alerts on record.</Typography>
              )}
              {alerts.map((a: MeterAlertDto) => {
                const sev = severityMeta(a.severity);
                return (
                  <Paper key={a.id} sx={{ p: 2, opacity: a.acknowledgedAt ? 0.55 : 1 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={a.severity} size="small" color={sev.color as any} variant="soft" />
                          <Chip label={a.alertType} size="small" color="neutral" variant="soft" />
                        </Stack>
                        <Typography variant="body2">{a.message}</Typography>
                        <Typography variant="caption" color="text.secondary">{fmt(a.triggeredAt)}</Typography>
                        {a.acknowledgedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Acknowledged {fmt(a.acknowledgedAt)} by {a.acknowledgedBy}
                          </Typography>
                        )}
                      </Stack>
                      {!a.acknowledgedAt && (
                        <Tooltip title="Acknowledge">
                          <IconButton size="small" color="success" onClick={() => handleAck(a.id)}>
                            <IconifyIcon icon="material-symbols:check-circle-outline-rounded" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      </Dialog>

      <LogReadingDialog
        meter={meter} open={logReadingOpen}
        onClose={() => setLogReadingOpen(false)}
        onSaved={() => { mutateReadings(); onReadingLogged(); }}
      />
      <LogTokenDialog
        meter={meter} open={logTokenOpen}
        onClose={() => setLogTokenOpen(false)}
        onSaved={() => mutateTokens()}
      />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UtilitiesPage() {
  const { data: allMeters = [], mutate, isLoading } = useGetAllMeters();
  const [utilityFilter, setUtilityFilter] = useState<number | 'all'>('all');
  const [statusFilter,  setStatusFilter]  = useState<'all' | 'active' | 'retired'>('active');
  const [search, setSearch]               = useState('');
  const [selectedMeter, setSelectedMeter] = useState<MeterListItemDto | null>(null);
  const [logReadingMeter, setLogReadingMeter] = useState<MeterListItemDto | null>(null);

  const filtered = useMemo(() => {
    let rows = allMeters;
    if (utilityFilter !== 'all') rows = rows.filter(m => m.utilityValue === utilityFilter);
    if (statusFilter === 'active')  rows = rows.filter(m => m.isActive);
    if (statusFilter === 'retired') rows = rows.filter(m => !m.isActive);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(m =>
        m.meterNumber.toLowerCase().includes(q) ||
        m.unitNumber.toLowerCase().includes(q) ||
        (m.block ?? '').toLowerCase().includes(q) ||
        (m.serialNumber ?? '').toLowerCase().includes(q),
      );
    }
    return rows;
  }, [allMeters, utilityFilter, statusFilter, search]);

  const active   = allMeters.filter(m => m.isActive).length;
  const retired  = allMeters.length - active;
  const alerts   = allMeters.reduce((s, m) => s + m.unacknowledgedAlerts, 0);

  const columns: GridColDef<MeterListItemDto>[] = [
    {
      field: 'unitNumber',
      headerName: 'Unit',
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {row.block ? `${row.block} · ` : ''}{row.unitNumber}
        </Typography>
      ),
    },
    {
      field: 'meterNumber',
      headerName: 'Meter No.',
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (
        <Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.meterNumber}</Typography>
          {row.serialNumber && (
            <Typography variant="caption" color="text.secondary">S/N: {row.serialNumber}</Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'utilityType',
      headerName: 'Utility',
      width: 130,
      renderCell: ({ row }) => {
        const ut = utilityMeta(row.utilityValue);
        const col = UTILITY_COLORS[row.utilityValue] ?? 'neutral';
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconifyIcon icon={ut.icon} sx={{ fontSize: 16, color: `${col}.main` }} />
            <Chip label={row.utilityType} size="small" color={col as any} variant="soft" />
          </Stack>
        );
      },
    },
    {
      field: 'meterMode',
      headerName: 'Mode',
      width: 130,
      renderCell: ({ row }) => <Chip label={row.meterMode} size="small" color="neutral" variant="soft" />,
    },
    {
      field: 'latestReading',
      headerName: 'Last Reading',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => row.latestReading ? (
        <Stack>
          <Typography variant="body2">
            {row.latestReading.readingValue} {row.unitOfMeasure}
          </Typography>
          <Typography variant="caption" color="text.secondary">{fmt(row.latestReading.readingDate)}</Typography>
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">No readings</Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: ({ row }) => (
        <Stack spacing={0.5}>
          <Chip
            label={row.isActive ? 'Active' : 'Retired'}
            color={row.isActive ? 'success' : 'neutral'}
            variant="soft" size="small"
          />
          {row.unacknowledgedAlerts > 0 && (
            <Chip label={`${row.unacknowledgedAlerts} alert`} color="error" variant="soft" size="small" />
          )}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} onClick={e => e.stopPropagation()}>
          {row.isActive && (
            <Tooltip title="Log Reading">
              <IconButton size="small" onClick={() => setLogReadingMeter(row)}>
                <IconifyIcon icon="material-symbols:edit-square-outline-rounded" sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setSelectedMeter(row)}>
              <IconifyIcon icon="material-symbols:chevron-right-rounded" sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Utilities & Meters</Typography>
          <Typography variant="body2" color="text.secondary">
            Track electricity, water and other utility meters across all units
          </Typography>
        </Box>
        {/* KPIs */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`${allMeters.length} Total`}  color="neutral" variant="soft" />
          <Chip label={`${active} Active`}            color="success" variant="soft" />
          {retired > 0 && <Chip label={`${retired} Retired`} color="neutral" variant="soft" />}
          {alerts > 0  && <Chip label={`${alerts} Alert${alerts > 1 ? 's' : ''}`} color="error" variant="soft" />}
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small" placeholder="Search meter, unit…"
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="material-symbols:search-rounded" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Utility</InputLabel>
            <Select value={utilityFilter} label="Utility"
              onChange={e => setUtilityFilter(e.target.value as any)}>
              <MenuItem value="all">All Types</MenuItem>
              {UTILITY_TYPES.map(u => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={e => setStatusFilter(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Grid */}
      <DataGrid
        rows={filtered}
        columns={columns}
        loading={isLoading}
        getRowId={r => r.id}
        autoHeight
        onRowClick={({ row }) => setSelectedMeter(row)}
        sx={{ cursor: 'pointer', bgcolor: 'background.paper', borderRadius: 2 }}
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        getRowHeight={() => 'auto'}
        sx={{
          cursor: 'pointer',
          bgcolor: 'background.paper',
          borderRadius: 2,
          '& .MuiDataGrid-cell': { py: 1 },
        }}
      />

      {/* Meter detail dialog */}
      <MeterDetailDialog
        meter={selectedMeter}
        open={!!selectedMeter}
        onClose={() => setSelectedMeter(null)}
        onReadingLogged={() => mutate()}
      />

      {/* Quick log reading from table row */}
      <LogReadingDialog
        meter={logReadingMeter}
        open={!!logReadingMeter}
        onClose={() => setLogReadingMeter(null)}
        onSaved={() => { mutate(); setLogReadingMeter(null); }}
      />
    </Box>
  );
}
