"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import AnalyticKPI from "components/sections/dashboards/analytics/kpi/AnalyticKPI";
import { useListTenants } from "services/swr/api-hooks/useSuperAdminApi";
import type { AnalyticKPIData } from "types/analytics";

const ChartPlaceholder = ({ title, description, height = 296 }: { title: string; description: string; height?: number }) => (
  <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Chip label="Coming soon" size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
    </Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>
    <Skeleton variant="rounded" height={height} sx={{ borderRadius: 2 }} />
  </Paper>
);

const PLANNED = [
  { icon: "material-symbols:groups-outline-rounded",          title: "Active Tenants",          description: "Monthly and daily active facility counts, login frequency, and engagement trends across the platform." },
  { icon: "material-symbols:badge-outline-rounded",           title: "Visitor Volume",           description: "Total visitors logged platform-wide, check-in/out rates, peak hours, and no-show rates by period." },
  { icon: "material-symbols:build-outline-rounded",           title: "Maintenance Trends",       description: "Request volume across all facilities, average resolution time, category breakdown, and backlog health." },
  { icon: "material-symbols:package-2-outline-rounded",       title: "Parcel & Parking",         description: "Delivery volume, uncollected parcel ageing, parking utilisation rates across facilities." },
  { icon: "material-symbols:trending-up-rounded",             title: "Growth Metrics",           description: "New tenant signups over time, plan conversion rates (Starter → Professional), and churn signals." },
  { icon: "material-symbols:apartment-outline-rounded",       title: "Tenant Activity Ranking",  description: "Most and least active facilities by visitor count, user logins, and feature usage." },
];

export default function SuperAdminAnalyticsPage() {
  const { data: tenants, isLoading } = useListTenants();

  const total        = tenants?.length ?? 0;
  const active       = tenants?.filter((t) => t.isActive).length ?? 0;
  const professional = tenants?.filter((t) => t.plan === 1).length ?? 0;
  const starter      = tenants?.filter((t) => t.plan === 0).length ?? 0;

  const kpis: AnalyticKPIData[] = [
    { title: "Total Facilities",   value: isLoading ? "—" : total,        icon: { name: "material-symbols:apartment-outline-rounded",                color: "primary" }, link: { prefix: "Manage in", text: "Facilities", url: "/superadmin/tenants" } },
    { title: "Active Facilities",  value: isLoading ? "—" : active,       icon: { name: "material-symbols:check-circle-outline-rounded",             color: "success" }, link: { prefix: "View all in", text: "Facilities", url: "/superadmin/tenants" } },
    { title: "Professional Plan",  value: isLoading ? "—" : professional, icon: { name: "material-symbols:workspace-premium-outline-rounded",        color: "warning" }, link: { prefix: "Manage plans in", text: "Facilities", url: "/superadmin/tenants" } },
    { title: "Starter Plan",       value: isLoading ? "—" : starter,      icon: { name: "material-symbols:star-outline-rounded",                     color: "info"    }, link: { prefix: "Manage plans in", text: "Facilities", url: "/superadmin/tenants" } },
  ];

  return (
    <Grid container>
      {/* KPI cards */}
      {kpis.map((kpi) => (
        <Grid key={kpi.title} size={{ xs: 6, md: 3 }}>
          <AnalyticKPI kpi={kpi} />
        </Grid>
      ))}

      {/* Chart placeholders row 1 */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <ChartPlaceholder title="Visitor Volume Over Time" description="Weekly and monthly visitors logged across all facilities — tabs for total, check-ins, and no-shows." height={285} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <ChartPlaceholder title="New Facilities Over Time" description="Tenant signup trend — new facilities registered per month." height={285} />
      </Grid>

      {/* Chart placeholders row 2 */}
      <Grid size={{ xs: 12, lg: 5 }}>
        <ChartPlaceholder title="Plan Breakdown" description="Proportion of Starter vs Professional tenants and conversion trend over time." height={220} />
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <ChartPlaceholder title="Top Facilities by Activity" description="Most active facilities ranked by visitor count, maintenance requests, and logins in the last 30 days." height={220} />
      </Grid>

      {/* Planned sections */}
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, display: "block", mb: 2 }}>
            Planned Sections
          </Typography>
          <Stack sx={{ gap: 2 }}>
            {PLANNED.map((s) => (
              <Card key={s.title} variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" sx={{ gap: 2, alignItems: "flex-start" }}>
                    <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: "action.hover", borderRadius: 2 }}>
                      <IconifyIcon icon={s.icon} sx={{ fontSize: 22, color: "primary.main" }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" sx={{ gap: 1, alignItems: "center", mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                        <Chip label="Coming soon" size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{s.description}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
