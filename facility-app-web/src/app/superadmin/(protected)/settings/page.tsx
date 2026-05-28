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
    icon: "material-symbols:palette-outline-rounded",
    title: "Platform Branding",
    description: "Set the platform name, logo, and default colour shown on the landing page and login screens before tenants configure their own branding.",
  },
  {
    icon: "material-symbols:star-outline-rounded",
    title: "Default Plan",
    description: "Choose which plan (Starter or Professional) newly created tenants are assigned to automatically.",
  },
  {
    icon: "material-symbols:construction-rounded",
    title: "Maintenance Mode",
    description: "Put the entire platform into maintenance mode — all tenant portals display a maintenance notice while you perform upgrades or migrations.",
  },
  {
    icon: "material-symbols:mail-outline-rounded",
    title: "SMTP Configuration",
    description: "Override the platform-level email settings for system notifications and password reset emails.",
  },
  {
    icon: "material-symbols:lock-outline-rounded",
    title: "Security Policies",
    description: "Configure platform-wide security defaults — session timeout duration, password complexity requirements, and 2FA enforcement per plan tier.",
  },
  {
    icon: "material-symbols:smart-toy-outline-rounded",
    title: "AI Integration",
    description: "Configure the Claude API key and model settings for AI-assisted features — maintenance triage, incident categorisation, and tenant health summaries.",
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ gap: 1, mb: 0.5, alignItems: "center" }}>
        <IconifyIcon icon="material-symbols:settings-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Platform Settings</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Global configuration for the PropertyPro platform.
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
