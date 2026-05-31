'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  EntranceDto,
  useCreateEntrance,
  useDeleteEntrance,
  useGetEntrances,
  useToggleEntrance,
  useUpdateEntrance,
} from 'services/swr/api-hooks/useEntrancesApi';

// ── Gate icon helper ──────────────────────────────────────────────────────────

function gateIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('main') || n.includes('front'))  return 'material-symbols:door-front-outline-rounded';
  if (n.includes('back') || n.includes('rear'))   return 'material-symbols:door-back-outline-rounded';
  if (n.includes('park') || n.includes('car'))    return 'material-symbols:local-parking-rounded';
  if (n.includes('service') || n.includes('staff')) return 'material-symbols:engineering-outline-rounded';
  if (n.includes('emergency') || n.includes('fire')) return 'material-symbols:emergency-outline-rounded';
  if (n.includes('pedestrian') || n.includes('walk')) return 'material-symbols:directions-walk-rounded';
  return 'material-symbols:sensor-door-outline-rounded';
}

// ── Add / Edit dialog ─────────────────────────────────────────────────────────

interface EntranceDialogProps {
  open: boolean;
  editing: EntranceDto | null;
  onClose: () => void;
  onSaved: () => void;
}

const EntranceDialog = ({ open, editing, onClose, onSaved }: EntranceDialogProps) => {
  const { trigger: create, isMutating: creating } = useCreateEntrance();
  const { trigger: update, isMutating: updating }  = useUpdateEntrance();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setDescription(editing?.description ?? '');
      setError(null);
    }
  }, [open, editing]);

  const isMutating = creating || updating;

  const handleSave = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      if (editing) {
        await update({ id: editing.id, name: name.trim(), description: description.trim() || null });
      } else {
        await create({ name: name.trim(), description: description.trim() || null });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Something went wrong.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editing ? 'Edit Entrance' : 'Add Entrance'}
      </DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            label="Entrance Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Gate, North Entrance"
            autoFocus
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Primary entry for residents and visitors"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="text" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          loading={isMutating}
          disabled={!name.trim()}
          onClick={handleSave}
        >
          {editing ? 'Save Changes' : 'Add Entrance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Delete confirm dialog ─────────────────────────────────────────────────────

interface DeleteDialogProps {
  entrance: EntranceDto | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteDialog = ({ entrance, onClose, onDeleted }: DeleteDialogProps) => {
  const { trigger: del, isMutating } = useDeleteEntrance();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!entrance) return;
    setError(null);
    try {
      await del(entrance.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to delete entrance.');
    }
  };

  return (
    <Dialog open={!!entrance} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete Entrance?</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            This will permanently remove <strong>{entrance?.name}</strong>.
            Make sure no staff are currently assigned to this entrance.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="text" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" loading={isMutating} onClick={handleDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Entrance card ─────────────────────────────────────────────────────────────

interface EntranceCardProps {
  entrance: EntranceDto;
  onEdit:   (e: EntranceDto) => void;
  onDelete: (e: EntranceDto) => void;
  onToggle: (id: string) => void;
  toggling: boolean;
}

const EntranceCard = ({ entrance, onEdit, onDelete, onToggle, toggling }: EntranceCardProps) => {
  const active = entrance.isActive;

  return (
    <Card
      elevation={3}
      sx={{
        height: 1,
        borderRadius: 3,
        border: '1px solid',
        borderColor: active ? 'divider' : 'background.elevation3',
        opacity: active ? 1 : 0.65,
        transition: 'box-shadow 0.2s, opacity 0.2s',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* top row */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 48, height: 48, borderRadius: 2, flexShrink: 0,
              bgcolor: active ? 'primary.lighter' : 'background.elevation2',
              color:  active ? 'primary.main'    : 'text.disabled',
            }}
          >
            <IconifyIcon icon={gateIcon(entrance.name)} sx={{ fontSize: 28 }} />
          </Avatar>

          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineClamp: 1 }}>
              {entrance.name}
            </Typography>
            <Chip
              label={active ? 'Active' : 'Inactive'}
              color={active ? 'success' : 'neutral'}
              variant="soft"
              size="small"
              sx={{ alignSelf: 'flex-start', mt: 0.5 }}
            />
          </Stack>
        </Stack>

        {/* description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minHeight: 40, lineClamp: 2, mb: 2 }}
        >
          {entrance.description || 'No description provided.'}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* footer actions */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Added {new Date(entrance.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Typography>

          <Stack direction="row" sx={{ gap: 0.5 }}>
            <Tooltip title={active ? 'Deactivate' : 'Activate'}>
              <span>
                <IconButton
                  size="small"
                  disabled={toggling}
                  onClick={() => onToggle(entrance.id)}
                  sx={{ color: active ? 'warning.main' : 'success.main' }}
                >
                  <IconifyIcon
                    icon={active
                      ? 'material-symbols:toggle-on-outline-rounded'
                      : 'material-symbols:toggle-off-outline-rounded'}
                    sx={{ fontSize: 22 }}
                  />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(entrance)} sx={{ color: 'text.secondary' }}>
                <IconifyIcon icon="material-symbols:edit-outline-rounded" sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={active ? 'Deactivate before deleting' : 'Delete'}>
              <span>
                <IconButton
                  size="small"
                  disabled={active}
                  onClick={() => onDelete(entrance)}
                  sx={{ color: 'error.main' }}
                >
                  <IconifyIcon icon="material-symbols:delete-outline-rounded" sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <Box
    sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', py: 12, gap: 2, textAlign: 'center',
    }}
  >
    <Avatar
      variant="rounded"
      sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: 'primary.lighter' }}
    >
      <IconifyIcon
        icon="material-symbols:sensor-door-outline-rounded"
        sx={{ fontSize: 40, color: 'primary.main' }}
      />
    </Avatar>
    <Stack sx={{ gap: 0.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        No entrances yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        Add the gates and entry points your facility uses. Staff will select their
        active gate each session so every visit is recorded accurately.
      </Typography>
    </Stack>
    <Button
      variant="contained"
      startIcon={<IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 20 }} />}
      onClick={onAdd}
    >
      Add First Entrance
    </Button>
  </Box>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EntrancesPage() {
  const { data: entrances, isLoading, mutate } = useGetEntrances();
  const { trigger: toggle, isMutating: toggling } = useToggleEntrance();

  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editing,      setEditing]      = useState<EntranceDto | null>(null);
  const [deleting,     setDeleting]     = useState<EntranceDto | null>(null);

  const openAdd  = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (e: EntranceDto) => { setEditing(e); setDialogOpen(true); };

  const handleToggle = async (id: string) => {
    await toggle(id);
    mutate();
  };

  const active   = (entrances ?? []).filter((e) => e.isActive);
  const inactive = (entrances ?? []).filter((e) => !e.isActive);
  const all      = [...active, ...inactive];

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 5, gap: 2, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Entrances & Gates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the entry points for your facility
          </Typography>
        </Stack>

        {(entrances?.length ?? 0) > 0 && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" sx={{ fontSize: 20 }} />}
            onClick={openAdd}
            sx={{ flexShrink: 0 }}
          >
            Add Entrance
          </Button>
        )}
      </Stack>

      {/* summary chips */}
      {!isLoading && (entrances?.length ?? 0) > 0 && (
        <Stack direction="row" sx={{ gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
          <Chip
            label={`${active.length} active`}
            color="success"
            variant="soft"
            size="small"
            icon={<IconifyIcon icon="material-symbols:check-circle-outline-rounded" />}
          />
          {inactive.length > 0 && (
            <Chip
              label={`${inactive.length} inactive`}
              variant="soft"
              size="small"
            />
          )}
          <Chip
            label={`${all.length} total`}
            variant="soft"
            size="small"
          />
        </Stack>
      )}

      {/* loading skeletons */}
      {isLoading && (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* empty state */}
      {!isLoading && all.length === 0 && (
        <EmptyState onAdd={openAdd} />
      )}

      {/* cards grid */}
      {!isLoading && all.length > 0 && (
        <Grid container spacing={3}>
          {all.map((entrance) => (
            <Grid key={entrance.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <EntranceCard
                entrance={entrance}
                onEdit={openEdit}
                onDelete={setDeleting}
                onToggle={handleToggle}
                toggling={toggling}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* add / edit dialog */}
      <EntranceDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={() => mutate()}
      />

      {/* delete confirm */}
      <DeleteDialog
        entrance={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => mutate()}
      />
    </Box>
  );
}
