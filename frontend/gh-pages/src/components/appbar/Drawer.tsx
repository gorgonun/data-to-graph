import Box from "@mui/material/Box";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { pages } from "../pages";

import * as React from "react";
import { useI18n } from "@/hooks/useI18n";

interface D2GDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  // onClose: () => void;
}

export function D2GDrawer({ open, setOpen }: D2GDrawerProps) {
  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  const { t } = useI18n({ namespace: "main" });

  const DrawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={() => toggleDrawer(false)}
    >
      <List>
        {pages.map(({ label, href }, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton LinkComponent={"a"} href={href}>
              <ListItemText primary={t(`pages.${label}.title`)} />
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
