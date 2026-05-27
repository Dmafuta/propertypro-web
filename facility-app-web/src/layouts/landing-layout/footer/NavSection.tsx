import { Container, Grid } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Logo from "components/common/Logo";
import NavList from "./NavList";
import SocialIcons from "./SocialIcons";

export interface FooterLink {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
}

const footerLinks: FooterLink[] = [
  {
    title: "Product",
    items: [
      { label: "Features",     href: "#features"    },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing",      href: "#pricing"     },
      { label: "Changelog",    href: "#!"           },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "#!"                         },
      { label: "Contact Us",  href: "mailto:hello@propertypro.app" },
      { label: "FAQ",         href: "#faq"                       },
      { label: "Status",      href: "#!"                         },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy",  href: "#!" },
      { label: "Terms",    href: "#!" },
      { label: "Cookie",   href: "#!" },
      { label: "Security", href: "#!" },
    ],
  },
];

const NavSection = () => {
  return (
    <Container maxWidth={false} sx={{ maxWidth: 1448, px: { xs: 3, md: 5 } }}>
      <Stack divider={<Divider flexItem />}>
        <Grid container rowSpacing={5} sx={{ py: 5 }}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Logo />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ maxWidth: { xs: 400, xl: 300 }, mt: 3 }}
            >
              PropertyPro is an all-in-one facility management platform for residential estates,
              gated communities, and managed buildings. Visitor access, resident services,
              parking, parcels — all in one place.
            </Typography>
          </Grid>

          <Grid container size={{ xs: 12, md: 7, lg: 4 }}>
            {footerLinks.map((item) => (
              <Grid key={item.title} size={{ xs: 4 }}>
                <NavList title={item.title} items={item.items} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} size={{ xs: 12, sm: 7, md: 5, lg: 4 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Follow us
              </Typography>
              <SocialIcons />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="textSecondary">
                Built for property managers who value simplicity, security, and scale.
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ my: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
            PropertyPro &copy; {new Date().getFullYear()} &mdash; All rights reserved.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default NavSection;
