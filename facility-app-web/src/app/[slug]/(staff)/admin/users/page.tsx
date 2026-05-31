'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
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
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSession } from 'next-auth/react';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  StaffUser,
  useActivateUser,
  useDeactivateUser,
  useGetUsers,
  useInviteUser,
  useUpdateUserRole,
} from 'services/swr/api-hooks/useUsersApi';

// ── Role helpers ──────────────────────────────────────────────────────────────

const STAFF_ROLES = ['Admin', 'Manager', 'Receptionist', 'Security'] as const;

type RoleColor = 'error' | 'warning' | 'info' | 'success' | 'neutral';

function getRoleColor(role: string): RoleColor {
  if (role === 'Admin')       return 'error';
  if (role === 'Manager')     return 'warning';
  if (role === 'Receptionist') return 'info';
  if (role === 'Security')    return 'success';
  return 'neutral';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function primaryRole(roles: string[]): string | null {
  return STAFF_ROLES.find((r) => roles.includes(r)) ?? null;
}

// ── Invite dialog ─────────────────────────────────────────────────────────────

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteDialog = ({ open, onClose, onSuccess }: InviteDialogProps) => {
  const { trigger: invite, isMutating } = useInviteUser();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error,       setError]       = useState<string | null>(null);

  const handleClose = () => {
    setFullName(''); setEmail(''); setPhoneNumber(''); setError(null);
    onClose();
  };

  const handleInvite = async () => {
    setError(null);
    try {
      await invite({ fullName, email, phoneNumber: phoneNumber || null });
      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to send invite.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Invite Staff Member</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Jane Mwangi"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@facility.com"
          />
          <TextField
            fullWidth
            label="Phone (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+254 700 000 000"
          />
          <Typography variant="caption" color="text.secondary">
            An invitation email will be sent. The user will set their own password and
            will have no role assigned until you configure one.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="text" onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          loading={isMutating}
          disabled={!fullName.trim() || !email.trim()}
          onClick={handleInvite}
        >
          Send Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── User detail drawer ────────────────────────────────────────────────────────

interface UserDrawerProps {
  user: StaffUser | null;
  currentUserId: string;
  onClose: () => void;
  onRefresh: () => void;
}

const UserDrawer = ({ user, currentUserId, onClose, onRefresh }: UserDrawerProps) => {
  const { trigger: updateRole,   isMutating: savingRole }   = useUpdateUserRole();
  const { trigger: deactivate,   isMutating: deactivating } = useDeactivateUser();
  const { trigger: activate,     isMutating: activating }   = useActivateUser();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleError,    setRoleError]    = useState<string | null>(null);
  const [roleSuccess,  setRoleSuccess]  = useState(false);

  const isSelf = user?.id === currentUserId;
  const role   = user ? primaryRole(user.roles) : null;

  // Reset local state when drawer opens for a different user
  const handleOpen = () => {
    setSelectedRole(role ?? '');
    setRoleError(null);
    setRoleSuccess(false);
  };

  const handleSaveRole = async () => {
    if (!user) return;
    setRoleError(null);
    setRoleSuccess(false);
    try {
      await updateRole({ id: user.id, role: selectedRole || null });
      setRoleSuccess(true);
      onRefresh();
    } catch (err: any) {
      setRoleError(err?.data?.error ?? 'Failed to update role.');
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    try {
      await deactivate(user.id);
      onRefresh();
      onClose();
    } catch { /* ignored */ }
  };

  const handleActivate = async () => {
    if (!user) return;
    try {
      await activate(user.id);
      onRefresh();
      onClose();
    } catch { /* ignored */ }
  };

  return (
    <Drawer
      anchor="right"
      open={!!user}
      onClose={onClose}
      SlideProps={{ onEntering: handleOpen }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 4 } }}
    >
      {user && (
        <Stack sx={{ height: 1 }}>
          {/* Header */}
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 56, height: 56,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {getInitials(user.fullName)}
            </Avatar>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineClamp: 1 }}>
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 1 }}>
                {user.email}
              </Typography>
              {user.phoneNumber && (
                <Typography variant="caption" color="text.secondary">
                  {user.phoneNumber}
                </Typography>
              )}
            </Stack>
            <Button variant="text" size="small" onClick={onClose} sx={{ flexShrink: 0 }}>
              <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
            </Button>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Status */}
          <Stack sx={{ gap: 1.5, mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Account Status
            </Typography>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Chip
                label={user.isActive ? 'Active' : 'Inactive'}
                color={user.isActive ? 'success' : 'neutral'}
                variant="soft"
                size="small"
              />
              {!isSelf && (
                user.isActive ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    loading={deactivating}
                    onClick={handleDeactivate}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    loading={activating}
                    onClick={handleActivate}
                  >
                    Activate
                  </Button>
                )
              )}
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Role */}
          <Stack sx={{ gap: 2 }}>
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Role
              </Typography>
              {role ? (
                <Chip label={role} color={getRoleColor(role)} variant="soft" size="small" />
              ) : (
                <Chip label="No role" variant="soft" size="small" />
              )}
            </Stack>

            {roleError  && <Alert severity="error"   onClose={() => setRoleError(null)}>{roleError}</Alert>}
            {roleSuccess && <Alert severity="success" onClose={() => setRoleSuccess(false)}>Role updated.</Alert>}

            {isSelf ? (
              <Typography variant="caption" color="text.secondary">
                You cannot change your own role.
              </Typography>
            ) : (
              <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Assign role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="Assign role"
                    onChange={(e) => { setSelectedRole(e.target.value); setRoleSuccess(false); }}
                  >
                    <MenuItem value=""><em>No role</em></MenuItem>
                    {STAFF_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  loading={savingRole}
                  onClick={handleSaveRole}
                >
                  Save
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Footer: joined date */}
          <Box sx={{ mt: 'auto', pt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Joined {new Date(user.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Typography>
          </Box>
        </Stack>
      )}
    </Drawer>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StaffUsersPage() {
  const { data: session } = useSession();
  const currentUserId     = (session?.user as any)?.id ?? '';

  const { data: users, isLoading, mutate } = useGetUsers();

  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [drawerUser,    setDrawerUser]    = useState<StaffUser | null>(null);

  const columns: GridColDef<StaffUser>[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', height: 1 }}>
          <Avatar
            sx={{
              width: 32, height: 32,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(params.row.fullName)}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>
              {params.row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineClamp: 1 }}>
              {params.row.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'roles',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => {
        const role = primaryRole(params.row.roles);
        return role
          ? <Chip label={role} color={getRoleColor(role)} variant="soft" size="small" />
          : <Chip label="No role" variant="soft" size="small" />;
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          color={params.row.isActive ? 'success' : 'neutral'}
          variant="soft"
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 130,
      renderCell: (params) => (
        <Typography variant="subtitle2" color="text.secondary">
          {new Date(params.row.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="text"
          size="small"
          onClick={() => setDrawerUser(params.row)}
          sx={{ minWidth: 0, p: 0.5 }}
        >
          <IconifyIcon
            icon="material-symbols:chevron-right-rounded"
            sx={{ fontSize: 22, color: 'text.secondary' }}
          />
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 4, gap: 2, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Staff Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage staff accounts and role assignments
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" sx={{ fontSize: 20 }} />}
          onClick={() => setInviteOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          Invite User
        </Button>
      </Stack>

      {/* Table */}
      {isLoading || users === undefined ? (
        <Stack sx={{ gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}
        </Stack>
      ) : (
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          onRowClick={(params) => setDrawerUser(params.row)}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {/* Invite dialog */}
      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => mutate()}
      />

      {/* User detail drawer */}
      <UserDrawer
        user={drawerUser}
        currentUserId={currentUserId}
        onClose={() => setDrawerUser(null)}
        onRefresh={() => mutate()}
      />
    </Box>
  );
}
