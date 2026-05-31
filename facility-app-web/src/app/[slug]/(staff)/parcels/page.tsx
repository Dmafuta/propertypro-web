'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetParcels, useReceiveParcel, useCollectParcel, useReturnParcel,
  type ParcelDto, PARCEL_STATUSES,
} from 'services/swr/api-hooks/useParcelsApi';

const STATUS_TABS = [
  { label: 'All',       value: -1 },
  { label: 'Pending',   value: 0 },
  { label: 'Collected', value: 1 },
  { label: 'Returned',  value: 2 },
];

const statusMeta = (v: number) => PARCEL_STATUSES.find(s => s.value === v) ?? { label: String(v), color: 'neutral' as const };

const EMPTY_FORM = { unitId: '', recipientName: '', courierName: '', description: '', notes: '' };

export default function ParcelsPage() {
  const [tabIdx, setTabIdx]         = useState(0);
  const [logOpen, setLogOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState('');
  const [selected, setSelected]     = useState<ParcelDto | null>(null);
  const [collectName, setCollectName] = useState('');
  const [collectOpen, setCollectOpen] = useState(false);
  const [actionRow, setActionRow]   = useState<ParcelDto | null>(null);

  const statusFilter = STATUS_TABS[tabIdx].value;
  const { data: rows = [], mutate } = useGetParcels(statusFilter === -1 ? undefined : statusFilter);
  const { trigger: receive, isMutating: receiving } = useReceiveParcel();
  const { trigger: collect, isMutating: collecting } = useCollectParcel();
  const { trigger: returnParcel, isMutating: returning } = useReturnParcel();

  const pending   = rows.filter(r => r.status === 0).length;

  const handleLog = async () => {
    if (!form.recipientName.trim()) { setFormErr('Recipient name is required.'); return; }
    if (!form.description.trim())   { setFormErr('Description is required.'); return; }
    try {
      await receive({
        unitId:        form.unitId.trim() || null,
        recipientName: form.recipientName.trim(),
        courierName:   form.courierName.trim() || null,
        description:   form.description.trim(),
        notes:         form.notes.trim() || null,
      });
      await mutate();
      setLogOpen(false);
      setForm(EMPTY_FORM);
      setFormErr('');
    } catch { setFormErr('Failed to log parcel. Please try again.'); }
  };

  const openCollect = (row: ParcelDto) => { setActionRow(row); setCollectName(''); setCollectOpen(true); };
  const handleCollect = async () => {
    if (!actionRow || !collectName.trim()) return;
    await collect({ id: actionRow.id, collectedByName: collectName.trim() });
    await mutate();
    setCollectOpen(false);
    if (selected?.id === actionRow.id) setSelected(null);
  };

  const handleReturn = async (row: ParcelDto) => {
    await returnParcel(row.id);
    await mutate();
    if (selected?.id === row.id) setSelected(null);
  };

  const columns: GridColDef<ParcelDto>[] = [
    {
      field: 'recipientName',
      headerName: 'Recipient',
      flex: 1,
      minWidth: 160,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.recipientName}</Typography>
          {row.unit && <Typography variant="caption" color="text.secondary">Unit {row.unit.unitNumber}</Typography>}
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary" sx={{ lineClamp: 1 }}>{row.description}</Typography>
      ),
    },
    {
      field: 'courierName',
      headerName: 'Courier',
      width: 130,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{row.courierName ?? '—'}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ row }) => {
        const m = statusMeta(row.status);
        return <Chip label={m.label} color={m.color} variant="soft" size="small" />;
      },
    },
    {
      field: 'receivedAt',
      headerName: 'Received',
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">
          {new Date(row.receivedAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'collectedByName',
      headerName: 'Collected By',
      width: 150,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{row.collectedByName ?? '—'}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View detail">
            <Button size="small" variant="soft" color="primary" onClick={() => setSelected(row)}
              sx={{ minWidth: 0, px: 1 }}>
              <IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          {row.status === 0 && (
            <>
              <Tooltip title="Mark collected">
                <Button size="small" variant="soft" color="success" onClick={() => openCollect(row)}
                  sx={{ minWidth: 0, px: 1 }}>
                  <IconifyIcon icon="material-symbols:check-circle-outline-rounded" sx={{ fontSize: 16 }} />
                </Button>
              </Tooltip>
              <Tooltip title="Mark returned">
                <Button size="small" variant="soft" color="neutral" onClick={() => handleReturn(row)}
                  sx={{ minWidth: 0, px: 1 }} disabled={returning}>
                  <IconifyIcon icon="material-symbols:undo-rounded" sx={{ fontSize: 16 }} />
                </Button>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Parcels & Deliveries</Typography>
          <Typography variant="body2" color="text.secondary">Log incoming parcels and track collection status</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {pending > 0 && <Chip label={`${pending} Pending`} color="warning" variant="soft" />}
          <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={() => { setForm(EMPTY_FORM); setFormErr(''); setLogOpen(true); }}>
            Log Parcel
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 3 }}>
        {STATUS_TABS.map((t, i) => <Tab key={t.label} label={t.label} value={i} />)}
      </Tabs>

      {/* Grid */}
      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          disableColumnMenu
        />
      </Paper>

      {/* Log Parcel Dialog */}
      <Dialog open={logOpen} onClose={() => setLogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Incoming Parcel</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {formErr && <Typography color="error" variant="body2">{formErr}</Typography>}
            <TextField label="Recipient Name *" fullWidth value={form.recipientName}
              onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} />
            <TextField label="Unit Number / ID" fullWidth value={form.unitId}
              onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
              placeholder="Leave blank if unknown" />
            <TextField label="Description *" fullWidth value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Small box, Amazon package" />
            <TextField label="Courier / Sender" fullWidth value={form.courierName}
              onChange={e => setForm(f => ({ ...f, courierName: e.target.value }))}
              placeholder="e.g. DHL, FedEx" />
            <TextField label="Notes" fullWidth multiline rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLog} disabled={receiving}>Log Parcel</Button>
        </DialogActions>
      </Dialog>

      {/* Collect Dialog */}
      <Dialog open={collectOpen} onClose={() => setCollectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark as Collected</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Parcel for <strong>{actionRow?.recipientName}</strong>
            </Typography>
            <TextField label="Collected By *" fullWidth value={collectName}
              onChange={e => setCollectName(e.target.value)}
              placeholder="Name of person who collected" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCollectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleCollect}
            disabled={!collectName.trim() || collecting}>
            Confirm Collection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}
      >
        {selected && (
          <Stack spacing={3}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Parcel Detail</Typography>
              <Button size="small" onClick={() => setSelected(null)}>
                <IconifyIcon icon="material-symbols:close-rounded" />
              </Button>
            </Stack>
            <Divider />
            <Stack spacing={2}>
              <Chip label={statusMeta(selected.status).label} color={statusMeta(selected.status).color} variant="soft" sx={{ alignSelf: 'flex-start' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Recipient</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selected.recipientName}</Typography>
              </Box>
              {selected.unit && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Unit</Typography>
                  <Typography variant="subtitle2">{selected.unit.unitNumber}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="subtitle2">{selected.description}</Typography>
              </Box>
              {selected.courierName && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Courier</Typography>
                  <Typography variant="subtitle2">{selected.courierName}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Received By</Typography>
                <Typography variant="subtitle2">{selected.receivedBy?.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(selected.receivedAt).toLocaleString()}</Typography>
              </Box>
              {selected.collectedByName && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Collected By</Typography>
                  <Typography variant="subtitle2">{selected.collectedByName}</Typography>
                  {selected.collectedAt && (
                    <Typography variant="caption" color="text.secondary">{new Date(selected.collectedAt).toLocaleString()}</Typography>
                  )}
                </Box>
              )}
              {selected.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{selected.notes}</Typography>
                </Box>
              )}
            </Stack>
            {selected.status === 0 && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Button variant="contained" color="success" fullWidth
                    onClick={() => { openCollect(selected); }}>
                    Mark as Collected
                  </Button>
                  <Button variant="soft" color="neutral" fullWidth
                    onClick={() => handleReturn(selected)} disabled={returning}>
                    Mark as Returned
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
