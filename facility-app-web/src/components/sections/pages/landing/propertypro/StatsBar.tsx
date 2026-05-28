"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RevealItems from "../common/RevealItems";

const STATS = [
  { value: "500+",   label: "Facilities"       },
  { value: "50,000+", label: "Residents"       },
  { value: "1M+",    label: "Visits Logged"    },
  { value: "99.9%",  label: "Uptime"           },
];

const StatsBar = () => {
  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.elevation1",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1448, px: { xs: 3, md: 5 } }}>
        <RevealItems
          component={Stack}
          direction={{ xs: "row", sm: "row" }}
          sx={{
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 0,
          }}
          delay={0.05}
          y={10}
        >
          {STATS.map((stat, i) => (
            <Stack
              key={stat.label}
              direction="row"
              sx={{ flex: { xs: "1 1 50%", sm: "1 1 auto" }, alignItems: "center" }}
            >
              <Stack
                sx={{
                  flex: 1,
                  py: { xs: 2, sm: 0 },
                  px: { xs: 2, md: 5 },
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1, mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Stack>
              {i < STATS.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", sm: "block" } }}
                />
              )}
            </Stack>
          ))}
        </RevealItems>
      </Container>
    </Box>
  );
};

export default StatsBar;
