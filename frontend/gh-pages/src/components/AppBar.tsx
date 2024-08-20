import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import {
  Divider,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { IconD2G } from "./icons/d2g-icon";
import { pages } from "./pages";

export function D2GAppBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Grid container>
            <Grid item xs={4} sx={{ display: { xs: "flex", md: "none" } }}>
              <Box
                sx={{ display: { xs: "flex", md: "none" } }}
                height="100%"
                alignItems="center"
              >
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={() => setDrawerOpen(true)}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={4} md={6}>
              <Stack
                direction="row"
                height="100%"
                justifyContent="flex-start"
                alignItems="center"
              >
                <IconD2G sx={{ mr: 1 }} />
                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  {pages.map(({ name, onClick }) => (
                    <Button
                      key={name}
                      onClick={() => {
                        setDrawerOpen(false);
                        onClick();
                      }}
                      sx={{ color: "white", display: "block" }}
                    >
                      {name}
                    </Button>
                  ))}
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={4} md={6}>
              <Stack
                direction="row"
                height="100%"
                justifyContent="flex-end"
                alignItems="center"
              >
                <Button
                  sx={{
                    color: "white",
                    display: "block",
                    fontFamily: "oxygenMono",
                    width: "fit-content",
                  }}
                >
                  Baixe agora
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <D2GDrawer open={drawerOpen} setOpen={setDrawerOpen} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

interface D2GDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  // onClose: () => void;
}

export function D2GDrawer({ open, setOpen }: D2GDrawerProps) {
  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={() => toggleDrawer(false)}
    >
      <List>
        {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer open={open} onClose={() => toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
