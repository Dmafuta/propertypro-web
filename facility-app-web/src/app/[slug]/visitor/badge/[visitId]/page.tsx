import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getPublicBadge } from 'services/swr/api-hooks/useBadgeApi';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<number, string> = {
  0: 'Scheduled', 1: 'Active', 2: 'Completed', 3: 'Cancelled', 4: 'No Show',
};
const STATUS_COLORS: Record<number, string> = {
  0: '#f59e0b', 1: '#10b981', 2: '#6b7280', 3: '#ef4444', 4: '#f97316',
};

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// ── Page (server component) ────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string; visitId: string }>;
}

export default async function PublicBadgePage({ params }: PageProps) {
  const { visitId } = await params;
  const badge = await getPublicBadge(visitId);

  if (!badge) {
    return (
      <Box
        sx={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', bgcolor: '#f9fafb',
        }}
      >
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Badge not found</Typography>
          <Typography color="text.secondary">
            This visitor pass may have expired or the link is incorrect.
          </Typography>
        </Box>
      </Box>
    );
  }

  const accent      = badge.tenantPrimaryColour ?? '#1b6ec2';
  const statusColor = STATUS_COLORS[badge.status] ?? '#6b7280';
  const statusLabel = STATUS_LABELS[badge.status] ?? 'Unknown';

  const detailRow = (icon: string, label: string, value: string | null | undefined) =>
    value ? (
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ fontSize: 18, color: '#9ca3af', mt: 0.1 }}>
          {/* inline svg icons so the public page has no client JS dependency */}
          {icon === 'purpose'   && <span>📋</span>}
          {icon === 'host'      && <span>👤</span>}
          {icon === 'time'      && <span>🕐</span>}
          {icon === 'gate'      && <span>🚪</span>}
          {icon === 'phone'     && <span>📞</span>}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    ) : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          bgcolor: '#ffffff',
        }}
      >
        {/* header strip */}
        <Box
          sx={{
            bgcolor: accent,
            px: 3, py: 3,
            display: 'flex', alignItems: 'center', gap: 2,
          }}
        >
          {badge.tenantLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badge.tenantLogoUrl}
              alt={badge.tenantName}
              style={{ height: 36, objectFit: 'contain' }}
            />
          ) : (
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🏢
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
              {badge.tenantName}
            </Typography>
            <Box
              sx={{
                display: 'inline-block', mt: 0.5,
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 0.5, px: 1, py: 0.1,
              }}
            >
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>
                VISITOR PASS
              </Typography>
            </Box>
          </Box>
          {/* status pill */}
          <Box
            sx={{
              bgcolor: statusColor,
              borderRadius: 5, px: 1.5, py: 0.4,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
              {statusLabel}
            </Typography>
          </Box>
        </Box>

        {/* visitor info */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mb: 3 }}>
            {badge.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badge.photoUrl}
                alt={badge.visitorName}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  bgcolor: `${accent}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accent, fontWeight: 700, fontSize: 24,
                }}
              >
                {getInitials(badge.visitorName)}
              </Box>
            )}
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#111827', lineHeight: 1.2 }}>
                {badge.visitorName}
              </Typography>
              {badge.company && (
                <Typography sx={{ fontSize: 13, color: '#6b7280', mt: 0.3 }}>
                  {badge.company}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* divider */}
          <Box sx={{ borderTop: '1px solid #f0f0f0', mb: 2.5 }} />

          {/* detail rows */}
          <Stack sx={{ gap: 2 }}>
            {detailRow('purpose', 'Purpose', badge.purpose)}
            {detailRow('host', 'Visiting', badge.hostName)}
            {detailRow('time', badge.checkedInAt ? 'Checked In' : 'Scheduled', fmtDateTime(badge.checkedInAt ?? badge.scheduledAt))}
            {detailRow('gate', 'Entry Gate', badge.entryEntrance)}
            {detailRow('phone', 'Phone', badge.visitorPhone)}
          </Stack>
        </Box>

        {/* footer */}
        <Box
          sx={{
            bgcolor: '#f9fafb',
            borderTop: '1px solid #f0f0f0',
            px: 3, py: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>
            REF: {visitId.split('-')[0].toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
            Powered by FacilityApp
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
