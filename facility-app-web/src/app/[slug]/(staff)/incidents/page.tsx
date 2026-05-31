'use client';

import { useState } from 'react';
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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetIncidents, useCreateIncident, useUpdateIncidentStatus, useDeleteIncident,
  type IncidentDto,
  INCIDENT_CATEGORIES, INCIDENT_SEVERITIES, INCIDENT_STATUSES,
} from 'services/swr/api-hooks/useIncidentsApi';

const catMeta      = (v: number) => INCIDENT_CATEGORIES.find(c => c.value === v)  ?? { label: String(v), icon: 'material-symbols:warning-outline-rounded', color: 'neutral' as const };
const severityMeta = (v: number) => INCIDENT_SEVERITIES.find(s => s.value === v)  ?? { label: String(v), color: 'neutral' as const };
const statusMeta   = (v: number) => INCIDENT_STATUSES.find(s => s.value === v)    ?? { label: String(v), color: 'neutral' as const };

const EMPTY = { title: '', description: '', location: '', involvedParties: '', category: 0, severity: 1 };

export default function IncidentsPage() {
  const [logOpen, setLogOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY);
  const [formErr, setFormErr]       = useState('');
  const [selected, setSelected]     = useState<IncidentDto | null>(null);
  const [newStatus, setNewStatus]   = useState(0);
  const [resolution, setResolution] = useState('');
  const [saving, setSaving]         = useState(false);

  const { data: rows = [], mutate }   = useGetIncidents();
  const { trigger: create, isMutating: creating } = useCreateIncident();
  const { trigger: updateStatus }     = useUpdateIncidentStatus();
  const { trigger: del }              = useDeleteIncident();

  const openCount = rows.filter(r => r.status === 0 || r.status === 1).length;

  const openDrawer = (row: IncidentDto) => {
    setSelected(row);
    setNewStatus(row.status);
    setResolution(row.resolutionNotes ?? '');
  };

  const handleCreate = async () => {
    if (!form.title.trim())       { setFormErr('Title is required.'); return; }
    if (!form.description.trim()) { setFormErr('Description is required.'); return; }
    if (!form.location.trim())    { setFormErr('Location is required.'); return; }
    try {
      await create({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        involvedParties: form.involvedParties.trim() || null,
        category: form.category,
        severity: form.severity,
      });
      await mutate();
      setLogOpen(false);
      setForm(EMPTY);
      setFormErr('');
    } catch { setFormErr('Failed to log incident. Please try again.'); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateStatus({ id: selected.id, status: newStatus, resolutionNotes: resolution || null });
      await mutate();
      setSelected(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this incident report?')) return;
    await del(id);
    await mutate();
    if (selected?.id === id) setSelected(null);
  };

  const columns: GridColDef<IncidentDto>[] = [
    {
      field: 'title',
      headerName: 'Incident',
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: `${catMeta(row.category).color}.lighter`, borderRadius: 1 }}>
            <IconifyIcon icon={catMeta(row.category).icon} sx={{ fontSize: 18, color: `${catMeta(row.category).color}.main` }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>{row.title}</Typography>
            <Typography variant="caption" color="text.secondary">{catMeta(row.category).label}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">{row.location}</Typography>
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      renderCell: ({ row }) => {
        const m = severityMeta(row.severity);
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
      field: 'reportedBy',
      headerName: 'Reported By',
      flex: 1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2">{row.reportedBy?.fullName ?? '—'}</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(row.reportedAt).toLocaleDateString()}</Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View & Update">
            <Button size="small" variant="soft" color="primary" onClick={() => openDrawer(row)}
              sx={{ minWidth: 0, px: 1 }}>
              <IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button size="small" variant="soft" color="error" onClick={() => handleDelete(row.id)}
              sx={{ minWidth: 0, px: 1 }}>
              <IconifyIcon icon="material-symbols:delete-outline-rounded" sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Incidents</Typography>
          <Typography variant="body2" color="text.secondary">Log and track security, safety, and operational incidents</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {openCount > 0 && <Chip label={`${openCount} Active`} color="error" variant="soft" />}
          <Button variant="contained" color="error"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={() => { setForm(EMPTY); setFormErr(''); setLogOpen(true); }}>
            Log Incident
          </Button>
        </Stack>
      </Stack>

      {/* Grid */}
      <Paper sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          disableColumnMenu
        />
      </Paper>

      {/* Log Incident Dialog */}
      <Dialog open={logOpen} onClose={() => setLogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Incident</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {formErr && <Typography color="error" variant="body2">{formErr}</Typography>}
            <TextField label="Title *" fullWidth value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Location *" fullWidth value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Lobby, Unit 4B, Parking Level 2" />
            <TextField label="Description *" fullWidth multiline rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <TextField label="Involved Parties" fullWidth value={form.involvedParties}
              onChange={e => setForm(f => ({ ...f, involvedParties: e.target.value }))}
              placeholder="Names or descriptions of people involved" />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category"
                  onChange={e => setForm(f => ({ ...f, category: Number(e.target.value) }))}>
                  {INCIDENT_CATEGORIES.map(c => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select value={form.severity} label="Severity"
                  onChange={e => setForm(f => ({ ...f, severity: Number(e.target.value) }))}>
                  {INCIDENT_SEVERITIES.map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCreate} disabled={creating}>
            Log Incident
          </Button>
        </DialogActions>
      </Dialog>

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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Incident Detail</Typography>
              <Button size="small" onClick={() => setSelected(null)}>
                <IconifyIcon icon="material-symbols:close-rounded" />
              </Button>
            </Stack>
            <Divider />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={catMeta(selected.category).label}      color={catMeta(selected.category).color}      variant="soft" size="small" />
                <Chip label={severityMeta(selected.severity).label}  color={severityMeta(selected.severity).color}  variant="soft" size="small" />
                <Chip label={statusMeta(selected.status).label}      color={statusMeta(selected.status).color}      variant="soft" size="small" />
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selected.description}</Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="subtitle2">{selected.location}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reported By</Typography>
                  <Typography variant="subtitle2">{selected.reportedBy?.fullName ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(selected.reportedAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
              {selected.involvedParties && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Involved Parties</Typography>
                  <Typography variant="body2">{selected.involvedParties}</Typography>
                </Box>
              )}
              {selected.resolvedBy && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Resolved By</Typography>
                  <Typography variant="subtitle2">{selected.resolvedBy.fullName}</Typography>
                  {selected.resolvedAt && (
                    <Typography variant="caption" color="text.secondary">{new Date(selected.resolvedAt).toLocaleString()}</Typography>
                  )}
                </Box>
              )}
            </Stack>

            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Update Status</Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} label="Status" onChange={e => setNewStatus(Number(e.target.value))}>
                {INCIDENT_STATUSES.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Resolution Notes"
              multiline
              rows={3}
              fullWidth
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="Describe how the incident was handled..."
            />

            <Button variant="contained" fullWidth onClick={handleUpdate} disabled={saving}>
              Save Changes
            </Button>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
