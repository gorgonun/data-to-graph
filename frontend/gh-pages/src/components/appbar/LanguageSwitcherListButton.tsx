import * as React from "react";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/router";
import { useTheme, alpha } from "@mui/material/styles";
import { useLanguage } from "@/Providers/LanguageContext";
import { D2gLocale } from "../../../i18n";
import { getHref } from "./language-switcher-helper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface LanguageSwitcherListButtonProps {
  onClose?: () => void;
}

export function LanguageSwitcherListButton({ onClose }: LanguageSwitcherListButtonProps) {
  const { t } = useI18n({ namespace: "main" });
  const { t: tGlobal } = useI18n({ namespace: "globalCommon" });
  const router = useRouter();
  const theme = useTheme();
  const { locales, currentLocale, setLocale } = useLanguage();
  const [openCollapse, setOpenCollapse] = React.useState(false);

  const handleLocaleChange = (newLocale: D2gLocale) => {
    setLocale?.(newLocale);

    const href = getHref(newLocale, router);
    router.push(href);
    onClose?.();
  };

  return (
    <>
      <ListItemButton onClick={() => setOpenCollapse(!openCollapse)}>
        <ListItemText primary={t("appbar.languageLabel")} />
        {openCollapse ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openCollapse} timeout="auto" unmountOnExit>
        <List>
          {locales.map((locale, i) => (
            <ListItemButton
              key={i}
              onClick={() => handleLocaleChange(locale as D2gLocale)}
              disabled={currentLocale === locale}
              sx={{
                backgroundColor:
                  currentLocale === locale
                    ? alpha(theme.palette["primary"].main, 0.1)
                    : "transparent",
              }}
            >
              <ListItemText primary={tGlobal(locale)} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
}
