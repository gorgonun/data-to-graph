import { Box, Stack, Grid } from "@mui/material";
import React from "react";
import { ReactNode } from "react";
import DocsNavBar from "./DocsNavBar";

type Props = {
  children?: ReactNode;
  pages: string[];
};

export default function DocumentationPage({ children, pages }: Props) {
  const scrolledRef = React.useRef(false);

  React.useEffect(() => {
    const hash = window.location.hash;

    if (hash && !scrolledRef.current) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        scrolledRef.current = true;
      }
    }
  }, []);

  return (
    <Stack sx={{ width: "100%", maxWidth: "lg", mx: "auto" }}>
      <Grid width='100%' container mt={5}>
        <Grid item xs={3}>
          <DocsNavBar pages={pages.map((p) => ({ name: p }))} />
        </Grid>
        <Grid item xs={9} sx={{
          ".hljs": {
            maxWidth: "100%",
            overflowX: "",
          }
        }}>
          {children}
        </Grid>
      </Grid>
    </Stack>
  );
}
