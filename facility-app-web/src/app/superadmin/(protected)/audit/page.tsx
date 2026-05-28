"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";

const SECTIONS = [
  { icon: "material-symbols:manage-search-rounded",       title: "Cross-tenant Audit Log", description: "All user activity across every facility — logins, visitor check-ins, setting changes, role assignments — in a single filterable view." },
  { icon: "material-symbols:filter-alt-outline-rounded",  title: "Filters",                description: "Filter by tenant, user, action type (login, create, update, delete), date range, and severity level." },
  { icon: "material-symbols:download-rounded",            title: "CSV Export",             description: "Export filtered audit logs as CSV for compliance reporting, external audits, or archiving." },
  { icon: "material-symbols:security-rounded",            title: "Security Events",        description: "Dedicated view for high-severity events — failed login attempts, permission escalations, blacklist additions, and data exports." },
];

export default function SuperAdminAuditPage() {
  return (
    <Grid container>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:manage-search-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Audit Log</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Cross-tenant activity log for compliance, support, and security monitoring.
          </Typography>

          <Stack sx={{ gap: 2 }}>
            {SECTIONS.map((s) => (
              <Box key={s.title} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: "flex-start" }}>
                  <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: "action.hover", borderRadius: 2, flexShrink: 0 }}>
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
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
