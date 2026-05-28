"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import RevealItems from "../common/RevealItems";
import RevealText from "../common/RevealText";

const STEPS = [
  {
    number: "01",
    icon: "material-symbols:rocket-launch-outline-rounded",
    title: "Set Up Your Facility",
    description:
      "Create your account, configure your entrances, define your units, and customise your branding. You are ready in under 10 minutes.",
  },
  {
    number: "02",
    icon: "material-symbols:group-add-outline-rounded",
    title: "Onboard Staff and Residents",
    description:
      "Invite your security team, admin staff, and residents. Each role gets the right level of access — from gate check-in to resident self-service.",
  },
  {
    number: "03",
    icon: "material-symbols:verified-outline-rounded",
    title: "Manage Everything in One Place",
    description:
      "Log visitors, track parcels, manage maintenance requests, monitor parking, and generate reports — all from a single dashboard.",
  },
];

const HowItWorks = () => {
  return (
    <Box
      id="how-it-works"
      sx={{ pt: { xs: 6, sm: 10 }, pb: { xs: 8, md: 12 }, bgcolor: "background.default" }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1448, px: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Stack sx={{ alignItems: "center", textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <RevealText>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2, mb: 1, display: "block" }}
            >
              How It Works
            </Typography>
          </RevealText>
          <RevealText>
            <Typography
              variant="h3"
              sx={{ typography: { xs: "h4", md: "h3" }, mb: 2, maxWidth: 520, fontWeight: 800 }}
            >
              Up and running in three simple steps
            </Typography>
          </RevealText>
          <RevealText>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
              PropertyPro is designed to be simple for administrators and effortless for residents.
            </Typography>
          </RevealText>
        </Stack>

        {/* Steps */}
        <RevealItems
          component={Grid}
          container
          spacing={{ xs: 4, md: 6 }}
          delay={0.1}
          y={20}
        >
          {STEPS.map((step) => (
            <Grid key={step.number} size={{ xs: 12, md: 4 }}>
              <Stack sx={{ gap: 2.5, height: "100%" }}>
                {/* Number + icon row */}
                <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: "primary.softBg",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconifyIcon
                      icon={step.icon}
                      sx={{ fontSize: 28, color: "primary.main" }}
                    />
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: "divider",
                      lineHeight: 1,
                      fontSize: "3rem",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {step.number}
                  </Typography>
                </Stack>

                {/* Text */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>

                {/* Connector line (desktop, not last) */}
              </Stack>
            </Grid>
          ))}
        </RevealItems>
      </Container>
    </Box>
  );
};

export default HowItWorks;
