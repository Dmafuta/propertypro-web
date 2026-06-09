'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
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
  useGetMaintenance, useUpdateMaintenanceStatus,
  type MaintenanceDto,
  MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES,
} from 'services/swr/api-hooks/useMaintenanceApi';

const STATUS_TABS = [
  { label: 'All',         value: -1 },
  { label: 'Open',        value: 0 },
  { label: 'In Progress', value: 1 },
  { label: 'Resolved',    value: 2 },
  { label: 'Closed',      value: 3 },
];

const statusMeta   = (v: number) => MAINTENANCE_STATUSES.find(s => s.value === v)  ?? { label: String(v), color: 'neutral' as const };
const priorityMeta = (v: number) => MAINTENANCE_PRIORITIES.find(p => p.value === v) ?? { label: String(v), color: 'neutral' as const };
const categoryMeta = (v: number) => MAINTENANCE_CATEGORIES.find(c => c.value === v) ?? { label: String(v), icon: 'material-symbols:build-outline-rounded' };

const KPI_CARDS = [
  { label: 'Total',       color: 'primary', icon: 'material-symbols:build-outline-rounded',          tabIdx: 0, filter: (_: MaintenanceDto) => true },
  { label: 'Open',        color: 'warning', icon: 'material-symbols:pending-actions-outline-rounded', tabIdx: 1, filter: (r: MaintenanceDto) => r.status === 0 },
  { label: 'In Progress', color: 'info',    icon: 'material-symbols:autorenew-rounded',               tabIdx: 2, filter: (r: MaintenanceDto) => r.status === 1 },
  { label: 'Resolved',    color: 'success', icon: 'material-symbols:check-circle-outline-rounded',    tabIdx: 3, filter: (r: MaintenanceDto) => r.status === 2 || r.status === 3 },
] as const;

export default function MaintenancePage() {
  const [tabIdx, setTabIdx]   = useState(0);
  const [selected, setSelected] = useState<MaintenanceDto | null>(null);
  const [newStatus, setNewStatus] = useState<number>(0);
  const [staffNote, setStaffNote] = useState('');
  const [saving, setSaving]     = useState(false);

  const statusFilter = STATUS_TABS[tabIdx].value;
  const { data: rows = [], mutate }  = useGetMaintenance(statusFilter === -1 ? undefined : statusFilter);
  const { data: allRows = [] }       = useGetMaintenance(undefined);
  const { trigger: updateStatus }    = useUpdateMaintenanceStatus();

  const openDrawer = (row: MaintenanceDto) => {
    setSelected(row);
    setNewStatus(row.status);
    setStaffNote(row.staffNote ?? '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateStatus({ id: selected.id, status: newStatus, staffNote: staffNote || null });
      await mutate();
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef<MaintenanceDto>[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <IconifyIcon icon={categoryMeta(row.category).icon} sx={{ fontSize: 18, color: 'primary.main' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>{row.title}</Typography>
            <Typography variant="caption" color="text.secondary">{categoryMeta(row.category).label}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'resident',
      headerName: 'Resident',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2">{row.resident?.fullName ?? '—'}</Typography>
          {row.unit && <Typography variant="caption" color="text.secondary">Unit {row.unit.unitNumber}</Typography>}
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: ({ row }) => {
        const m = priorityMeta(row.priority);
        return <Chip label={m.label} color={m.color} variant="soft" size="small" />;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: ({ row }) => {
        const m = statusMeta(row.status);
        return <Chip label={m.label} color={m.color} variant="soft" size="small" />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 130,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="View & Update">
          <Button size="small" variant="soft" color="primary" onClick={() => openDrawer(row)}
            sx={{ minWidth: 0, px: 1.5 }}>
            <IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'warning.lighter', borderRadius: 2 }}>
            <IconifyIcon icon="material-symbols:build-outline-rounded" sx={{ fontSize: 28, color: 'warning.main' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Maintenance</Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage maintenance requests from residents
            </Typography>
          </Box>
        </Stack>
        {allRows.filter(r => r.status === 0).length > 0 && (
          <Chip
            label={`${allRows.filter(r => r.status === 0).length} Open`}
            color="warning"
            variant="soft"
            icon={<IconifyIcon icon="material-symbols:pending-actions-outline-rounded" />}
          />
        )}
      </Stack>

      {/* KPI cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {KPI_CARDS.map(({ label, color, icon, tabIdx: ti, filter }) => {
          const isActive = tabIdx === ti;
          const count = allRows.filter(filter).length;
          return (
            <Grid key={label} size={{ xs: 6, md: 3 }}>
              <Paper
                onClick={() => setTabIdx(ti)}
                sx={{
                  p: 2.5, cursor: 'pointer', height: 1,
                  border: '2px solid',
                  borderColor: isActive ? `${color}.main` : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: `${color}.light`, transform: 'translateY(-1px)', boxShadow: 3 },
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                  <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: `${color}.lighter`, borderRadius: 1.5 }}>
                    <IconifyIcon icon={icon} sx={{ fontSize: 22, color: `${color}.main` }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{count}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Table card */}
      <Paper>
        <Box sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)}>
            {STATUS_TABS.map((t, i) => <Tab key={t.label} label={t.label} value={i} />)}
          </Tabs>
        </Box>
        {rows.length === 0 ? (
          <Stack alignItems="center" gap={2} sx={{ py: 8 }}>
            <Avatar variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'background.elevation2', borderRadius: 3 }}>
              <IconifyIcon icon="material-symbols:build-outline-rounded" sx={{ fontSize: 36, color: 'text.disabled' }} />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">No requests found</Typography>
          </Stack>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{ border: 0 }}
          />
        )}
      </Paper>

      {/* Detail / Update Drawer */}
      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selected && (
          <Stack spacing={3}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Request Detail</Typography>
              <Button size="small" onClick={() => setSelected(null)}>
                <IconifyIcon icon="material-symbols:close-rounded" />
              </Button>
            </Stack>

            <Divider />

            {/* Meta */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={categoryMeta(selected.category).label}  color="primary" variant="soft" size="small" />
                <Chip label={priorityMeta(selected.priority).label}  color={priorityMeta(selected.priority).color} variant="soft" size="small" />
                <Chip label={statusMeta(selected.status).label}      color={statusMeta(selected.status).color}   variant="soft" size="small" />
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selected.description}</Typography>

              <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Resident</Typography>
                  <Typography variant="subtitle2">{selected.resident?.fullName ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{selected.resident?.email}</Typography>
                </Box>
                {selected.unit && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Unit</Typography>
                    <Typography variant="subtitle2">{selected.unit.unitNumber}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Submitted</Typography>
                  <Typography variant="subtitle2">{new Date(selected.createdAt).toLocaleDateString()}</Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Update Status</Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} label="Status" onChange={e => setNewStatus(Number(e.target.value))}>
                {MAINTENANCE_STATUSES.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Staff Note"
              multiline
              rows={3}
              fullWidth
              value={staffNote}
              onChange={e => setStaffNote(e.target.value)}
              placeholder="Add a note for the resident..."
            />

            {selected.staffNote && selected.staffNote !== staffNote && (
              <Paper background={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Previous note</Typography>
                <Typography variant="body2">{selected.staffNote}</Typography>
              </Paper>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleSave}
              disabled={saving}
            >
              Save Changes
            </Button>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
