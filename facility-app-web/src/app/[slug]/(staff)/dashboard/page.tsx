"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import ECommerce from "components/sections/dashboards/e-commerce";
import Analytics from "components/sections/dashboards/analytics";
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
    <Box>
      {/* Header + live KPI stat cards */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
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

        <Grid container spacing={2}>
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
      </Container>

      {/* Aurora E-Commerce dashboard — mock data, will be wired up in Phase 2 */}
      <ECommerce />

      {/* Aurora Analytics dashboard — mock data, will be wired up in Phase 2 */}
      <Analytics />
    </Box>
  );
}
