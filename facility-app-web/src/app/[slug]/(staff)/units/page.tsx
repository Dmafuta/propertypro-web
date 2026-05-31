'use client';

import { useState, useMemo, useCallback } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetUnits, useGetUnit, useCreateUnit, useUpdateUnit, useDeleteUnit,
  useGetAssignableOwners, useGetAssignableOccupants,
  useSetOwner, useRemoveOwner, useAddOccupant, useRemoveOccupant,
  UNIT_STATUS, STATUS_COLORS,
  type UnitDto, type UnitPayload,
} from 'services/swr/api-hooks/useUnitsApi';
import { useGetUnitTypes } from 'services/swr/api-hooks/useUnitTypesApi';
import {
  useGetMeters, useAddMeter, useRetireMeter,
  useGetMeterReadings, useAddReading,
  useGetPrepaidTokens, useAddToken,
  useGetInstallationReport,
  UTILITY_TYPES, METER_MODES, READING_TYPES,
  type MeterDto,
} from 'services/swr/api-hooks/useMetersApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const UTILITY_ICONS: Record<number, string> = {
  0: 'material-symbols:electric-bolt-rounded',
  1: 'material-symbols:water-drop-outline-rounded',
  2: 'material-symbols:plumbing-rounded',
  3: 'material-symbols:local-fire-department-outline-rounded',
  4: 'material-symbols:wifi-rounded',
  5: 'material-symbols:settings-outline-rounded',
};

const UTILITY_COLORS: Record<number, string> = {
  0: 'warning', 1: 'info', 2: 'secondary', 3: 'error', 4: 'primary', 5: 'neutral',
};

// ── Meter wizard metadata shapes ──────────────────────────────────────────────
const DEFAULT_ANALOGUE_META = { tariffRate: '', billingCycleDay: '', multiplier: '1' };
const DEFAULT_PREPAID_META  = { vendorName: '', vendorId: '' };
const DEFAULT_SMART_META    = { deviceId: '', readIntervalMinutes: '15', protocol: '', apiEndpoint: '' };

function metaToJson(mode: number, meta: Record<string, string>) {
  const obj: Record<string, string | number> = {};
  Object.entries(meta).forEach(([k, v]) => { if (v) obj[k] = isNaN(+v) ? v : +v; });
  return JSON.stringify(obj);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT FORM DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function UnitFormDialog({
  open, onClose, onSaved, editing,
}: {
  open: boolean; onClose: () => void; onSaved: () => void;
  editing: UnitDto | null;
}) {
  const { data: unitTypes = [] } = useGetUnitTypes();
  const { trigger: create, isMutating: creating } = useCreateUnit();
  const { trigger: update, isMutating: updating } = useUpdateUnit();
  const [err, setErr] = useState('');

  const emptyForm = (): UnitPayload => ({
    unitNumber: '', block: null, floor: null, description: null,
    unitTypeId: null, status: 0, sizeM2: null, bedrooms: null,
    bathrooms: null, parkingBays: 0, monthlyLevy: null, notes: null,
  });

  const [form, setForm] = useState<UnitPayload>(emptyForm);
  const f = (k: keyof UnitPayload, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  // Reset when dialog opens
  const handleEnter = () => {
    setErr('');
    if (editing) {
      setForm({
        unitNumber: editing.unitNumber, block: editing.block, floor: editing.floor,
        description: editing.description, unitTypeId: editing.unitTypeId,
        status: editing.status, sizeM2: editing.sizeM2, bedrooms: editing.bedrooms,
        bathrooms: editing.bathrooms, parkingBays: editing.parkingBays,
        monthlyLevy: editing.monthlyLevy, notes: editing.notes,
      });
    } else {
      setForm(emptyForm());
    }
  };

  const handleSave = async () => {
    if (!form.unitNumber.trim()) { setErr('Unit number is required.'); return; }
    try {
      if (editing) await update({ id: editing.id, ...form });
      else await create(form);
      onSaved();
      onClose();
    } catch { setErr('Failed to save. Please try again.'); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>{editing ? `Edit Unit ${editing.unitNumber}` : 'Add Unit'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <Stack direction="row" spacing={2}>
            <TextField label="Unit Number *" fullWidth value={form.unitNumber}
              onChange={e => f('unitNumber', e.target.value)} />
            <TextField label="Block" fullWidth value={form.block ?? ''}
              onChange={e => f('block', e.target.value || null)} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Floor" fullWidth value={form.floor ?? ''}
              onChange={e => f('floor', e.target.value || null)} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={e => f('status', e.target.value)}>
                {Object.entries(UNIT_STATUS).map(([v, l]) => (
                  <MenuItem key={v} value={+v}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <FormControl fullWidth>
            <InputLabel>Unit Type</InputLabel>
            <Select label="Unit Type" value={form.unitTypeId ?? ''} onChange={e => f('unitTypeId', e.target.value || null)}>
              <MenuItem value="">— None —</MenuItem>
              {unitTypes.filter(t => t.isActive).map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Description" fullWidth multiline rows={2} value={form.description ?? ''}
            onChange={e => f('description', e.target.value || null)} />
          <Stack direction="row" spacing={2}>
            <TextField label="Size (m²)" fullWidth type="number" value={form.sizeM2 ?? ''}
              onChange={e => f('sizeM2', e.target.value ? +e.target.value : null)} />
            <TextField label="Parking Bays" fullWidth type="number" value={form.parkingBays}
              onChange={e => f('parkingBays', +e.target.value || 0)} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Bedrooms" fullWidth type="number" value={form.bedrooms ?? ''}
              onChange={e => f('bedrooms', e.target.value ? +e.target.value : null)} />
            <TextField label="Bathrooms" fullWidth type="number" value={form.bathrooms ?? ''}
              onChange={e => f('bathrooms', e.target.value ? +e.target.value : null)} />
          </Stack>
          <TextField label="Monthly Levy Override" fullWidth type="number" value={form.monthlyLevy ?? ''}
            onChange={e => f('monthlyLevy', e.target.value ? +e.target.value : null)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            helperText="Leave blank to use the Unit Type default levy" />
          <TextField label="Internal Notes" fullWidth multiline rows={2} value={form.notes ?? ''}
            onChange={e => f('notes', e.target.value || null)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={creating || updating}>
          {editing ? 'Save Changes' : 'Create Unit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// METER WIZARD
// ═══════════════════════════════════════════════════════════════════════════════
const WIZARD_STEPS = ['Utility & Mode', 'Meter Details', 'Opening Reading', 'Review'];

function AddMeterWizard({ unitId, open, onClose, onSaved }: {
  unitId: string; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { trigger: addMeter, isMutating } = useAddMeter();
  const { trigger: addReading } = useAddReading();
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');

  const [utility, setUtility] = useState(0);
  const [mode, setMode] = useState(0);
  const [meterNum, setMeterNum] = useState('');
  const [serial, setSerial] = useState('');
  const [location, setLocation] = useState('');
  const [uom, setUom] = useState('');
  const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [analogueMeta, setAnalogueMeta] = useState<Record<string, string>>(DEFAULT_ANALOGUE_META);
  const [prepaidMeta, setPrepaidMeta]   = useState<Record<string, string>>(DEFAULT_PREPAID_META);
  const [smartMeta, setSmartMeta]       = useState<Record<string, string>>(DEFAULT_SMART_META);
  const [openingValue, setOpeningValue] = useState('');
  const [openingDate, setOpeningDate]   = useState(new Date().toISOString().split('T')[0]);

  const reset = () => {
    setStep(0); setErr('');
    setUtility(0); setMode(0); setMeterNum(''); setSerial(''); setLocation(''); setUom('');
    setInstallDate(new Date().toISOString().split('T')[0]); setNotes('');
    setAnalogueMeta(DEFAULT_ANALOGUE_META); setPrepaidMeta(DEFAULT_PREPAID_META); setSmartMeta(DEFAULT_SMART_META);
    setOpeningValue(''); setOpeningDate(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => { reset(); onClose(); };

  const metaModeFields = () => {
    if (mode === 0) return Object.entries(analogueMeta);
    if (mode === 1) return Object.entries(prepaidMeta);
    return Object.entries(smartMeta);
  };

  const setMetaField = (key: string, val: string) => {
    if (mode === 0) setAnalogueMeta(p => ({ ...p, [key]: val }));
    else if (mode === 1) setPrepaidMeta(p => ({ ...p, [key]: val }));
    else setSmartMeta(p => ({ ...p, [key]: val }));
  };

  const currentMeta = mode === 0 ? analogueMeta : mode === 1 ? prepaidMeta : smartMeta;

  const META_LABELS: Record<string, string> = {
    tariffRate: 'Tariff Rate (per unit)', billingCycleDay: 'Billing Cycle Day',
    multiplier: 'Multiplier', vendorName: 'Vendor/Supplier Name',
    vendorId: 'Vendor ID / STS Reference', deviceId: 'Device ID',
    readIntervalMinutes: 'Read Interval (minutes)', protocol: 'Protocol (MQTT/REST/etc.)',
    apiEndpoint: 'API Endpoint (optional)',
  };

  const next = () => {
    setErr('');
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!meterNum.trim()) { setErr('Meter number is required.'); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      const metadata = metaToJson(mode, currentMeta);
      const { data } = await addMeter({
        unitId, utilityType: utility, meterMode: mode,
        meterNumber: meterNum, serialNumber: serial || null,
        location: location || null, unitOfMeasure: uom || null,
        metadata, notes: notes || null,
        installDate: new Date(installDate).toISOString(),
      });
      const meterId = data?.id;
      if (meterId && openingValue) {
        await addReading({
          meterId, value: +openingValue,
          readingDate: new Date(openingDate).toISOString(),
          readingType: 0, // Opening
          notes: 'Opening reading at commissioning',
        });
      }
      reset();
      onSaved();
      onClose();
    } catch { setErr('Failed to add meter. Please try again.'); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Meter</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {WIZARD_STEPS.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
        </Stepper>
        {err && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{err}</Typography>}

        {/* Step 0 — Utility & Mode */}
        {step === 0 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Select Utility</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {UTILITY_TYPES.map(u => (
                  <Chip key={u.value}
                    label={u.label}
                    icon={<IconifyIcon icon={u.icon} />}
                    onClick={() => setUtility(u.value)}
                    color={utility === u.value ? 'primary' : 'neutral'}
                    variant={utility === u.value ? 'filled' : 'soft'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Meter Type</Typography>
              <Stack spacing={1.5}>
                {METER_MODES.map(m => (
                  <Paper key={m.value}
                    onClick={() => setMode(m.value)}
                    sx={{
                      p: 2, cursor: 'pointer', border: 2,
                      borderColor: mode === m.value ? 'primary.main' : 'transparent',
                      bgcolor: mode === m.value ? 'primary.lighter' : 'background.elevation1',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{m.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{m.description}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}

        {/* Step 1 — Meter Details */}
        {step === 1 && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField label="Meter Number *" fullWidth value={meterNum} onChange={e => setMeterNum(e.target.value)} />
              <TextField label="Serial Number" fullWidth value={serial} onChange={e => setSerial(e.target.value)} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Location" fullWidth value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Main Distribution Board" />
              <TextField label="Unit of Measure" fullWidth value={uom} onChange={e => setUom(e.target.value)}
                placeholder="e.g. kWh, m³, litres" />
            </Stack>
            <TextField label="Install Date" type="date" fullWidth value={installDate}
              onChange={e => setInstallDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            {/* Mode-specific fields */}
            <Divider><Typography variant="caption" color="text.secondary">
              {METER_MODES[mode].label} Configuration
            </Typography></Divider>
            {metaModeFields().map(([key]) => (
              <TextField key={key} label={META_LABELS[key] || key} fullWidth
                value={currentMeta[key]} onChange={e => setMetaField(key, e.target.value)} />
            ))}
            <TextField label="Notes" fullWidth multiline rows={2} value={notes}
              onChange={e => setNotes(e.target.value)} />
          </Stack>
        )}

        {/* Step 2 — Opening Reading */}
        {step === 2 && (
          <Stack spacing={2.5}>
            <Typography color="text.secondary" variant="body2">
              Enter the meter face value at the time of installation. This becomes the baseline for billing.
              Leave blank if the value is not known (smart meters can auto-populate from the first sync).
            </Typography>
            <TextField
              label={mode === 1 ? 'Current Credit Balance (optional)' : 'Opening Meter Reading (optional)'}
              fullWidth type="number"
              value={openingValue} onChange={e => setOpeningValue(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">{uom || 'units'}</InputAdornment> }}
            />
            <TextField label="Reading Date" type="date" fullWidth value={openingDate}
              onChange={e => setOpeningDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Stack>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <Stack spacing={2}>
            <Box sx={{ bgcolor: 'background.elevation1', borderRadius: 2, p: 2 }}>
              <Stack spacing={1}>
                {[
                  ['Utility', UTILITY_TYPES[utility].label],
                  ['Meter Type', METER_MODES[mode].label],
                  ['Meter Number', meterNum],
                  serial && ['Serial Number', serial],
                  location && ['Location', location],
                  uom && ['Unit of Measure', uom],
                  ['Install Date', fmt(installDate)],
                  openingValue && ['Opening Reading', `${openingValue} ${uom || 'units'}`],
                ].filter(Boolean).map((row: any) => (
                  <Stack key={row[0]} direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{row[0]}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row[1]}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Typography variant="caption" color="text.secondary">
              After saving, you can download the Meter Installation Report from the meter details.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {step > 0 && <Button onClick={() => setStep(s => s - 1)}>Back</Button>}
        {step < 3
          ? <Button variant="contained" onClick={next}>Next</Button>
          : <Button variant="contained" onClick={handleSubmit} disabled={isMutating}>
              {isMutating ? 'Saving...' : 'Commission Meter'}
            </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RETIRE METER DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function RetireMeterDialog({ meter, open, onClose, onSaved }: {
  meter: MeterDto | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { trigger: retire, isMutating } = useRetireMeter();
  const [closingValue, setClosingValue] = useState('');
  const [retiredAt, setRetiredAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');

  const handleRetire = async () => {
    if (!closingValue) { setErr('Closing reading value is required.'); return; }
    if (!meter) return;
    try {
      await retire({ id: meter.id, closingReadingValue: +closingValue,
        retiredAt: new Date(retiredAt).toISOString(), notes: notes || null });
      onSaved();
      onClose();
    } catch { setErr('Failed to retire meter.'); }
  };

  if (!meter) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Retire Meter — {meter.meterNumber}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <Typography color="text.secondary" variant="body2">
            This will log a final closing reading and deactivate the meter. Historical records are preserved.
          </Typography>
          <TextField label="Closing Meter Reading *" type="number" fullWidth
            value={closingValue} onChange={e => setClosingValue(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">{meter.unitOfMeasure || 'units'}</InputAdornment> }} />
          <TextField label="Retirement Date" type="date" fullWidth value={retiredAt}
            onChange={e => setRetiredAt(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Reason / Notes" fullWidth multiline rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleRetire} disabled={isMutating}>
          Retire Meter
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD READING DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function AddReadingDialog({ meter, open, onClose, onSaved }: {
  meter: MeterDto | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { trigger: addReading, isMutating } = useAddReading();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState(1);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');

  const handleSave = async () => {
    if (!value) { setErr('Reading value is required.'); return; }
    if (!meter) return;
    try {
      await addReading({ meterId: meter.id, value: +value,
        readingDate: new Date(date).toISOString(), readingType: type, notes: notes || null });
      setValue(''); setNotes(''); setErr('');
      onSaved();
      onClose();
    } catch { setErr('Failed to log reading.'); }
  };

  if (!meter) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Log Reading — {meter.meterNumber}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <FormControl fullWidth>
            <InputLabel>Reading Type</InputLabel>
            <Select label="Reading Type" value={type} onChange={e => setType(+e.target.value)}>
              {READING_TYPES.filter(r => r.value !== 0 && r.value !== 4).map(r =>
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField label="Reading Value *" type="number" fullWidth
            value={value} onChange={e => setValue(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">{meter.unitOfMeasure || 'units'}</InputAdornment> }} />
          <TextField label="Reading Date" type="date" fullWidth value={date}
            onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Notes" fullWidth multiline rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isMutating}>Log Reading</Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD TOKEN DIALOG (Prepaid)
// ═══════════════════════════════════════════════════════════════════════════════
function AddTokenDialog({ meter, open, onClose, onSaved }: {
  meter: MeterDto | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { trigger: addToken, isMutating } = useAddToken();
  const [tokenCode, setTokenCode] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [unitsLoaded, setUnitsLoaded] = useState('');
  const [purchasedAt, setPurchasedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loadedAt, setLoadedAt] = useState('');
  const [ref, setRef] = useState('');
  const [err, setErr] = useState('');

  const handleSave = async () => {
    if (!tokenCode.trim() || !amountPaid) { setErr('Token code and amount paid are required.'); return; }
    if (!meter) return;
    try {
      await addToken({
        meterId: meter.id, tokenCode, amountPaid: +amountPaid,
        unitsLoaded: unitsLoaded ? +unitsLoaded : null,
        purchasedAt: new Date(purchasedAt).toISOString(),
        loadedAt: loadedAt ? new Date(loadedAt).toISOString() : null,
        voucherReference: ref || null,
      });
      setTokenCode(''); setAmountPaid(''); setUnitsLoaded(''); setRef(''); setErr('');
      onSaved();
      onClose();
    } catch { setErr('Failed to log token.'); }
  };

  if (!meter) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Log Token — {meter.meterNumber}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <TextField label="Token Code *" fullWidth value={tokenCode} onChange={e => setTokenCode(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <TextField label="Amount Paid *" type="number" fullWidth value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            <TextField label={`Units Loaded (${meter.unitOfMeasure || 'units'})`} type="number" fullWidth
              value={unitsLoaded} onChange={e => setUnitsLoaded(e.target.value)} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Purchased Date" type="date" fullWidth value={purchasedAt}
              onChange={e => setPurchasedAt(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Loaded Date (optional)" type="date" fullWidth value={loadedAt}
              onChange={e => setLoadedAt(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Stack>
          <TextField label="Voucher Reference" fullWidth value={ref} onChange={e => setRef(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isMutating}>Log Token</Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTALLATION REPORT DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function InstallationReportDialog({ meterId, open, onClose }: {
  meterId: string | null; open: boolean; onClose: () => void;
}) {
  const { data: report } = useGetInstallationReport(open ? meterId : null);

  const handlePrint = () => window.print();

  if (!report) return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Meter Installation Report
        <Button startIcon={<IconifyIcon icon="material-symbols:print-rounded" />} onClick={handlePrint}>
          Print
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Box id="installation-report" sx={{ fontFamily: 'inherit' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            {report.tenantLogoUrl && (
              <Box component="img" src={report.tenantLogoUrl} alt="" sx={{ height: 40, objectFit: 'contain' }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{report.tenantName}</Typography>
              {report.tenantAddress && <Typography variant="body2" color="text.secondary">{report.tenantAddress}</Typography>}
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">Document</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>METER INSTALLATION CERTIFICATE</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Ref: {report.reportRef}</Typography><br />
              <Typography variant="caption" color="text.secondary">{fmt(report.generatedAt)}</Typography>
            </Box>
          </Stack>

          {/* Unit */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Unit Details</Typography>
          <Box sx={{ bgcolor: 'background.elevation1', borderRadius: 1.5, p: 2, mb: 3 }}>
            {[
              ['Unit', `${report.block ? `Block ${report.block} — ` : ''}${report.unitNumber}${report.floor ? `, Floor ${report.floor}` : ''}`],
              ['Unit Type', report.unitTypeName],
              ['Owner', report.ownerName],
              ['Occupant(s)', report.occupantNames],
            ].filter(r => r[1]).map(r => (
              <Stack key={r[0]!} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{r[0]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r[1]}</Typography>
              </Stack>
            ))}
          </Box>

          {/* Meter */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Meter Details</Typography>
          <Box sx={{ bgcolor: 'background.elevation1', borderRadius: 1.5, p: 2, mb: 3 }}>
            {[
              ['Utility', report.utilityType],
              ['Meter Type', report.meterMode],
              ['Meter Number', report.meterNumber],
              ['Serial Number', report.serialNumber],
              ['Location', report.location],
              ['Unit of Measure', report.unitOfMeasure],
              ['Install Date', fmt(report.installDate)],
            ].filter(r => r[1]).map(r => (
              <Stack key={r[0]!} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{r[0]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r[1]}</Typography>
              </Stack>
            ))}
          </Box>

          {/* Opening Reading */}
          {report.openingReadingValue != null && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Opening Reading</Typography>
              <Box sx={{ bgcolor: 'background.elevation1', borderRadius: 1.5, p: 2, mb: 3 }}>
                {[
                  ['Value', `${report.openingReadingValue} ${report.unitOfMeasure || 'units'}`],
                  ['Date', fmt(report.openingReadingDate)],
                  ['Commissioned By', report.openingReadingBy],
                ].filter(r => r[1]).map(r => (
                  <Stack key={r[0]!} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{r[0]}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{r[1]}</Typography>
                  </Stack>
                ))}
              </Box>
            </>
          )}

          {/* Signatures */}
          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" spacing={4}>
            {['Technician / Staff', 'Tenant / Resident'].map(label => (
              <Box key={label} sx={{ flex: 1 }}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', height: 40, mb: 1 }} />
                <Typography variant="caption" color="text.secondary">{label} Signature</Typography><br />
                <Typography variant="caption" color="text.secondary">Date: _______________</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:download-rounded" />} onClick={handlePrint}>
          Print / Save PDF
        </Button>
      </DialogActions>

      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #installation-report { display: block !important; }
        }
      `}</style>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// METERS TAB (inside unit detail drawer)
// ═══════════════════════════════════════════════════════════════════════════════
function MetersTab({ unitId }: { unitId: string }) {
  const { data: meters = [], mutate } = useGetMeters(unitId);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [retireTarget, setRetireTarget] = useState<MeterDto | null>(null);
  const [readingTarget, setReadingTarget] = useState<MeterDto | null>(null);
  const [tokenTarget, setTokenTarget] = useState<MeterDto | null>(null);
  const [reportMeterId, setReportMeterId] = useState<string | null>(null);
  const [selectedMeter, setSelectedMeter] = useState<MeterDto | null>(null);

  const { data: readings = [], mutate: mutateReadings } = useGetMeterReadings(selectedMeter?.id ?? null);
  const { data: tokens = [], mutate: mutateTokens } = useGetPrepaidTokens(
    selectedMeter?.meterModeValue === 1 ? selectedMeter.id : null
  );

  const active = meters.filter(m => m.isActive);
  const retired = meters.filter(m => !m.isActive);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Meters ({active.length} active)</Typography>
        <Button size="small" variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => setWizardOpen(true)}>
          Add Meter
        </Button>
      </Stack>

      {meters.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No meters installed. Click "Add Meter" to commission the first one.</Typography>
        </Box>
      )}

      <Stack spacing={2}>
        {active.map(m => (
          <Paper key={m.id} sx={{
            p: 2, cursor: 'pointer',
            border: 2, borderColor: selectedMeter?.id === m.id ? 'primary.main' : 'transparent',
          }}
            onClick={() => setSelectedMeter(prev => prev?.id === m.id ? null : m)}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: `${UTILITY_COLORS[m.utilityValue]}.lighter` }}>
                <IconifyIcon icon={UTILITY_ICONS[m.utilityValue]}
                  sx={{ color: `${UTILITY_COLORS[m.utilityValue]}.main` }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{m.meterNumber}</Typography>
                  <Chip size="small" label={m.utilityType} color="neutral" variant="soft" />
                  <Chip size="small" label={m.meterMode} color="primary" variant="soft" />
                </Stack>
                {m.location && <Typography variant="caption" color="text.secondary">{m.location}</Typography>}
                {m.latestReading && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Last reading: {m.latestReading.readingValue} {m.unitOfMeasure} on {fmt(m.latestReading.readingDate)}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={0.5} onClick={e => e.stopPropagation()}>
                <Tooltip title="Log Reading">
                  <IconButton size="small" onClick={() => setReadingTarget(m)}>
                    <IconifyIcon icon="material-symbols:edit-square-outline-rounded" />
                  </IconButton>
                </Tooltip>
                {m.meterModeValue === 1 && (
                  <Tooltip title="Log Token">
                    <IconButton size="small" onClick={() => setTokenTarget(m)}>
                      <IconifyIcon icon="material-symbols:token-outline-rounded" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Installation Report">
                  <IconButton size="small" onClick={() => setReportMeterId(m.id)}>
                    <IconifyIcon icon="material-symbols:description-outline-rounded" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Retire Meter">
                  <IconButton size="small" color="error" onClick={() => setRetireTarget(m)}>
                    <IconifyIcon icon="material-symbols:power-settings-new-rounded" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Expanded: reading history */}
            {selectedMeter?.id === m.id && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Reading History ({m.readingCount})
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {readings.slice(0, 5).map(r => (
                    <Stack key={r.id} direction="row" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={r.readingType} color="neutral" variant="soft" />
                        <Typography variant="body2">{r.readingValue} {m.unitOfMeasure}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{fmt(r.readingDate)}</Typography>
                    </Stack>
                  ))}
                  {readings.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No readings logged yet.</Typography>
                  )}
                </Stack>
                {m.meterModeValue === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Token History
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {tokens.slice(0, 5).map(t => (
                        <Stack key={t.id} direction="row" justifyContent="space-between">
                          <Typography variant="body2">{t.tokenCode}</Typography>
                          <Typography variant="body2" color="text.secondary">${t.amountPaid} • {fmt(t.purchasedAt)}</Typography>
                        </Stack>
                      ))}
                      {tokens.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No tokens logged yet.</Typography>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        ))}
      </Stack>

      {retired.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
            Retired Meters ({retired.length})
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {retired.map(m => (
              <Paper key={m.id} sx={{ p: 1.5, opacity: 0.6 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.elevation2' }}>
                    <IconifyIcon icon={UTILITY_ICONS[m.utilityValue]} sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.meterNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {m.utilityType} • {m.meterMode} • Retired {fmt(m.retiredAt)}
                    </Typography>
                  </Box>
                  <Tooltip title="Installation Report">
                    <IconButton size="small" onClick={() => setReportMeterId(m.id)}>
                      <IconifyIcon icon="material-symbols:description-outline-rounded" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      <AddMeterWizard unitId={unitId} open={wizardOpen} onClose={() => setWizardOpen(false)}
        onSaved={() => { mutate(); }} />
      <RetireMeterDialog meter={retireTarget} open={!!retireTarget}
        onClose={() => setRetireTarget(null)} onSaved={() => { setRetireTarget(null); mutate(); }} />
      <AddReadingDialog meter={readingTarget} open={!!readingTarget}
        onClose={() => setReadingTarget(null)} onSaved={() => { setReadingTarget(null); mutateReadings(); }} />
      <AddTokenDialog meter={tokenTarget} open={!!tokenTarget}
        onClose={() => setTokenTarget(null)} onSaved={() => { setTokenTarget(null); mutateTokens(); }} />
      <InstallationReportDialog meterId={reportMeterId} open={!!reportMeterId}
        onClose={() => setReportMeterId(null)} />
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT DETAIL DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function UnitDetailDrawer({
  unitId, open, onClose, onEdit,
}: {
  unitId: string | null; open: boolean; onClose: () => void; onEdit: () => void;
}) {
  const { data: unit, mutate } = useGetUnit(unitId);
  const { data: owners = [] } = useGetAssignableOwners();
  const { data: occupants = [] } = useGetAssignableOccupants();
  const { trigger: setOwner } = useSetOwner();
  const { trigger: removeOwner } = useRemoveOwner();
  const { trigger: addOccupant } = useAddOccupant();
  const { trigger: removeOccupant } = useRemoveOccupant();
  const [tab, setTab] = useState(0);
  const [ownerUserId, setOwnerUserId] = useState('');
  const [occupantUserId, setOccupantUserId] = useState('');
  const [moveInDate, setMoveInDate] = useState('');

  const handleSetOwner = async () => {
    if (!ownerUserId || !unitId) return;
    await setOwner({ unitId, userId: ownerUserId });
    setOwnerUserId('');
    mutate();
  };
  const handleRemoveOwner = async () => {
    if (!unitId) return;
    await removeOwner(unitId);
    mutate();
  };
  const handleAddOccupant = async () => {
    if (!occupantUserId || !unitId) return;
    await addOccupant({ unitId, userId: occupantUserId, moveInDate: moveInDate || null });
    setOccupantUserId(''); setMoveInDate('');
    mutate();
  };
  const handleRemoveOccupant = async (userId: string) => {
    if (!unitId) return;
    await removeOccupant({ unitId, userId });
    mutate();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 0 } }}>
      {!unit ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Drawer header */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Unit {unit.unitNumber}
                  {unit.block && ` — Block ${unit.block}`}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip size="small" label={unit.statusLabel}
                    color={STATUS_COLORS[unit.status] ?? 'neutral'} variant="soft" />
                  {unit.unitTypeName && <Chip size="small" label={unit.unitTypeName} color="neutral" variant="soft" />}
                </Stack>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit Unit">
                  <IconButton onClick={onEdit}><IconifyIcon icon="material-symbols:edit-outline-rounded" /></IconButton>
                </Tooltip>
                <IconButton onClick={onClose}><IconifyIcon icon="material-symbols:close-rounded" /></IconButton>
              </Stack>
            </Stack>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Details" />
            <Tab label="Residents" />
            <Tab label={`Meters (${unit.meters?.length ?? 0})`} />
          </Tabs>

          <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
            {/* Details Tab */}
            {tab === 0 && (
              <Stack spacing={2}>
                {[
                  ['Floor', unit.floor], ['Block', unit.block],
                  ['Description', unit.description], ['Notes', unit.notes],
                ].filter(r => r[1]).map(r => (
                  <Box key={r[0]!}>
                    <Typography variant="caption" color="text.secondary">{r[0]}</Typography>
                    <Typography variant="body2">{r[1]}</Typography>
                  </Box>
                ))}
                <Divider />
                <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                  {unit.sizeM2 != null && (
                    <Box><Typography variant="caption" color="text.secondary">Size</Typography>
                      <Typography variant="body2">{unit.sizeM2} m²</Typography></Box>
                  )}
                  {unit.bedrooms != null && (
                    <Box><Typography variant="caption" color="text.secondary">Bedrooms</Typography>
                      <Typography variant="body2">{unit.bedrooms}</Typography></Box>
                  )}
                  {unit.bathrooms != null && (
                    <Box><Typography variant="caption" color="text.secondary">Bathrooms</Typography>
                      <Typography variant="body2">{unit.bathrooms}</Typography></Box>
                  )}
                  <Box><Typography variant="caption" color="text.secondary">Parking Bays</Typography>
                    <Typography variant="body2">{unit.parkingBays}</Typography></Box>
                </Stack>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Monthly Levy</Typography>
                  <Typography variant="body2">
                    {unit.monthlyLevy != null
                      ? `$${unit.monthlyLevy.toLocaleString()} (unit override)`
                      : unit.defaultMonthlyLevy != null
                        ? `$${unit.defaultMonthlyLevy.toLocaleString()} (from type default)`
                        : '— not set'}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Residents Tab */}
            {tab === 1 && (
              <Stack spacing={3}>
                {/* Owner */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Owner</Typography>
                  {unit.owner ? (
                    <Stack direction="row" alignItems="center" spacing={1.5}
                      sx={{ p: 1.5, bgcolor: 'background.elevation1', borderRadius: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.lighter' }}>
                        <IconifyIcon icon="material-symbols:person-outline-rounded" sx={{ color: 'warning.main' }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{unit.owner.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{unit.owner.email}</Typography>
                      </Box>
                      <Tooltip title="Remove owner">
                        <IconButton size="small" color="error" onClick={handleRemoveOwner}>
                          <IconifyIcon icon="material-symbols:person-remove-outline-rounded" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Assign Owner</InputLabel>
                        <Select label="Assign Owner" value={ownerUserId} onChange={e => setOwnerUserId(e.target.value)}>
                          <MenuItem value="">— Select —</MenuItem>
                          {owners.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Button variant="outlined" size="small" onClick={handleSetOwner}>Assign</Button>
                    </Stack>
                  )}
                </Box>

                <Divider />

                {/* Occupants */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Occupants ({unit.occupants.length})
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {unit.occupants.map(o => (
                      <Stack key={o.id} direction="row" alignItems="center" spacing={1.5}
                        sx={{ p: 1.5, bgcolor: 'background.elevation1', borderRadius: 2 }}>
                        <Avatar sx={{ bgcolor: 'success.lighter' }}>
                          <IconifyIcon icon="material-symbols:person-outline-rounded" sx={{ color: 'success.main' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">{o.email}</Typography>
                        </Box>
                        <Tooltip title="Remove occupant">
                          <IconButton size="small" color="error"
                            onClick={() => handleRemoveOccupant(o.id)}>
                            <IconifyIcon icon="material-symbols:person-remove-outline-rounded" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack spacing={1}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Add Occupant</InputLabel>
                      <Select label="Add Occupant" value={occupantUserId} onChange={e => setOccupantUserId(e.target.value)}>
                        <MenuItem value="">— Select Resident —</MenuItem>
                        {occupants.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName} ({u.type})</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={1}>
                      <TextField label="Move-in Date" type="date" size="small" fullWidth value={moveInDate}
                        onChange={e => setMoveInDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                      <Button variant="outlined" size="small" onClick={handleAddOccupant}>Add</Button>
                    </Stack>
                  </Stack>
                </Box>

                {/* Tenancy History */}
                {unit.allUserUnits.filter(uu => uu.moveOutDate).length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Tenancy History</Typography>
                      <Stack spacing={1}>
                        {unit.allUserUnits.filter(uu => uu.moveOutDate).map(uu => (
                          <Stack key={uu.id} direction="row" justifyContent="space-between"
                            sx={{ p: 1, bgcolor: 'background.elevation1', borderRadius: 1 }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{uu.fullName}</Typography>
                              <Typography variant="caption" color="text.secondary">{uu.linkType}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {fmt(uu.moveInDate)} — {fmt(uu.moveOutDate)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            )}

            {/* Meters Tab */}
            {tab === 2 && unitId && <MetersTab unitId={unitId} />}
          </Box>
        </>
      )}
    </Drawer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function UnitsPage() {
  const { data: units = [], isLoading, mutate } = useGetUnits();
  const { trigger: del } = useDeleteUnit();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(-1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UnitDto | null>(null);
  const [drawerUnitId, setDrawerUnitId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = units;
    if (statusFilter >= 0) r = r.filter(u => u.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(u =>
        u.unitNumber.toLowerCase().includes(s) ||
        u.block?.toLowerCase().includes(s) ||
        u.owner?.fullName.toLowerCase().includes(s) ||
        u.occupants.some(o => o.fullName.toLowerCase().includes(s))
      );
    }
    return r;
  }, [units, search, statusFilter]);

  const handleEdit = (unit: UnitDto) => {
    setEditing(unit);
    setFormOpen(true);
    setDrawerUnitId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this unit? This cannot be undone.')) return;
    try { await del(id); await mutate(); } catch { alert('Cannot delete a unit with active occupants.'); }
  };

  const stats = useMemo(() => ({
    total: units.length,
    occupied: units.filter(u => u.status === 1).length,
    available: units.filter(u => u.status === 0).length,
    maintenance: units.filter(u => u.status === 3).length,
  }), [units]);

  const columns: GridColDef<UnitDto>[] = [
    {
      field: 'unitNumber', headerName: 'Unit', width: 130,
      renderCell: p => (
        <Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.row.unitNumber}</Typography>
          {p.row.block && <Typography variant="caption" color="text.secondary">Block {p.row.block}</Typography>}
        </Stack>
      ),
    },
    {
      field: 'unitTypeName', headerName: 'Type', width: 130,
      renderCell: p => p.row.unitTypeName
        ? <Chip size="small" label={p.row.unitTypeName} color="neutral" variant="soft" />
        : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: p => (
        <Chip size="small" label={p.row.statusLabel}
          color={STATUS_COLORS[p.row.status] ?? 'neutral'} variant="soft" />
      ),
    },
    {
      field: 'owner', headerName: 'Owner', flex: 1,
      renderCell: p => p.row.owner
        ? <Typography variant="body2">{p.row.owner.fullName}</Typography>
        : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'occupants', headerName: 'Occupants', width: 120,
      renderCell: p => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconifyIcon icon="material-symbols:person-outline-rounded" sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{p.row.occupants.length}</Typography>
        </Stack>
      ),
    },
    {
      field: 'meterCount', headerName: 'Meters', width: 90,
      renderCell: p => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconifyIcon icon="material-symbols:electric-meter-outline-rounded" sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{p.row.meterCount}</Typography>
        </Stack>
      ),
    },
    {
      field: 'monthlyLevy', headerName: 'Levy', width: 100,
      renderCell: p => p.row.monthlyLevy != null
        ? <Typography variant="body2">${p.row.monthlyLevy.toLocaleString()}</Typography>
        : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'actions', headerName: '', width: 100, sortable: false,
      renderCell: p => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setDrawerUnitId(p.row.id)}>
              <IconifyIcon icon="material-symbols:open-in-new-rounded" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(p.row)}>
              <IconifyIcon icon="material-symbols:edit-outline-rounded" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}>
              <IconifyIcon icon="material-symbols:delete-outline-rounded" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Units</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all units, residents, and utility meters
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Unit
        </Button>
      </Stack>

      {/* Stat chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`${stats.total} Total`} color="neutral" variant="soft" onClick={() => setStatusFilter(-1)} />
        <Chip label={`${stats.occupied} Occupied`} color="info" variant="soft" onClick={() => setStatusFilter(1)} />
        <Chip label={`${stats.available} Available`} color="success" variant="soft" onClick={() => setStatusFilter(0)} />
        {stats.maintenance > 0 && (
          <Chip label={`${stats.maintenance} Maintenance`} color="error" variant="soft" onClick={() => setStatusFilter(3)} />
        )}
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField size="small" placeholder="Search unit, block, owner…" value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><IconifyIcon icon="material-symbols:search-rounded" /></InputAdornment> }}
          sx={{ width: 280 }} />
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(+e.target.value)}>
            <MenuItem value={-1}>All Statuses</MenuItem>
            {Object.entries(UNIT_STATUS).map(([v, l]) => <MenuItem key={v} value={+v}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        {(search || statusFilter >= 0) && (
          <Button size="small" onClick={() => { setSearch(''); setStatusFilter(-1); }}>Clear</Button>
        )}
      </Stack>

      {/* DataGrid */}
      <Paper>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          autoHeight
          rowHeight={56}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          disableColumnMenu
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Paper>

      {/* Unit Form Dialog */}
      <UnitFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={mutate}
        editing={editing}
      />

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer
        unitId={drawerUnitId}
        open={!!drawerUnitId}
        onClose={() => setDrawerUnitId(null)}
        onEdit={() => {
          const unit = units.find(u => u.id === drawerUnitId);
          if (unit) handleEdit(unit);
        }}
      />
    </Box>
  );
}
