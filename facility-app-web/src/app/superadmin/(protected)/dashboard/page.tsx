"use client";

import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import IconifyIcon from "components/base/IconifyIcon";
import { useListTenants } from "services/swr/api-hooks/useSuperAdminApi";

const STAT_ITEMS = [
  { key: "total",        label: "Total Facilities",  icon: "material-symbols:apartment-outline-rounded",           color: "primary"  },
  { key: "active",       label: "Active",            icon: "material-symbols:check-circle-outline-rounded",        color: "success"  },
  { key: "inactive",     label: "Inactive",          icon: "material-symbols:cancel-outline-rounded",              color: "error"    },
  { key: "starter",      label: "Starter Plan",      icon: "material-symbols:star-outline-rounded",                color: "info"     },
  { key: "professional", label: "Professional Plan", icon: "material-symbols:workspace-premium-outline-rounded",   color: "warning"  },
] as const;

export default function SuperAdminDashboardPage() {
  const router  = useRouter();
  const { data: tenants, isLoading } = useListTenants();

  const total        = tenants?.length ?? 0;
  const active       = tenants?.filter((t) => t.isActive).length ?? 0;
  const starter      = tenants?.filter((t) => t.plan === 0).length ?? 0;
  const professional = tenants?.filter((t) => t.plan === 1).length ?? 0;
  const recent       = [...(tenants ?? [])].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()).slice(0, 6);

  const statValues: Record<string, number> = { total, active, inactive: total - active, starter, professional };

  return (
    <Grid container>
      {/* KPI row */}
      {STAT_ITEMS.map(({ key, label, icon, color }) => (
        <Grid key={key} size={{ xs: 6, sm: 4, md: 3, xl: 12 / STAT_ITEMS.length }}>
          <Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: "text.secondary", whiteSpace: "nowrap" }}>
              {label}
            </Typography>
            <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: `${color}.lighter`, borderRadius: 2, mb: 1 }}>
              <IconifyIcon icon={icon} sx={{ fontSize: 28, color: `${color}.main` }} />
            </Avatar>
            {isLoading ? (
              <Skeleton variant="text" width={64} height={48} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 3 }}>{statValues[key]}</Typography>
            )}
            <Typography variant="caption" sx={{ fontWeight: 500, color: "text.secondary" }}>
              Registered facilities
            </Typography>
          </Paper>
        </Grid>
      ))}

      {/* Recently added */}
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
              <IconifyIcon icon="material-symbols:schedule-outline-rounded" sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recently Added</Typography>
            </Stack>
            <Button
              size="small"
              endIcon={<IconifyIcon icon="material-symbols:arrow-forward-rounded" />}
              onClick={() => router.push("/superadmin/tenants")}
            >
              All Facilities
            </Button>
          </Stack>

          {isLoading ? (
            <Stack sx={{ gap: 1 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
            </Stack>
          ) : !recent.length ? (
            <Stack sx={{ py: 5, gap: 1, alignItems: "center" }}>
              <IconifyIcon icon="material-symbols:apartment-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
              <Typography variant="body2" color="text.disabled">No facilities yet.</Typography>
            </Stack>
          ) : (
            recent.map((t, i) => (
              <Box key={t.id}>
                {i > 0 && <Divider />}
                <Stack
                  direction="row"
                  sx={{ py: 1.5, gap: 2, justifyContent: "space-between", alignItems: "center", cursor: "pointer", "&:hover": { bgcolor: "action.hover" }, borderRadius: 1, px: 1, mx: -1 }}
                  onClick={() => router.push(`/superadmin/tenants/${t.id}`)}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">/{t.slug}</Typography>
                  </Box>
                  <Stack direction="row" sx={{ gap: 1, flexShrink: 0, alignItems: "center" }}>
                    <Chip label={t.plan === 1 ? "Professional" : "Starter"} size="small" color={t.plan === 1 ? "warning" : "default"} variant="outlined" />
                    <Chip label={t.isActive ? "Active" : "Inactive"} size="small" color={t.isActive ? "success" : "error"} variant="outlined" />
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                      {dayjs(t.createdAt).format("DD MMM YYYY")}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
