import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import * as React from "react";
import { useI18n } from "@/hooks/useI18n";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/router";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme, alpha } from "@mui/material/styles";
import { useLanguage } from "@/Providers/LanguageContext";
import { D2gLocale } from "../../../i18n";
import { getHref } from "./language-switcher-helper";
import { TooltipOn } from "../TooltipOn";

export function LanguageSwitcherButton() {
  const { t } = useI18n({ namespace: "main" });
  const { t: tGlobal } = useI18n({ namespace: "globalCommon" });
  const { t: tCommon } = useI18n({ namespace: "common" });

  const router = useRouter();
  const theme = useTheme();
  const { availableLocales, globalLocales, currentLocale, setLocale } =
    useLanguage();

  const handleLocaleChange = (newLocale: D2gLocale) => {
    handleClose();
    setLocale?.(newLocale);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (setLocale === undefined) {
    return <></>;
  }

  return (
    <Box>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {t("appbar.languageLabel")}
      </Button>
      <Menu
        elevation={0}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        sx={{
          "& .MuiMenu-list": {
            padding: "4px 0",
          },
          "& .MuiMenuItem-root": {
            "& .MuiSvgIcon-root": {
              fontSize: 18,
            },
            "&:active": {
              backgroundColor: alpha(theme.palette["primary"].main, 0.5),
            },
          },
        }}
      >
        {globalLocales.map((locale, i) => (
          <TooltipOn
            title={tCommon("languageNotAvailable")}
            on={!availableLocales.includes(locale)}
            key={i}
            placement="right"
          >
            <MenuItem
              onClick={() => handleLocaleChange(locale as D2gLocale)}
              disableRipple
              sx={{
                backgroundColor:
                  currentLocale === locale
                    ? alpha(theme.palette["primary"].main, 0.1)
                    : "transparent",
                "&.Mui-disabled": {
                  pointerEvents: "auto",
                },
              }}
              disabled={
                currentLocale === locale || !availableLocales.includes(locale)
              }
            >
              {tGlobal(locale)}
            </MenuItem>
          </TooltipOn>
        ))}
      </Menu>
    </Box>
  );
}
