'use client';

import { useEffect, useState } from 'react';
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
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  PaymentListDto,
  PAYMENT_PURPOSE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  useGetPayments,
  useInitiateMpesa,
  useRecordManual,
} from 'services/swr/api-hooks/usePaymentsApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Completed:  'success',
  Processing: 'warning',
  Pending:    'info',
  Failed:     'error',
  Cancelled:  'neutral',
};

const METHOD_ICONS: Record<string, string> = {
  Mpesa:       'material-symbols:phonelink-ring-rounded',
  Cash:        'material-symbols:payments-outline-rounded',
  BankTransfer:'material-symbols:account-balance-outline-rounded',
  Card:        'material-symbols:credit-card-outline-rounded',
};

function fmtAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── STK Push dialog ───────────────────────────────────────────────────────────

const StkPushDialog = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { trigger, isMutating } = useInitiateMpesa();

  const [phone,     setPhone]     = useState('');
  const [amount,    setAmount]    = useState('');
  const [purpose,   setPurpose]   = useState(0);
  const [reference, setReference] = useState('');
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);

  const reset = () => {
    setPhone(''); setAmount(''); setPurpose(0);
    setReference(''); setError(null); setSuccess(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError(null);
    if (!phone.trim() || !amount || Number(amount) <= 0) {
      setError('Phone number and a valid amount are required.');
      return;
    }
    try {
      const res = await trigger({
        phone: phone.trim(),
        amount: Number(amount),
        purpose,
        reference: reference || null,
      });
      setSuccess((res as any)?.message ?? 'STK push sent. Ask the customer to check their phone.');
      onSuccess();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to send STK push.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{ width: 32, height: 32, bgcolor: 'success.lighter', borderRadius: 1.5 }}
          >
            <IconifyIcon icon="material-symbols:phonelink-ring-rounded" sx={{ fontSize: 18, color: 'success.main' }} />
          </Avatar>
          Request M-Pesa Payment
        </Stack>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>
        ) : (
          <Stack sx={{ gap: 2.5, mt: 1 }}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            <TextField
              fullWidth size="small"
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712 345 678 or 254712345678"
              helperText="M-Pesa registered number"
            />
            <TextField
              fullWidth size="small"
              label="Amount (KES)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Purpose</InputLabel>
              <Select
                value={purpose}
                label="Purpose"
                onChange={(e) => setPurpose(Number(e.target.value))}
              >
                {PAYMENT_PURPOSE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth size="small"
              label="Account Reference (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Unit A1"
              helperText="Shown on customer's M-Pesa receipt (max 12 chars)"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="neutral">
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            variant="contained"
            color="success"
            loading={isMutating}
            onClick={handleSubmit}
          >
            Send STK Push
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Manual payment dialog ─────────────────────────────────────────────────────

const ManualDialog = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { trigger, isMutating } = useRecordManual();

  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState(1); // Cash default
  const [purpose,   setPurpose]   = useState(0);
  const [reference, setReference] = useState('');
  const [notes,     setNotes]     = useState('');
  const [error,     setError]     = useState<string | null>(null);

  const reset = () => {
    setAmount(''); setMethod(1); setPurpose(0);
    setReference(''); setNotes(''); setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError(null);
    if (!amount || Number(amount) <= 0) {
      setError('A valid amount is required.');
      return;
    }
    try {
      await trigger({
        amount: Number(amount), method, purpose,
        reference: reference || null,
        notes: notes || null,
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to record payment.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{ width: 32, height: 32, bgcolor: 'primary.lighter', borderRadius: 1.5 }}
          >
            <IconifyIcon icon="material-symbols:payments-outline-rounded" sx={{ fontSize: 18, color: 'primary.main' }} />
          </Avatar>
          Record Manual Payment
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2.5, mt: 1 }}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          <TextField
            fullWidth size="small"
            label="Amount (KES)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Method</InputLabel>
            <Select
              value={method}
              label="Method"
              onChange={(e) => setMethod(Number(e.target.value))}
            >
              {PAYMENT_METHOD_OPTIONS.filter((o) => o.value !== 0).map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Purpose</InputLabel>
            <Select
              value={purpose}
              label="Purpose"
              onChange={(e) => setPurpose(Number(e.target.value))}
            >
              {PAYMENT_PURPOSE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth size="small"
            label="Reference (optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <TextField
            fullWidth size="small"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="neutral">Cancel</Button>
        <Button variant="contained" loading={isMutating} onClick={handleSubmit}>
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── DataGrid columns ──────────────────────────────────────────────────────────

const columns: GridColDef<PaymentListDto>[] = [
  {
    field: 'createdAt',
    headerName: 'Date',
    width: 160,
    renderCell: (p) => (
      <Typography variant="caption">{fmtDate(p.value)}</Typography>
    ),
  },
  {
    field: 'residentName',
    headerName: 'Resident',
    flex: 1,
    minWidth: 140,
    renderCell: (p) => (
      <Stack>
        <Typography variant="subtitle2">{p.value ?? '—'}</Typography>
        {p.row.unitNumber && (
          <Typography variant="caption" color="text.secondary">
            {p.row.unitNumber}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 130,
    renderCell: (p) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {fmtAmount(p.value, p.row.currency)}
      </Typography>
    ),
  },
  {
    field: 'method',
    headerName: 'Method',
    width: 120,
    renderCell: (p) => (
      <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
        <IconifyIcon
          icon={METHOD_ICONS[p.value] ?? 'material-symbols:payments-outline-rounded'}
          sx={{ fontSize: 16, color: 'text.secondary' }}
        />
        <Typography variant="caption">{p.value}</Typography>
      </Stack>
    ),
  },
  {
    field: 'purpose',
    headerName: 'Purpose',
    width: 110,
    renderCell: (p) => (
      <Chip label={p.value} size="small" variant="soft" color="neutral" />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (p) => (
      <Chip
        label={p.value}
        size="small"
        variant="soft"
        color={STATUS_COLORS[p.value as string] ?? 'neutral'}
      />
    ),
  },
  {
    field: 'mpesaReceiptNo',
    headerName: 'Receipt / Ref',
    width: 150,
    renderCell: (p) => (
      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
        {p.value ?? p.row.reference ?? '—'}
      </Typography>
    ),
  },
];

// ── KPI cards ─────────────────────────────────────────────────────────────────

const KpiCard = ({
  icon, label, value, color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) => (
  <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
    <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
      <Avatar
        variant="rounded"
        sx={{ width: 44, height: 44, bgcolor: `${color}.lighter`, borderRadius: 2 }}
      >
        <IconifyIcon icon={icon} sx={{ fontSize: 26, color: `${color}.main` }} />
      </Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: 'All',        value: undefined },
  { label: 'Completed',  value: 2 },
  { label: 'Processing', value: 1 },
  { label: 'Failed',     value: 3 },
];

export default function PaymentsPage() {
  const [tab,       setTab]       = useState(0);
  const [page,      setPage]      = useState(1);
  const [stkOpen,   setStkOpen]   = useState(false);
  const [manualOpen,setManualOpen]= useState(false);

  const status = STATUS_TABS[tab].value;
  const { data, isLoading, mutate } = useGetPayments(page, 25, status);

  const rows     = data?.items ?? [];
  const total    = data?.total ?? 0;
  const completed = rows.filter((r) => r.status === 'Completed');
  const totalAmount = completed.reduce((s, r) => s + r.amount, 0);

  // Reset to page 1 when tab changes
  useEffect(() => { setPage(1); }, [tab]);

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {/* Page header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 4, gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Payments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            M-Pesa STK push, manual payments and transaction history
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="material-symbols:payments-outline-rounded" />}
            onClick={() => setManualOpen(true)}
          >
            Record Manual
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconifyIcon icon="material-symbols:phonelink-ring-rounded" />}
            onClick={() => setStkOpen(true)}
          >
            Request M-Pesa
          </Button>
        </Stack>
      </Stack>

      {/* KPI summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            icon="material-symbols:attach-money-rounded"
            label="Total Received"
            value={`KES ${totalAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            icon="material-symbols:receipt-outline-rounded"
            label="Total Transactions"
            value={total}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            icon="material-symbols:pending-outline-rounded"
            label="Processing"
            value={rows.filter((r) => r.status === 'Processing').length}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            icon="material-symbols:error-outline-rounded"
            label="Failed"
            value={rows.filter((r) => r.status === 'Failed').length}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Table */}
      <Paper>
        <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {STATUS_TABS.map(({ label }) => (
              <Tab
                key={label}
                label={label}
                sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
              />
            ))}
          </Tabs>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(r) => r.id}
          rowCount={total}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize: 25 }}
          onPaginationModelChange={(m) => setPage(m.page + 1)}
          pageSizeOptions={[25]}
          sx={{ border: 0, minHeight: 400 }}
        />
      </Paper>

      <StkPushDialog
        open={stkOpen}
        onClose={() => setStkOpen(false)}
        onSuccess={() => mutate()}
      />
      <ManualDialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSuccess={() => mutate()}
      />
    </Box>
  );
}
