import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import * as React from "react";
import { useI18n } from "@/hooks/useI18n";
import MenuItem from "@mui/material/MenuItem";
import { languageDetector } from "@/helpers/languageDetector";
import { useRouter } from "next/router";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme, alpha } from "@mui/material/styles";

interface LanguageSwitchProps {
  locales: string[];
  currentLocale: string;
}

export function LanguageSwitcher({
  locales,
  currentLocale,
}: LanguageSwitchProps) {
  const { t } = useI18n({ namespace: "main" });
  const { t: tGlobal } = useI18n({ namespace: "globalCommon" });
  const router = useRouter();
  const theme = useTheme();

  const handleLocaleChange = (newLocale: string) => {
    handleClose();
    languageDetector.cache ? languageDetector.cache(newLocale) : {};

    const href = getHref(newLocale);
    router.push(href);
  };

  const getHref = (locale: string) => {
    let pName = router.pathname;

    Object.keys(router.query).forEach((k) => {
      if (k === "locale") {
        pName = pName.replace(`[${k}]`, locale);
        return;
      }

      pName = pName.replace(`[${k}]`, String(router.query[k]));
    });

    return pName;
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
          '& .MuiMenu-list': {
            padding: '4px 0',
          },
          '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
              fontSize: 18,
            },
            '&:active': {
              backgroundColor: alpha(
                theme.palette["primary"].main,
                0.5
              ),
            },
          },
        }}
      >
        {locales.map((locale, i) => (
          <MenuItem
            key={i}
            onClick={() => handleLocaleChange(locale)}
            disableRipple
            sx={{ backgroundColor: currentLocale === locale ? alpha(theme.palette["primary"].main, 0.1) : "transparent" }}
            disabled={currentLocale === locale}
          >
            {tGlobal(locale)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
