import Box from "@mui/material/Box";
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { pages } from "../pages";

import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcherListButton } from "./LanguageSwitcherListButton";
import { useDrawer } from "@/Providers/DrawerContext";

interface D2GDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function D2GDrawer({ open, setOpen }: D2GDrawerProps) {
  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const { t } = useI18n({ namespace: "main" });
  const { extraItems } = useDrawer();

  const DrawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <List>
        {pages.map(({ label, href }, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton LinkComponent={"a"} href={href}>
              <ListItemText primary={t(`pages.${label}.title`)} />
            </ListItemButton>
          </ListItem>
        ))}
        <LanguageSwitcherListButton onClose={() => toggleDrawer(false)} />
          <Divider />
        {extraItems.map(({ label, href }, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton LinkComponent={"a"} href={href}>
              <ListItemText primary={label} />
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
