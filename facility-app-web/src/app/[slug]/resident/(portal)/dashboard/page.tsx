"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentDashboard } from "services/swr/api-hooks/useResidentApi";

const NAV_ACTIONS = [
  { label: "Pre-register",  icon: "material-symbols:person-add-outline-rounded",     href: "pre-register"  },
  { label: "My Visits",     icon: "material-symbols:calendar-month-outline-rounded",  href: "visits"        },
  { label: "Maintenance",   icon: "material-symbols:build-outline-rounded",           href: "maintenance"   },
  { label: "My Vehicles",   icon: "material-symbols:directions-car-outline-rounded",  href: "vehicles"      },
  { label: "My Parcels",    icon: "material-symbols:package-2-outline-rounded",       href: "parcels"       },
  { label: "Documents",     icon: "material-symbols:folder-outline-rounded",          href: "documents"     },
  { label: "My Profile",    icon: "material-symbols:account-circle-outline-rounded",  href: "profile"       },
];

const statusColor: Record<string, "default" | "primary" | "warning" | "error" | "success"> = {
  Scheduled:  "primary",
  Active:     "success",
  Completed:  "default",
  Cancelled:  "error",
  NoShow:     "warning",
};

export default function ResidentDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: stats, isLoading, error, mutate } = useResidentDashboard();

  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email;
  const go = (href: string) => router.push(`/${slug}/resident/${href}`);

  if (error) return <ComingSoon onRetry={mutate} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ mb: 3, gap: 2, justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
            <IconifyIcon
              icon="material-symbols:dashboard-outline-rounded"
              sx={{ fontSize: 24, color: "primary.main" }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              My Dashboard
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </Typography>
        </Box>

        {/* Request unit / pending state */}
        {!isLoading && stats && !stats.hasUnit && (
          stats.pendingUnitRequest ? (
            <Chip
              icon={<IconifyIcon icon="material-symbols:hourglass-outline-rounded" />}
              label="Unit request pending review"
              color="warning"
              variant="outlined"
            />
          ) : (
            <Button
              variant="contained"
              color="warning"
              startIcon={<IconifyIcon icon="material-symbols:home-outline-rounded" />}
              onClick={() => go("request-unit")}
            >
              Request Your Unit
            </Button>
          )
        )}
      </Stack>

      {/* Quick action chips */}
      <Stack direction="row" sx={{ gap: 1, mb: 3, flexWrap: "wrap" }}>
        {NAV_ACTIONS.map((item) => (
          <Button
            key={item.href}
            size="small"
            variant="outlined"
            color="neutral"
            startIcon={<IconifyIcon icon={item.icon} sx={{ fontSize: 16 }} />}
            onClick={() => go(item.href)}
            sx={{ borderRadius: 5, px: 2 }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label:  "Upcoming",
            value:  stats?.upcomingVisits,
            icon:   "material-symbols:event-upcoming-outline-rounded",
            color:  "primary.main",
          },
          {
            label:  "Currently Inside",
            value:  stats?.activeVisits,
            icon:   "material-symbols:door-open-outline-rounded",
            color:  "success.main",
          },
          {
            label:  "Total Visits",
            value:  stats?.totalVisits,
            icon:   "material-symbols:groups-outline-rounded",
            color:  "text.secondary",
          },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="text" width={40} sx={{ mx: "auto", mb: 0.5 }} />
                    <Skeleton variant="text" width={70} sx={{ mx: "auto" }} />
                  </>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Notification pills */}
      {!isLoading && stats && (stats.pendingParcels > 0 || stats.openMaintenance > 0) && (
        <Stack direction="row" sx={{ gap: 1, mb: 3, flexWrap: "wrap" }}>
          {stats.pendingParcels > 0 && (
            <Alert
              severity="info"
              icon={<IconifyIcon icon="material-symbols:package-2-outline-rounded" />}
              sx={{ py: 0.5, cursor: "pointer" }}
              onClick={() => go("parcels")}
            >
              {stats.pendingParcels} parcel{stats.pendingParcels > 1 ? "s" : ""} waiting for collection
            </Alert>
          )}
          {stats.openMaintenance > 0 && (
            <Alert
              severity="warning"
              icon={<IconifyIcon icon="material-symbols:build-outline-rounded" />}
              sx={{ py: 0.5, cursor: "pointer" }}
              onClick={() => go("maintenance")}
            >
              {stats.openMaintenance} maintenance request{stats.openMaintenance > 1 ? "s" : ""} in progress
            </Alert>
          )}
        </Stack>
      )}

      {/* Upcoming visits */}
      <Card variant="outlined">
        <Stack
          direction="row"
          sx={{ px: 2.5, py: 1.5, justifyContent: "space-between", alignItems: "center" }}
        >
          <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
            <IconifyIcon
              icon="material-symbols:event-upcoming-outline-rounded"
              sx={{ fontSize: 20, color: "primary.main" }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Upcoming Visits
            </Typography>
          </Stack>
          <Button size="small" endIcon={<IconifyIcon icon="material-symbols:arrow-forward-rounded" />} onClick={() => go("visits")}>
            View All
          </Button>
        </Stack>

        <Divider />

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" height={48} sx={{ mb: 0.5 }} />
            ))}
          </Box>
        ) : !stats?.upcomingVisitsList?.length ? (
          <Stack sx={{ py: 5, gap: 1, alignItems: "center" }}>
            <IconifyIcon
              icon="material-symbols:event-busy-outline-rounded"
              sx={{ fontSize: 40, color: "text.disabled" }}
            />
            <Typography variant="body2" color="text.disabled">
              No upcoming visits scheduled.
            </Typography>
            <Button
              size="small"
              variant="soft"
              color="primary"
              onClick={() => go("pre-register")}
              startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
            >
              Pre-register a visitor
            </Button>
          </Stack>
        ) : (
          <Box>
            {stats.upcomingVisitsList.map((visit, i) => (
              <Box key={visit.id}>
                {i > 0 && <Divider />}
                <Stack
                  direction="row"
                  sx={{ px: 2.5, py: 1.5, justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {visit.visitorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {visit.purpose}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(visit.scheduledAt).format("DD MMM, h:mm A")}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Container>
  );
}
