"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";

const SECTIONS = [
  {
    icon: "material-symbols:groups-outline-rounded",
    title: "Active Tenants",
    description: "Monthly and daily active facility counts, login frequency, and engagement trends across the platform.",
  },
  {
    icon: "material-symbols:badge-outline-rounded",
    title: "Visitor Volume",
    description: "Total visitors logged platform-wide, check-in/out rates, peak hours, and no-show rates by period.",
  },
  {
    icon: "material-symbols:build-outline-rounded",
    title: "Maintenance Trends",
    description: "Maintenance request volume across all facilities, average resolution time, category breakdown, and backlog health.",
  },
  {
    icon: "material-symbols:package-2-outline-rounded",
    title: "Parcel & Parking",
    description: "Delivery volume, uncollected parcel ageing, parking utilisation rates across facilities.",
  },
  {
    icon: "material-symbols:trending-up-rounded",
    title: "Growth Metrics",
    description: "New tenant signups over time, plan conversion rates (Starter → Professional), and churn signals.",
  },
  {
    icon: "material-symbols:apartment-outline-rounded",
    title: "Tenant Activity Ranking",
    description: "Most and least active facilities by visitor count, user logins, and feature usage — surfaces dormant accounts.",
  },
];

export default function SuperAdminAnalyticsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
        <IconifyIcon icon="material-symbols:bar-chart-4-bars-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Platform Analytics</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Aggregate health and usage metrics across all registered facilities.
      </Typography>

      <Stack sx={{ gap: 2 }}>
        {SECTIONS.map((s) => (
          <Card key={s.title} variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2,
                    bgcolor: "action.hover",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <IconifyIcon icon={s.icon} sx={{ fontSize: 22, color: "primary.main" }} />
                </Box>
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
    </Container>
  );
}
