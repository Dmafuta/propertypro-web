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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetUnitTypes, useCreateUnitType, useUpdateUnitType,
  useToggleUnitType, useDeleteUnitType, type UnitTypeDto, type UnitTypePayload,
} from 'services/swr/api-hooks/useUnitTypesApi';

const EMPTY: UnitTypePayload = { name: '', description: null, defaultMonthlyLevy: null, defaultBedrooms: null, defaultBathrooms: null };

export default function UnitTypesPage() {
  const { palette } = useTheme();
  const { data: types = [], mutate } = useGetUnitTypes();
  const { trigger: create, isMutating: creating } = useCreateUnitType();
  const { trigger: update, isMutating: updating } = useUpdateUnitType();
  const { trigger: toggle } = useToggleUnitType();
  const { trigger: del } = useDeleteUnitType();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UnitTypeDto | null>(null);
  const [form, setForm] = useState<UnitTypePayload>(EMPTY);
  const [err, setErr] = useState('');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErr(''); setOpen(true); };
  const openEdit = (t: UnitTypeDto) => { setEditing(t); setForm({ name: t.name, description: t.description, defaultMonthlyLevy: t.defaultMonthlyLevy, defaultBedrooms: t.defaultBedrooms, defaultBathrooms: t.defaultBathrooms }); setErr(''); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    try {
      if (editing) await update({ id: editing.id, ...form });
      else await create(form);
      await mutate();
      setOpen(false);
    } catch { setErr('Failed to save. Please try again.'); }
  };

  const handleToggle = async (id: string) => { await toggle(id); await mutate(); };
  const handleDelete = async (id: string) => {
    try { await del(id); await mutate(); } catch { alert('Cannot delete a unit type that has units assigned.'); }
  };

  const active = types.filter(t => t.isActive);
  const inactive = types.filter(t => !t.isActive);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Unit Types</Typography>
          <Typography variant="body2" color="text.secondary">
            Define the categories of units in your property (e.g. Studio, 1-Bed, Commercial)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:add-rounded" />} onClick={openCreate}>
          Add Type
        </Button>
      </Stack>

      {/* Summary chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <Chip label={`${types.length} Total`} color="neutral" variant="soft" />
        <Chip label={`${active.length} Active`} color="success" variant="soft" />
        {inactive.length > 0 && <Chip label={`${inactive.length} Inactive`} color="neutral" variant="soft" />}
      </Stack>

      {types.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.lighter', mx: 'auto', mb: 2 }}>
            <IconifyIcon icon="material-symbols:category-outline-rounded" sx={{ fontSize: 32, color: 'primary.main' }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No unit types yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Define types like Studio, 1-Bed, 2-Bed, Commercial to categorise your units.
          </Typography>
          <Button variant="contained" onClick={openCreate}>Add First Type</Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        {types.map(t => (
          <Grid item xs={12} sm={6} md={4} key={t.id}>
            <Paper sx={{ p: 3, height: 1, opacity: t.isActive ? 1 : 0.6, position: 'relative' }}>
              <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'primary.lighter', borderRadius: 2 }}>
                  <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ color: 'primary.main' }} />
                </Avatar>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t.isActive ? 'Deactivate' : 'Activate'}>
                    <IconButton size="small" onClick={() => handleToggle(t.id)}>
                      <IconifyIcon icon={t.isActive ? 'material-symbols:toggle-on-rounded' : 'material-symbols:toggle-off-outline-rounded'}
                        sx={{ color: t.isActive ? 'success.main' : 'text.disabled' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(t)}>
                      <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t.isActive ? 'Deactivate before deleting' : 'Delete'}>
                    <span>
                      <IconButton size="small" disabled={t.isActive} onClick={() => handleDelete(t.id)} color="error">
                        <IconifyIcon icon="material-symbols:delete-outline-rounded" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{t.name}</Typography>
              {t.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t.description}</Typography>}

              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {t.defaultMonthlyLevy != null && (
                  <Chip size="small" label={`Levy: ${t.defaultMonthlyLevy.toLocaleString()}`} color="primary" variant="soft" />
                )}
                {t.defaultBedrooms != null && (
                  <Chip size="small" label={`${t.defaultBedrooms} bed`} color="neutral" variant="soft" />
                )}
                {t.defaultBathrooms != null && (
                  <Chip size="small" label={`${t.defaultBathrooms} bath`} color="neutral" variant="soft" />
                )}
              </Stack>

              {!t.isActive && (
                <Chip size="small" label="Inactive" color="neutral" variant="soft"
                  sx={{ position: 'absolute', top: 12, right: 12 }} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Unit Type' : 'Add Unit Type'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {err && <Typography color="error" variant="body2">{err}</Typography>}
            <TextField label="Name *" fullWidth value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Studio, 1-Bed, 2-Bed, Commercial" />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))} />
            <TextField label="Default Monthly Levy" fullWidth type="number"
              value={form.defaultMonthlyLevy ?? ''}
              onChange={e => setForm(f => ({ ...f, defaultMonthlyLevy: e.target.value ? +e.target.value : null }))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            <Stack direction="row" spacing={2}>
              <TextField label="Default Bedrooms" fullWidth type="number"
                value={form.defaultBedrooms ?? ''}
                onChange={e => setForm(f => ({ ...f, defaultBedrooms: e.target.value ? +e.target.value : null }))} />
              <TextField label="Default Bathrooms" fullWidth type="number"
                value={form.defaultBathrooms ?? ''}
                onChange={e => setForm(f => ({ ...f, defaultBathrooms: e.target.value ? +e.target.value : null }))} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={creating || updating}>
            {editing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
