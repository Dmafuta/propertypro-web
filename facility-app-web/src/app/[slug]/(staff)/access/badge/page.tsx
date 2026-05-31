'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import IconifyIcon from 'components/base/IconifyIcon';
import { BadgeDto, useGetVisitBadge, useSendBadge } from 'services/swr/api-hooks/useBadgeApi';
import { VisitDto, useGetVisits } from 'services/swr/api-hooks/useVisitorsApi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<number, string> = {
  0: 'Scheduled', 1: 'Checked In', 2: 'Checked Out', 3: 'Cancelled', 4: 'No Show',
};
const STATUS_COLORS: Record<number, 'default' | 'success' | 'neutral' | 'error' | 'warning'> = {
  0: 'default', 1: 'success', 2: 'neutral', 3: 'error', 4: 'warning',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Badge card (print-ready) ──────────────────────────────────────────────────

interface BadgeCardProps {
  badge: BadgeDto;
  badgeRef: React.RefObject<HTMLDivElement | null>;
}

const BadgeCard = ({ badge, badgeRef }: BadgeCardProps) => {
  const accent = badge.tenantPrimaryColour ?? '#1b6ec2';

  return (
    <Box
      ref={badgeRef}
      className="badge-print-area"
      sx={{
        width: 340,
        mx: 'auto',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 4,
        fontFamily: 'inherit',
      }}
    >
      {/* header strip */}
      <Box
        sx={{
          bgcolor: accent,
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        {badge.tenantLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={badge.tenantLogoUrl} alt="logo" style={{ height: 32, objectFit: 'contain' }} />
        ) : (
          <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 28, color: '#fff' }} />
        )}
        <Stack sx={{ flex: 1 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            {badge.tenantName}
          </Typography>
          <Box
            sx={{
              display: 'inline-block', mt: 0.5,
              border: '1px solid rgba(255,255,255,0.7)',
              borderRadius: 0.5, px: 0.8, py: 0.1,
              alignSelf: 'flex-start',
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>
              VISITOR PASS
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={STATUS_LABELS[badge.status] ?? 'Unknown'}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 10,
            height: 20,
          }}
        />
      </Box>

      {/* visitor info */}
      <Box sx={{ bgcolor: 'background.paper', px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 2 }}>
          {badge.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badge.photoUrl}
              alt={badge.visitorName}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Avatar
              sx={{
                width: 56, height: 56, flexShrink: 0,
                bgcolor: `${accent}22`, color: accent,
                fontWeight: 700, fontSize: 22,
              }}
            >
              {getInitials(badge.visitorName)}
            </Avatar>
          )}
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, lineClamp: 1 }}>
              {badge.visitorName}
            </Typography>
            {badge.company && (
              <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 1 }}>
                {badge.company}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {badge.visitorPhone}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* detail rows */}
        <Stack sx={{ gap: 1.2 }}>
          <Stack direction="row" sx={{ gap: 1 }}>
            <IconifyIcon icon="material-symbols:info-outline-rounded" sx={{ fontSize: 16, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>Purpose</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.purpose}</Typography>
          </Stack>
          {badge.hostName && (
            <Stack direction="row" sx={{ gap: 1 }}>
              <IconifyIcon icon="material-symbols:person-outline-rounded" sx={{ fontSize: 16, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>Host</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.hostName}</Typography>
            </Stack>
          )}
          <Stack direction="row" sx={{ gap: 1 }}>
            <IconifyIcon icon="material-symbols:schedule-outline-rounded" sx={{ fontSize: 16, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>
              {badge.checkedInAt ? 'Checked in' : 'Scheduled'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {fmtDateTime(badge.checkedInAt ?? badge.scheduledAt)}
            </Typography>
          </Stack>
          {badge.entryEntrance && (
            <Stack direction="row" sx={{ gap: 1 }}>
              <IconifyIcon icon="material-symbols:sensor-door-outline-rounded" sx={{ fontSize: 16, color: 'text.disabled', mt: 0.1, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>Gate</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.entryEntrance}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* footer */}
      <Box sx={{ bgcolor: 'background.elevation1', px: 3, py: 1.5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          {badge.visitId.split('-')[0].toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Actions panel ─────────────────────────────────────────────────────────────

interface ActionsProps {
  badge: BadgeDto;
  visitId: string;
  slug: string;
}

const BadgeActions = ({ badge, visitId, slug }: ActionsProps) => {
  const { trigger: sendBadge, isMutating: sending } = useSendBadge();
  const [snack, setSnack]   = useState<{ msg: string; sev: 'success' | 'error' } | null>(null);
  const [emailOverride, setEmailOverride] = useState('');

  const badgeUrl  = `${window.location.origin}/${slug}/visitor/badge/${visitId}`;
  const whatsApp  = `https://wa.me/${badge.visitorPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi ${badge.visitorName}, here is your visitor pass for ${badge.tenantName}: ${badgeUrl}`,
  )}`;
  const telegram  = `https://t.me/share/url?url=${encodeURIComponent(badgeUrl)}&text=${encodeURIComponent(
    `Visitor pass for ${badge.visitorName} — ${badge.tenantName}`,
  )}`;

  const handlePrint = () => window.print();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(badgeUrl);
    setSnack({ msg: 'Badge link copied!', sev: 'success' });
  };

  const handleEmail = async () => {
    try {
      await sendBadge({ visitId, customEmail: emailOverride || null });
      setSnack({ msg: `Badge sent to ${emailOverride || badge.visitorEmail}`, sev: 'success' });
    } catch (err: any) {
      setSnack({ msg: err?.data?.error ?? 'Failed to send email.', sev: 'error' });
    }
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Send / Share</Typography>

      {/* email */}
      <Stack sx={{ gap: 1 }}>
        <TextField
          size="small"
          label="Email address"
          value={emailOverride}
          onChange={(e) => setEmailOverride(e.target.value)}
          placeholder={badge.visitorEmail || 'visitor@example.com'}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="material-symbols:mail-outline-rounded" sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          fullWidth
          loading={sending}
          startIcon={<IconifyIcon icon="material-symbols:send-outline-rounded" sx={{ fontSize: 18 }} />}
          onClick={handleEmail}
        >
          Send Badge by Email
        </Button>
      </Stack>

      <Divider />

      {/* WhatsApp */}
      <Button
        variant="outlined"
        fullWidth
        component="a"
        href={whatsApp}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<IconifyIcon icon="mdi:whatsapp" sx={{ fontSize: 20, color: '#25D366' }} />}
        sx={{ justifyContent: 'flex-start', pl: 2 }}
      >
        Send via WhatsApp
      </Button>

      {/* Telegram */}
      <Button
        variant="outlined"
        fullWidth
        component="a"
        href={telegram}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<IconifyIcon icon="mdi:telegram" sx={{ fontSize: 20, color: '#2AABEE' }} />}
        sx={{ justifyContent: 'flex-start', pl: 2 }}
      >
        Share via Telegram
      </Button>

      <Divider />

      {/* Copy & Print */}
      <Stack direction="row" sx={{ gap: 1 }}>
        <Tooltip title="Copy shareable badge link">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<IconifyIcon icon="material-symbols:link-rounded" sx={{ fontSize: 18 }} />}
            onClick={handleCopy}
          >
            Copy Link
          </Button>
        </Tooltip>
        <Tooltip title="Print badge">
          <Button
            variant="outlined"
            fullWidth
            startIcon={<IconifyIcon icon="material-symbols:print-outline-rounded" sx={{ fontSize: 18 }} />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Tooltip>
      </Stack>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.sev ?? 'success'} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BadgePage() {
  const params = useParams<{ slug: string }>();
  const slug   = params?.slug ?? '';

  const [search,      setSearch]      = useState('');
  const [dSearch,     setDSearch]     = useState('');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDSearch(val), 400);
  }, []);

  const { data: todayData, isLoading: loadingList } = useGetVisits('today', dSearch, 1);
  const { data: badge,     isLoading: loadingBadge } = useGetVisitBadge(selectedId);

  const visits = useMemo(() => todayData?.items ?? [], [todayData]);

  return (
    <>
      {/* print stylesheet — hides everything except badge */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .badge-print-area,
          .badge-print-area * { display: revert !important; }
          .badge-print-area {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      <Box sx={{ p: { xs: 2, md: 4 }, height: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Visitor Badges
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Select a visitor to preview, print, or share their badge
        </Typography>

        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          {/* ── Left: visitor list ── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search visitors…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {loadingList ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              ) : visits.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No visitors today
                  </Typography>
                </Box>
              ) : (
                <List disablePadding sx={{ maxHeight: 480, overflowY: 'auto' }}>
                  {visits.map((v: VisitDto) => (
                    <ListItemButton
                      key={v.id}
                      selected={selectedId === v.id}
                      onClick={() => setSelectedId(v.id)}
                      divider
                    >
                      <Avatar
                        sx={{
                          width: 36, height: 36, mr: 1.5, flexShrink: 0,
                          bgcolor: 'primary.lighter', color: 'primary.main',
                          fontSize: 13, fontWeight: 700,
                        }}
                      >
                        {getInitials(v.visitor.fullName)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, lineClamp: 1 }}>
                              {v.visitor.fullName}
                            </Typography>
                            <Chip
                              label={STATUS_LABELS[v.status]}
                              color={STATUS_COLORS[v.status] as any}
                              variant="soft"
                              size="small"
                            />
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {v.purpose} · {fmtTime(v.checkedInAt ?? v.scheduledAt)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* ── Right: badge preview + actions ── */}
          <Grid size={{ xs: 12, md: 8 }}>
            {!selectedId && (
              <Box
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', py: 10, gap: 2, textAlign: 'center',
                }}
              >
                <Avatar variant="rounded" sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'primary.lighter' }}>
                  <IconifyIcon icon="material-symbols:badge-outline-rounded" sx={{ fontSize: 36, color: 'primary.main' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Select a visitor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                  Choose a visitor from the list to preview their badge and send or print it
                </Typography>
              </Box>
            )}

            {selectedId && loadingBadge && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            )}

            {selectedId && badge && !loadingBadge && (
              <Grid container spacing={3}>
                {/* badge preview */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Badge Preview
                  </Typography>
                  <BadgeCard badge={badge} badgeRef={badgeRef} />
                </Grid>

                {/* actions */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper sx={{ p: 3 }}>
                    <BadgeActions badge={badge} visitId={selectedId} slug={slug} />
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
