import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RevealItems from "components/sections/pages/landing/common/RevealItems";
import RevealText from "components/sections/pages/landing/common/RevealText";

const CTA = () => {
  return (
    <Stack
      sx={{
        gap: 5,
        alignItems: "center",
        maxWidth: 640,
        mx: "auto",
        pt: 15,
        pb: 10,
        px: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <RevealText>
          <Typography
            variant="h2"
            sx={{ typography: { xs: "h3", sm: "h2" }, color: "primary.dark", mb: 1 }}
          >
            Ready to modernize your facility?
          </Typography>
        </RevealText>

        <RevealText>
          <Typography variant="body2" color="textSecondary">
            Join hundreds of residential estates, gated communities, and managed buildings already
            running on PropertyPro. Set up in minutes — no credit card required.
          </Typography>
        </RevealText>
      </Box>

      <RevealItems component={Box} delay={0.1} y={0} sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <Button variant="contained" href="#hero" size="large">
          Get Started Free
        </Button>
        <Button color="neutral" href="mailto:hello@propertypro.app" size="large">
          Contact Sales
        </Button>
      </RevealItems>
    </Stack>
  );
};

export default CTA;
