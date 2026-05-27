import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import AppBar, { AppBarOwnProps } from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThemeToggler from "layouts/main-layout/common/ThemeToggler";
import { useBreakpoints } from "providers/BreakpointsProvider";
import Logo from "components/common/Logo";
import Sidenav from "./nav/Sidenav";
import Topnav from "./nav/Topnav";

export interface MenuItem {
  label: string;
  href?: string;
  icon?: string;
  secondaryText?: string;
  submenus?: MenuItem[];
}

const menus: MenuItem[] = [
  { label: "Features",     href: "#features"    },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing",      href: "#pricing"     },
  { label: "FAQ",          href: "#faq"         },
];

gsap.registerPlugin(ScrollTrigger);

const LandingAppBar = (props: AppBarOwnProps) => {
  const appBarRef = useRef<HTMLDivElement>(null);
  const popoverAnchorRef = useRef<HTMLDivElement>(null);
  const { up } = useBreakpoints();

  const upMd = up("md");
  const upLg = up("lg");

  useGSAP(() => {
    if (!appBarRef.current) return;

    gsap.fromTo(
      appBarRef.current,
      { "--bg-opacity": 0 },
      {
        "--bg-opacity": 1,
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "200px top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  }, []);

  return (
    <AppBar
      ref={appBarRef}
      sx={{
        outline: 0,
        bgcolor: "transparent",
        transition: "none",
        "--bg-opacity": 0,
        background: ({ vars }) =>
          `rgba(${vars.palette.background.paperChannel} / var(--bg-opacity))`,
      }}
      {...props}
    >
      <Toolbar
        sx={{
          px: { xs: 3, md: 5 },
          maxWidth: 1448,
          mx: "auto",
          minHeight: 56,
          width: 1,
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, flex: 1, alignItems: "center" }}>
          <Logo showName={upMd} />
        </Stack>

        <Stack direction="row" sx={{ gap: 1 }} ref={popoverAnchorRef}>
          {upLg && <Topnav menus={menus} anchorRef={popoverAnchorRef} />}
          <ThemeToggler />
          <Button
            variant="outlined"
            color="neutral"
            href="#hero"
            sx={{ minWidth: 90, display: { xs: "none", sm: "inline-flex" } }}
          >
            Sign In
          </Button>
          <Button variant="contained" href="#pricing" sx={{ minWidth: 110 }}>
            Get Started
          </Button>
          {!upLg && <Sidenav menus={menus} />}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default LandingAppBar;
