import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Grid, Stack } from "@mui/material";
import { IconD2G } from "./icons/d2g-icon";
import { pages } from "../pages";

import * as React from "react";
import { LanguageSwitcherButton } from "./LanguageSwitcherButton";
import { D2GDrawer } from "./Drawer";
import { useI18n } from "@/hooks/useI18n";

export function D2GAppBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useI18n({ namespace: "main" });
  const { t: tCommon } = useI18n({ namespace: "common" });

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
                justifyContent={{ xs: "center", md: "flex-start" }}
                alignItems="center"
              >
                <IconD2G sx={{ mr: { xs: 0, md: 1 } }} />
                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  <LanguageSwitcherButton />
                  {pages.map(({ label, href }) => (
                    <Button
                      key={label}
                      LinkComponent={"a"}
                      href={href}
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                      sx={{ color: "white" }}
                    >
                      {t(`pages.${label}.title`)}
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
                  {tCommon("actionButton")}
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
