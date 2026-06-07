"use client";

import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentParcels, type ParcelStatus, type ResidentParcel } from "services/swr/api-hooks/useResidentApi";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ParcelStatus, {
  color: 'warning' | 'success' | 'neutral';
  icon: string;
  avatarColor: string;
  label: string;
}> = {
  Pending:   { color: 'warning', icon: 'material-symbols:pending-outline-rounded',       avatarColor: 'warning', label: 'Awaiting collection' },
  Collected: { color: 'success', icon: 'material-symbols:check-circle-outline-rounded',  avatarColor: 'success', label: 'Collected'           },
  Returned:  { color: 'neutral', icon: 'material-symbols:keyboard-return-outline-rounded', avatarColor: 'neutral', label: 'Returned'           },
};

const TABS: { label: string; value: ParcelStatus | undefined; icon: string }[] = [
  { label: 'Pending',   value: 'Pending',   icon: 'material-symbols:pending-outline-rounded'      },
  { label: 'Collected', value: 'Collected', icon: 'material-symbols:check-circle-outline-rounded' },
  { label: 'Returned',  value: 'Returned',  icon: 'material-symbols:keyboard-return-outline-rounded' },
  { label: 'All',       value: undefined,   icon: 'material-symbols:package-2-outline-rounded'    },
];

// ── Parcel Card ───────────────────────────────────────────────────────────────

function ParcelCard({ parcel, isLast }: { parcel: ResidentParcel; isLast: boolean }) {
  const cfg = STATUS_CONFIG[parcel.status];

  return (
    <>
      <Stack direction="row" gap={2} sx={{ px: 2.5, py: 2.5, alignItems: "flex-start" }}>
        {/* Icon avatar */}
        <Avatar
          variant="rounded"
          sx={{
            width: 48, height: 48,
            bgcolor: `${cfg.avatarColor}.lighter`,
            color: `${cfg.avatarColor}.main`,
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon="material-symbols:package-2-outline-rounded" sx={{ fontSize: 26 }} />
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
              {parcel.description}
            </Typography>
            <Chip
              label={parcel.status}
              color={cfg.color}
              variant="soft"
              size="small"
              icon={<IconifyIcon icon={cfg.icon} width={13} />}
              sx={{ flexShrink: 0 }}
            />
          </Stack>

          {/* Courier badge */}
          {parcel.courier && (
            <Stack direction="row" gap={0.75} alignItems="center" sx={{ mt: 0.75 }}>
              <IconifyIcon icon="material-symbols:local-shipping-outline-rounded" sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                via <strong>{parcel.courier}</strong>
              </Typography>
            </Stack>
          )}

          {/* Timeline row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 0.5, sm: 2 }} sx={{ mt: 1 }}>
            <Stack direction="row" gap={0.75} alignItems="center">
              <IconifyIcon icon="material-symbols:calendar-add-on-outline-rounded" sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                Received {dayjs(parcel.receivedAt).format("DD MMM YYYY [at] HH:mm")}
              </Typography>
            </Stack>

            {parcel.collectedAt && (
              <>
                <Typography variant="caption" color="text.disabled" sx={{ display: { xs: 'none', sm: 'block' } }}>·</Typography>
                <Stack direction="row" gap={0.75} alignItems="center">
                  <IconifyIcon icon="material-symbols:person-check-outline-rounded" sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Collected {dayjs(parcel.collectedAt).format("DD MMM YYYY")}
                    {parcel.collectedBy ? ` by ${parcel.collectedBy}` : ""}
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Stack>
      {!isLast && <Divider />}
    </>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: number }) {
  const messages = [
    { icon: 'material-symbols:pending-outline-rounded', text: 'No parcels waiting for collection' },
    { icon: 'material-symbols:check-circle-outline-rounded', text: 'No collected parcels yet' },
    { icon: 'material-symbols:keyboard-return-outline-rounded', text: 'No returned parcels' },
    { icon: 'material-symbols:package-2-outline-rounded', text: 'No parcels found' },
  ];
  const msg = messages[tab] ?? messages[3];
  return (
    <Stack sx={{ py: 8, gap: 1.5, alignItems: "center" }}>
      <Avatar
        variant="rounded"
        sx={{ width: 64, height: 64, bgcolor: 'background.elevation1', borderRadius: 3 }}
      >
        <IconifyIcon icon={msg.icon} sx={{ fontSize: 36, color: 'text.disabled' }} />
      </Avatar>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>{msg.text}</Typography>
      <Typography variant="caption" color="text.disabled">
        Staff will notify you when a parcel arrives
      </Typography>
    </Stack>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ParcelsPage() {
  const [tab, setTab] = useState(0);
  const { data: parcels, isLoading, error, mutate } = useResidentParcels(TABS[tab].value);
  if (error) return <ComingSoon onRetry={mutate} />;

  const pendingCount = tab === 3
    ? parcels?.filter((p) => p.status === 'Pending').length ?? 0
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 4 }}>
        <Avatar
          variant="rounded"
          sx={{ width: 44, height: 44, bgcolor: 'primary.lighter', borderRadius: 2 }}
        >
          <IconifyIcon icon="material-symbols:package-2-outline-rounded" sx={{ fontSize: 26, color: 'primary.main' }} />
        </Avatar>
        <Box>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>My Parcels</Typography>
            {pendingCount > 0 && (
              <Chip label={`${pendingCount} pending`} color="warning" variant="soft" size="small" />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">Track deliveries and collection history</Typography>
        </Box>
      </Stack>

      {/* Card with tabs */}
      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 52 },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.label}
              label={t.label}
              icon={<IconifyIcon icon={t.icon} sx={{ fontSize: 18 }} />}
              iconPosition="start"
              sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
            />
          ))}
        </Tabs>

        {isLoading ? (
          <Box sx={{ p: 2.5 }}>
            {[1, 2, 3].map((i) => (
              <Stack key={i} direction="row" gap={2} sx={{ p: 1, mb: 1.5 }}>
                <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
                <Stack flex={1} gap={0.75}>
                  <Skeleton variant="text" width="60%" height={18} />
                  <Skeleton variant="text" width="40%" height={14} />
                  <Skeleton variant="text" width="50%" height={14} />
                </Stack>
              </Stack>
            ))}
          </Box>
        ) : !parcels?.length ? (
          <EmptyState tab={tab} />
        ) : (
          <Box>
            {parcels.map((parcel, i) => (
              <ParcelCard key={parcel.id} parcel={parcel} isLast={i === parcels.length - 1} />
            ))}
          </Box>
        )}

        {/* Footer summary when viewing all */}
        {tab === 3 && !!parcels?.length && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.elevation1' }}>
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              {(Object.keys(STATUS_CONFIG) as ParcelStatus[]).map((s) => {
                const count = parcels.filter((p) => p.status === s).length;
                if (!count) return null;
                return (
                  <Chip
                    key={s}
                    label={`${count} ${s}`}
                    color={STATUS_CONFIG[s].color}
                    variant="soft"
                    size="small"
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
