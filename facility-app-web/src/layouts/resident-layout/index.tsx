"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import ThemeToggler from "layouts/main-layout/common/ThemeToggler";
import { useTenant } from "providers/TenantProvider";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    icon: "material-symbols:dashboard-outline-rounded",       href: "dashboard"      },
  { label: "My Visits",    icon: "material-symbols:calendar-month-outline-rounded",  href: "visits"         },
  { label: "Pre-register", icon: "material-symbols:person-add-outline-rounded",      href: "pre-register"   },
  { label: "Maintenance",  icon: "material-symbols:build-outline-rounded",           href: "maintenance"    },
  { label: "Vehicles",     icon: "material-symbols:directions-car-outline-rounded",  href: "vehicles"       },
  { label: "Parcels",      icon: "material-symbols:package-2-outline-rounded",       href: "parcels"        },
  { label: "Documents",    icon: "material-symbols:folder-outline-rounded",          href: "documents"      },
  { label: "My Profile",   icon: "material-symbols:account-circle-outline-rounded",  href: "profile"        },
];

export default function ResidentLayout({ children }: { children: ReactNode }) {
  const tenant = useTenant();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const slugBase = `/${tenant.slug}/resident`;

  const isActive = (href: string) => pathname === `${slugBase}/${href}`;

  const handleNav = (href: string) => {
    router.push(`${slugBase}/${href}`);
    setDrawerOpen(false);
  };

  const handleSignOut = () =>
    signOut({ callbackUrl: `/${tenant.slug}/resident/login` });

  const userInitial =
    session?.user?.name?.charAt(0).toUpperCase() ??
    session?.user?.email?.charAt(0).toUpperCase() ??
    "R";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, gap: 2, minHeight: 56 }}>
          {/* Mobile hamburger */}
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: "none" } }}
          >
            <IconifyIcon icon="material-symbols:menu-rounded" />
          </IconButton>

          {/* Property name */}
          <Typography
            variant="h6"
            sx={{ flexShrink: 0, color: "primary.main", fontSize: "1rem", fontWeight: 700 }}
          >
            {tenant.name}
          </Typography>

          {/* Desktop nav links */}
          <Stack
            direction="row"
            sx={{ gap: 0.5, flex: 1, display: { xs: "none", md: "flex" } }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                size="small"
                startIcon={<IconifyIcon icon={item.icon} sx={{ fontSize: 16 }} />}
                onClick={() => handleNav(item.href)}
                sx={{
                  px: 1.5,
                  fontWeight: isActive(item.href) ? 700 : 400,
                  color: isActive(item.href) ? "primary.main" : "text.secondary",
                  bgcolor: isActive(item.href) ? "primary.softBg" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                  borderRadius: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" sx={{ gap: 1, ml: "auto", alignItems: "center" }}>
            <ThemeToggler type="slim" />

            <Tooltip title={session?.user?.email ?? ""}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.8rem",
                  cursor: "default",
                }}
              >
                {userInitial}
              </Avatar>
            </Tooltip>

            <Button
              size="small"
              variant="outlined"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:logout-rounded" sx={{ fontSize: 16 }} />}
              onClick={handleSignOut}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              Sign Out
            </Button>

            <IconButton
              size="small"
              onClick={handleSignOut}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <IconifyIcon icon="material-symbols:logout-rounded" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary.main">
            {tenant.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.email}
          </Typography>
        </Box>
        <Divider />
        <List dense>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.href}
              selected={isActive(item.href)}
              onClick={() => handleNav(item.href)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <IconifyIcon
                  icon={item.icon}
                  sx={{ fontSize: 20, color: isActive(item.href) ? "primary.main" : "text.secondary" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: isActive(item.href) ? 600 : 400,
                  color: isActive(item.href) ? "primary.main" : "text.primary",
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<IconifyIcon icon="material-symbols:logout-rounded" />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Page content */}
      <Box component="main" sx={{ flex: 1, bgcolor: "background.default" }}>
        {children}
      </Box>
    </Box>
  );
}
