'use client';

import { useState, useMemo, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetRoles,
  useCreateRole,
  useUpdateRolePermissions,
  useUpdateRole,
  useToggleRole,
  useDeleteRole,
  PERMISSION_GROUPS,
  type AppRoleItem,
} from 'services/swr/api-hooks/useRolesApi';

// ── Create Role Dialog ─────────────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateRoleDialog({ open, onClose, onCreated }: CreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { trigger, isMutating } = useCreateRole();

  const handleClose = () => {
    setName(''); setDescription(''); setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    try {
      await trigger({ name: name.trim(), description: description.trim() || null, permissions: [] });
      setName(''); setDescription(''); setError('');
      onCreated();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to create role.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create Role</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Role Name"
            fullWidth size="small"
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Night Security"
          />
          <TextField
            label="Description"
            fullWidth size="small" multiline rows={2}
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isMutating}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isMutating}>
          {isMutating ? <CircularProgress size={18} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Edit Role Dialog ───────────────────────────────────────────────────────────

interface EditDialogProps {
  role: AppRoleItem;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function EditRoleDialog({ role, open, onClose, onSaved }: EditDialogProps) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? '');
  const [error, setError] = useState('');
  const { trigger, isMutating } = useUpdateRole(role.id);

  useEffect(() => {
    if (open) {
      setName(role.name);
      setDescription(role.description ?? '');
      setError('');
    }
  }, [open, role.name, role.description]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    try {
      await trigger({ name: name.trim(), description: description.trim() || null });
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to update role.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Role</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Role Name"
            fullWidth size="small"
            value={name} onChange={e => setName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth size="small" multiline rows={2}
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isMutating}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isMutating}>
          {isMutating ? <CircularProgress size={18} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Permission Matrix ──────────────────────────────────────────────────────────

interface PermissionMatrixProps {
  role: AppRoleItem;
  onSaved: () => void;
}

function PermissionMatrix({ role, onSaved }: PermissionMatrixProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set(role.permissions));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { trigger } = useUpdateRolePermissions(role.id);
  const readonly = role.isSystem;

  const isDirty = useMemo(() => {
    if (checked.size !== role.permissions.length) return true;
    return role.permissions.some(p => !checked.has(p));
  }, [checked, role.permissions]);

  const toggle = (value: number) => {
    if (readonly) return;
    setChecked(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const toggleGroup = (values: number[]) => {
    if (readonly) return;
    const allOn = values.every(v => checked.has(v));
    setChecked(prev => {
      const next = new Set(prev);
      values.forEach(v => (allOn ? next.delete(v) : next.add(v)));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await trigger({ permissions: Array.from(checked) });
      onSaved();
    } catch {
      setError('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {readonly && (
        <Alert severity="info">
          System role permissions are managed by the platform and cannot be edited.
        </Alert>
      )}

      {PERMISSION_GROUPS.map(group => {
        const groupValues = group.permissions.map(p => p.value);
        const allOn = groupValues.every(v => checked.has(v));
        const someOn = groupValues.some(v => checked.has(v));

        return (
          <Box key={group.label}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Checkbox
                size="small"
                checked={allOn}
                indeterminate={someOn && !allOn}
                onChange={() => toggleGroup(groupValues)}
                disabled={readonly}
              />
              <IconifyIcon icon={group.icon} sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {group.label}
              </Typography>
            </Stack>
            <Stack sx={{ pl: 4 }} gap={0.5}>
              {group.permissions.map(perm => (
                <FormControlLabel
                  key={perm.value}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked.has(perm.value)}
                      onChange={() => toggle(perm.value)}
                      disabled={readonly}
                    />
                  }
                  label={<Typography variant="body2">{perm.label}</Typography>}
                  sx={{ m: 0 }}
                />
              ))}
            </Stack>
          </Box>
        );
      })}

      {!readonly && (
        <Box sx={{ pt: 1 }}>
          <Button
            variant="contained"
            disabled={!isDirty || saving}
            onClick={handleSave}
            startIcon={
              saving
                ? <CircularProgress size={16} />
                : <IconifyIcon icon="material-symbols:save-outline-rounded" />
            }
          >
            Save Permissions
          </Button>
        </Box>
      )}
    </Stack>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { data: roles, isLoading, mutate } = useGetRoles();

  // Store only the ID; derive the live role object from fresh SWR data so the
  // right panel stays in sync after every mutate (toggle, save permissions, etc.)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen]  = useState(false);
  const [editOpen,   setEditOpen]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppRoleItem | null>(null);

  const selected = useMemo(
    () => (selectedId ? (roles?.find(r => r.id === selectedId) ?? null) : null),
    [selectedId, roles],
  );

  const { trigger: triggerDelete, isMutating: deleting  } = useDeleteRole(deleteTarget?.id ?? '');
  const { trigger: triggerToggle, isMutating: toggling  } = useToggleRole(selected?.id ?? '');

  const handleCreated = () => { setCreateOpen(false); mutate(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await triggerDelete();
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
      mutate();
    } catch { /* server returns 400 for system roles */ }
  };

  const handleToggle = async () => {
    if (!selected) return;
    try { await triggerToggle(); mutate(); } catch { /* swallow */ }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Roles & Permissions</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Define roles and configure their permissions. Changes apply across all facilities.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => setCreateOpen(true)}
        >
          New Role
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Left — Role List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 0, height: '100%' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {isLoading ? '—' : `${roles?.length ?? 0} Role${(roles?.length ?? 0) !== 1 ? 's' : ''}`}
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : !roles?.length ? (
              <Stack alignItems="center" gap={1} sx={{ p: 4, color: 'text.disabled' }}>
                <IconifyIcon icon="material-symbols:shield-outline-rounded" sx={{ fontSize: 36 }} />
                <Typography variant="body2" textAlign="center">
                  No roles yet. Create one to get started.
                </Typography>
              </Stack>
            ) : (
              <List disablePadding>
                {roles.map((role, i) => (
                  <Box key={role.id}>
                    {i > 0 && <Divider />}
                    <ListItemButton
                      selected={selected?.id === role.id}
                      onClick={() => setSelectedId(role.id)}
                      sx={{ px: 3, py: 1.5 }}
                    >
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 36, height: 36, mr: 2, borderRadius: 1.5,
                          bgcolor: role.isActive ? 'primary.lighter' : 'background.elevation2',
                        }}
                      >
                        <IconifyIcon
                          icon={
                            role.isSystem
                              ? 'material-symbols:shield-outline-rounded'
                              : 'material-symbols:person-outline-rounded'
                          }
                          sx={{ fontSize: 20, color: role.isActive ? 'primary.main' : 'text.disabled' }}
                        />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {role.name}
                            </Typography>
                            {role.isSystem && (
                              <Chip
                                label="System" size="small" variant="soft" color="neutral"
                                sx={{ height: 16, fontSize: 10 }}
                              />
                            )}
                            {!role.isActive && (
                              <Chip
                                label="Inactive" size="small" variant="soft" color="error"
                                sx={{ height: 16, fontSize: 10 }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right — Permission Editor */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selected ? (
            <Paper sx={{ p: { xs: 3, md: 4 } }}>
              {/* Role header */}
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{selected.name}</Typography>
                    {selected.isSystem && (
                      <Chip label="System" size="small" variant="soft" color="neutral" />
                    )}
                    {!selected.isActive && (
                      <Chip label="Inactive" size="small" variant="soft" color="error" />
                    )}
                  </Stack>
                  {selected.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {selected.description}
                    </Typography>
                  )}
                </Box>

                {!selected.isSystem && (
                  <Stack direction="row" gap={1}>
                    <Tooltip title="Edit name & description">
                      <IconButton size="small" onClick={() => setEditOpen(true)}>
                        <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={selected.isActive ? 'Deactivate role' : 'Activate role'}>
                      <IconButton size="small" onClick={handleToggle} disabled={toggling}>
                        <IconifyIcon
                          icon={
                            selected.isActive
                              ? 'material-symbols:toggle-on-outline-rounded'
                              : 'material-symbols:toggle-off-outline-rounded'
                          }
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete role">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(selected)}>
                        <IconifyIcon icon="material-symbols:delete-outline-rounded" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Permissions</Typography>
              <PermissionMatrix
                key={selected.id}
                role={selected}
                onSaved={() => mutate()}
              />
            </Paper>
          ) : (
            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
              }}
            >
              <Stack alignItems="center" gap={2}>
                <Avatar
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: 'background.elevation2', borderRadius: 3 }}
                >
                  <IconifyIcon
                    icon="material-symbols:shield-outline-rounded"
                    sx={{ fontSize: 36, color: 'text.disabled' }}
                  />
                </Avatar>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  Select a role to edit its permissions
                </Typography>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create Dialog */}
      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Edit Dialog */}
      {selected && !selected.isSystem && (
        <EditRoleDialog
          role={selected}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => { mutate(); setEditOpen(false); }}
        />
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be
            undone. Users assigned this role will lose its permissions immediately.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
