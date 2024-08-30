import { Stack } from "@mui/material";
import { ReactNode } from "react";
import { D2GAppBar } from "./appbar/AppBar";

type Props = {
  children?: ReactNode;
  locale?: string;
};

export default function PageLayout({ children }: Props) {
  return (
    <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
      <Stack>
        <D2GAppBar />
      </Stack>
      {children}
    </Stack>
  );
}
