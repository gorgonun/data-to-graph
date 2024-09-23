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

import { LanguageSwitcherButton } from "./LanguageSwitcherButton";
import { D2GDrawer } from "./Drawer";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/router";
import { useLanguage } from "@/Providers/LanguageContext";
import Link from "next/link";

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
                <IconButton
                  component={Link}
                  href="/"
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                >
                  <IconD2G sx={{ mr: { xs: 0, md: 1 }, color: "white" }} />
                </IconButton>
                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  <LanguageSwitcherButton />
                  {pages.map(({ label, href, target }) => (
                    <Button
                      key={label}
                      LinkComponent={"a"}
                      href={href}
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                      sx={{ color: "white" }}
                      target={target}
                      component={Link}
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
                  component={Link}
                  href="/documentation/getting-started"
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
