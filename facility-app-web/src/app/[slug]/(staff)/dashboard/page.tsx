"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useGetDashboard } from "services/swr/api-hooks/useDashboardApi";

const STAT_ITEMS = [
  { key: "todayVisits",         label: "Visits Today",        icon: "material-symbols:groups-outline-rounded",              color: "primary.main"   },
  { key: "activeVisits",        label: "Currently Inside",     icon: "material-symbols:door-open-outline-rounded",           color: "success.main"   },
  { key: "pendingParcels",      label: "Pending Parcels",      icon: "material-symbols:package-2-outline-rounded",           color: "warning.main"   },
  { key: "openMaintenance",     label: "Open Maintenance",     icon: "material-symbols:build-outline-rounded",               color: "error.main"     },
  { key: "totalUnits",          label: "Total Units",          icon: "material-symbols:apartment-outline-rounded",           color: "text.secondary" },
  { key: "occupiedUnits",       label: "Occupied Units",       icon: "material-symbols:home-outline-rounded",                color: "info.main"      },
  { key: "openIncidents",       label: "Open Incidents",       icon: "material-symbols:warning-outline-rounded",             color: "error.main"     },
  { key: "pendingUnitRequests", label: "Unit Requests",        icon: "material-symbols:pending-actions-outline-rounded",     color: "warning.main"   },
] as const;

export default function StaffDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: stats, isLoading, error, mutate } = useGetDashboard();

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  if (error) return <ComingSoon onRetry={mutate} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ mb: 4, gap: 2, justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:dashboard-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {firstName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
          onClick={() => router.push(`/${slug}/visitors`)}
        >
          Check In Visitor
        </Button>
      </Stack>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STAT_ITEMS.map(({ key, label, icon, color }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    {isLoading ? (
                      <Skeleton variant="text" width={48} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ color, lineHeight: 1, fontWeight: 700 }}>
                        {(stats as any)?.[key] ?? 0}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconifyIcon icon={icon} sx={{ fontSize: 20, color }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming visits */}
      <Card variant="outlined">
        <Stack direction="row" sx={{ px: 2.5, py: 1.5, justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:event-upcoming-outline-rounded" sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Upcoming Visits</Typography>
          </Stack>
          <Button
            size="small"
            endIcon={<IconifyIcon icon="material-symbols:arrow-forward-rounded" />}
            onClick={() => router.push(`/${slug}/visitors`)}
          >
            View All
          </Button>
        </Stack>

        <Divider />

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="text" height={48} />)}
          </Box>
        ) : !stats?.upcomingVisits?.length ? (
          <Stack sx={{ py: 5, gap: 1, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:event-busy-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No upcoming visits scheduled.</Typography>
          </Stack>
        ) : (
          stats.upcomingVisits.map((visit, i) => (
            <Box key={visit.id}>
              {i > 0 && <Divider />}
              <Stack direction="row" sx={{ px: 2.5, py: 1.5, justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{visit.visitorName}</Typography>
                  <Typography variant="caption" color="text.secondary">{visit.purpose}</Typography>
                </Box>
                <Stack sx={{ alignItems: "flex-end" }}>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(visit.scheduledAt).format("DD MMM YYYY")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(visit.scheduledAt).format("h:mm A")}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))
        )}
      </Card>
    </Container>
  );
}
