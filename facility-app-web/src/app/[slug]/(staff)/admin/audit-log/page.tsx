'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { useGetAuditLog, type AuditLogDto } from 'services/swr/api-hooks/useAuditLogApi';

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'neutral'> = {
  Created:    'success',
  Updated:    'info',
  Deleted:    'error',
  Approved:   'success',
  Rejected:   'error',
  CheckedIn:  'success',
  CheckedOut: 'neutral',
  Cancelled:  'warning',
  Resolved:   'success',
};

const actionColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'neutral' =>
  ACTION_COLORS[action] ?? 'neutral';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const PAGE_SIZE = 50;

  const { data } = useGetAuditLog(search, page, PAGE_SIZE);
  const rows  = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: GridColDef<AuditLogDto>[] = [
    {
      field: 'createdAt',
      headerName: 'Timestamp',
      width: 170,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary">
          {new Date(row.createdAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'userName',
      headerName: 'User',
      flex: 1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.userName}</Typography>
          {row.userId && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {row.userId.slice(0, 8)}…
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 130,
      renderCell: ({ row }) => (
        <Chip label={row.action} color={actionColor(row.action)} variant="soft" size="small" />
      ),
    },
    {
      field: 'entityType',
      headerName: 'Entity',
      width: 140,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="subtitle2">{row.entityType}</Typography>
          {row.entityId && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {row.entityId.slice(0, 8)}…
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'details',
      headerName: 'Details',
      flex: 2,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2" color="text.secondary" sx={{ lineClamp: 2 }}>
          {row.details ?? '—'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Audit Log</Typography>
          <Typography variant="body2" color="text.secondary">
            Full history of all staff actions across the platform
          </Typography>
        </Box>
        {total > 0 && (
          <Chip label={`${total.toLocaleString()} entries`} color="neutral" variant="soft" />
        )}
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Search by user, action, entity or details…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        size="small"
        sx={{ mb: 3, width: { xs: 1, sm: 400 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconifyIcon icon="material-symbols:search-rounded" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Grid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={row => row.id}
          rowCount={total}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={m => setPage(m.page + 1)}
          pageSizeOptions={[PAGE_SIZE]}
          disableRowSelectionOnClick
          disableColumnMenu
        />
      </Paper>
    </Box>
  );
}
