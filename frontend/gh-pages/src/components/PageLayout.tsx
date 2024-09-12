import { Stack, Box } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { D2GAppBar } from "./appbar/AppBar";
import { useRouter } from "next/router";

type Props = {
  children?: ReactNode;
  locale?: string;
};

export default function PageLayout({ children }: Props) {
  const router = useRouter();
  const [useDocumentationLayout, setUseDocumentationLayout] = useState(false);

  useEffect(() => {
    setUseDocumentationLayout(
      router.pathname.match(/\/documentation(\/)?/) !== null
    );
  }, [router.pathname]);

  return (
    <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
      <Stack>
        <D2GAppBar />
      </Stack>
      <Box
        sx={{
          ...(useDocumentationLayout
            ? { width: "100%", maxWidth: "md", mx: "auto", marginTop: 2, p: 2 }
            : {}),
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}
