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
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetPlatformAnnouncements,
  useCreatePlatformAnnouncement,
  useTogglePlatformAnnouncement,
  useDeletePlatformAnnouncement,
  type AnnouncementDto,
  ANNOUNCEMENT_CATEGORIES,
} from 'services/swr/api-hooks/useAnnouncementsApi';

const AUDIENCES = [
  { value: 0, label: 'All Facilities' },
  { value: 1, label: 'Starter Plan' },
  { value: 2, label: 'Professional Plan' },
];

const catMeta = (v: number) =>
  ANNOUNCEMENT_CATEGORIES.find(c => c.value === v) ??
  { label: String(v), color: 'neutral' as const, icon: 'material-symbols:info-outline-rounded' };

const EMPTY = { title: '', body: '', category: 0, audience: 0, expiresAt: '' };

export default function SuperAdminAnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err,  setErr]  = useState('');

  const { data: items = [], mutate }          = useGetPlatformAnnouncements();
  const { trigger: create, isMutating: creating } = useCreatePlatformAnnouncement();
  const { trigger: toggle }                   = useTogglePlatformAnnouncement();
  const { trigger: del }                      = useDeletePlatformAnnouncement();

  const active   = items.filter(a => a.isActive);
  const inactive = items.filter(a => !a.isActive);

  const handleCreate = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!form.body.trim())  { setErr('Body is required.'); return; }
    try {
      await create({
        title:     form.title.trim(),
        body:      form.body.trim(),
        category:  form.category,
        audience:  form.audience,
        expiresAt: form.expiresAt || null,
      });
      await mutate();
      setOpen(false);
      setForm(EMPTY);
      setErr('');
    } catch { setErr('Failed to post announcement. Please try again.'); }
  };

  const handleToggle = async (id: string) => { await toggle(id); await mutate(); };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await del(id); await mutate();
  };

  const AnnouncementCard = ({ item }: { item: AnnouncementDto }) => {
    const cat     = catMeta(item.category);
    const expired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false;

    return (
      <Paper sx={{ p: 3, height: 1, opacity: item.isActive ? 1 : 0.55, position: 'relative' }}>
        <Chip
          label={cat.label}
          color={cat.color}
          variant="soft"
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />

        <Stack direction="row" sx={{ alignItems: 'flex-start', mb: 2, pr: 8 }}>
          <Avatar variant="rounded" sx={{ bgcolor: `${cat.color}.lighter`, borderRadius: 2, mr: 1.5 }}>
            <IconifyIcon icon={cat.icon} sx={{ color: `${cat.color}.main` }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineClamp: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.publishedAt).toLocaleDateString()} · {item.createdBy?.fullName}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 3 }}>
          {item.body}
        </Typography>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.5}>
            {!item.isActive && <Chip label="Inactive" size="small" color="neutral" variant="soft" />}
            {expired && item.isActive && <Chip label="Expired" size="small" color="warning" variant="soft" />}
            {item.expiresAt && !expired && (
              <Typography variant="caption" color="text.secondary">
                Expires {new Date(item.expiresAt).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={item.isActive ? 'Deactivate' : 'Activate'}>
              <IconButton size="small" onClick={() => handleToggle(item.id)}>
                <IconifyIcon
                  icon={item.isActive
                    ? 'material-symbols:toggle-on-rounded'
                    : 'material-symbols:toggle-off-outline-rounded'}
                  sx={{ color: item.isActive ? 'success.main' : 'text.disabled' }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                <IconifyIcon icon="material-symbols:delete-outline-rounded" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Announcements</Typography>
          <Typography variant="body2" color="text.secondary">
            Broadcast platform-level notices to all facilities or specific plan tiers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => { setForm(EMPTY); setErr(''); setOpen(true); }}
        >
          New Announcement
        </Button>
      </Stack>

      {/* Summary */}
      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <Chip label={`${items.length} Total`}   color="neutral" variant="soft" />
        <Chip label={`${active.length} Active`} color="success" variant="soft" />
        {inactive.length > 0 && (
          <Chip label={`${inactive.length} Inactive`} color="neutral" variant="soft" />
        )}
      </Stack>

      {/* Empty state */}
      {items.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.lighter', mx: 'auto', mb: 2 }}>
            <IconifyIcon
              icon="material-symbols:campaign-outline-rounded"
              sx={{ fontSize: 32, color: 'primary.main' }}
            />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No announcements yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Broadcast platform notices about new features, scheduled maintenance, or important updates.
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Post First Announcement
          </Button>
        </Paper>
      )}

      {/* Active */}
      {active.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Active
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {active.map(item => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <AnnouncementCard item={item} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Inactive
          </Typography>
          <Grid container spacing={3}>
            {inactive.map(item => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <AnnouncementCard item={item} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Compose Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Platform Announcement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {err && <Typography color="error" variant="body2">{err}</Typography>}
            <TextField
              label="Title *"
              fullWidth
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Body *"
              fullWidth
              multiline
              rows={4}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write the announcement content..."
            />
            <FormControl fullWidth>
              <InputLabel>Audience</InputLabel>
              <Select
                value={form.audience}
                label="Audience"
                onChange={e => setForm(f => ({ ...f, audience: Number(e.target.value) }))}
              >
                {AUDIENCES.map(a => (
                  <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={e => setForm(f => ({ ...f, category: Number(e.target.value) }))}
              >
                {ANNOUNCEMENT_CATEGORIES.map(c => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Expires At"
              type="datetime-local"
              fullWidth
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank for no expiry"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            Post Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
