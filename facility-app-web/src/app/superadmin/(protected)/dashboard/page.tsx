"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import IconifyIcon from "components/base/IconifyIcon";
import { useListTenants } from "services/swr/api-hooks/useSuperAdminApi";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { data: tenants, isLoading } = useListTenants();

  const total = tenants?.length ?? 0;
  const active = tenants?.filter((t) => t.isActive).length ?? 0;
  const starter = tenants?.filter((t) => t.plan === 0).length ?? 0;
  const professional = tenants?.filter((t) => t.plan === 1).length ?? 0;
  const recent = [...(tenants ?? [])].sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  ).slice(0, 6);

  const STATS = [
    { label: "Total Facilities", value: total, icon: "material-symbols:apartment-outline-rounded", color: "primary.main" },
    { label: "Active",           value: active, icon: "material-symbols:check-circle-outline-rounded", color: "success.main" },
    { label: "Inactive",         value: total - active, icon: "material-symbols:cancel-outline-rounded", color: "error.main" },
    { label: "Starter Plan",     value: starter, icon: "material-symbols:star-outline-rounded", color: "text.secondary" },
    { label: "Professional",     value: professional, icon: "material-symbols:workspace-premium-outline-rounded", color: "warning.main" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 4, gap: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 0.5 }}>
            <IconifyIcon icon="material-symbols:admin-panel-settings-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700}>Platform Overview</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            All facilities registered on PropertyPro
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
          onClick={() => router.push("/superadmin/tenants")}
        >
          Manage Facilities
        </Button>
      </Stack>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {STATS.map(({ label, value, icon, color }) => (
          <Grid key={label} size={{ xs: 6, sm: 4, md: "auto" }} sx={{ flexGrow: 1 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    {isLoading ? (
                      <Skeleton variant="text" width={48} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1 }}>
                        {value}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      bgcolor: "action.hover",
                      display: "flex", alignItems: "center", justifyContent: "center",
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

      {/* Recent facilities */}
      <Card variant="outlined">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5 }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
            <IconifyIcon icon="material-symbols:schedule-outline-rounded" sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={600}>Recently Added</Typography>
          </Stack>
          <Button
            size="small"
            endIcon={<IconifyIcon icon="material-symbols:arrow-forward-rounded" />}
            onClick={() => router.push("/superadmin/tenants")}
          >
            All Facilities
          </Button>
        </Stack>

        <Divider />

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="text" height={56} />)}
          </Box>
        ) : !recent.length ? (
          <Stack alignItems="center" sx={{ py: 5, gap: 1 }}>
            <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No facilities yet.</Typography>
          </Stack>
        ) : (
          recent.map((t, i) => (
            <Box key={t.id}>
              {i > 0 && <Divider />}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5, gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.slug}</Typography>
                </Box>
                <Stack direction="row" alignItems="center" sx={{ gap: 1, flexShrink: 0 }}>
                  <Chip
                    label={t.plan === 1 ? "Professional" : "Starter"}
                    size="small"
                    color={t.plan === 1 ? "warning" : "default"}
                    variant="outlined"
                  />
                  <Chip
                    label={t.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={t.isActive ? "success" : "error"}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                    {dayjs(t.createdAt).format("DD MMM YYYY")}
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
