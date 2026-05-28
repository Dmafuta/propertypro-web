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
  { icon: "material-symbols:campaign-outline-rounded",  title: "Compose Announcement", description: "Write and send a system-wide notice to all tenants, or target specific facilities or plan tiers. Announcements appear in the tenant staff dashboard notice board." },
  { icon: "material-symbols:filter-list-rounded",       title: "Target Audience",      description: "Send to all facilities, Starter plan only, Professional plan only, or a custom selection of tenants." },
  { icon: "material-symbols:history-rounded",           title: "Sent Announcements",   description: "History of all platform announcements with delivery status, target audience, date sent, and the ability to deactivate or delete." },
  { icon: "material-symbols:mail-outline-rounded",      title: "Email Notifications",  description: "Optionally send an email copy of each announcement to tenant Admin contacts alongside the in-app notice." },
];

export default function SuperAdminAnnouncementsPage() {
  return (
    <Grid container>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:campaign-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Announcements</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Broadcast notices to all facilities or specific tenants from the platform level.
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
