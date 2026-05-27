import * as React from "react";
import { IconButton, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";
import Logo from "components/common/Logo";
import { MenuItem } from "..";

interface SidenavProps {
  menus: MenuItem[];
}

const Sidenav = ({ menus }: SidenavProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setIsOpen(newOpen);
  };

  return (
    <div>
      <Button shape="square" color="neutral" variant="soft" onClick={toggleDrawer(true)}>
        <IconifyIcon icon="material-symbols:menu-rounded" fontSize={20} />
      </Button>

      <Drawer open={isOpen} anchor="right" onClose={toggleDrawer(false)}>
        <Stack sx={{ width: 280, py: 3, px: 2 }} role="presentation">
          <Stack direction="row" sx={{ px: 2, mb: 3, justifyContent: "space-between", alignItems: "center" }}>
            <Logo />
            <IconButton aria-label="close" onClick={toggleDrawer(false)}>
              <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          <List disablePadding>
            {menus.map((menu) => (
              <ListItemButton
                key={menu.label}
                component="a"
                href={menu.href}
                onClick={toggleDrawer(false)}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      {menu.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Stack sx={{ gap: 1, px: 1 }}>
            <Button variant="contained" fullWidth href="#hero" onClick={toggleDrawer(false)}>
              Get Started
            </Button>
            <Button color="neutral" fullWidth href="#hero" onClick={toggleDrawer(false)}>
              Sign In
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </div>
  );
};

export default Sidenav;
