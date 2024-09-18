import { Stack, Grid, useMediaQuery, Theme } from "@mui/material";
import { ReactNode } from "react";
import DocsNavBar from "./DocsNavBar";
import DocumentationTOC from "./DocumentationTOC";
import { useDrawer } from "@/Providers/DrawerContext";
import React from "react";
import { kebabCaseToText, kebabToMenuCase } from "@/helpers/helpers";

type Props = {
  children?: ReactNode;
  pages: string[];
  currentPageId: string;
};

export default function DocumentationPage({
  children,
  pages,
  currentPageId,
}: Props) {
  const { setExtraItems } = useDrawer();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  React.useEffect(() => {
    if (isMobile) {
      setExtraItems(
        pages.map((name) => ({
          label: kebabToMenuCase(name),
          href: `/documentation/${name}`,
        }))
      );
    } else {
      setExtraItems([]);
    }
  }, [isMobile, pages, setExtraItems]);

  return (
    <Stack sx={{ width: "100%", maxWidth: "lg", mx: "auto" }}>
      <Grid width="100%" container mt={{ xs: 2, md: 5 }}>
        <Grid item md={2} xs={0} display={{ xs: "none", md: "block" }}>
          <Stack position="sticky" top={{ xs: 0, md: 10 }} p={2}>
            <DocsNavBar
              pages={pages.map((p) => ({ name: kebabCaseToText(p), id: p }))}
              currentPageId={currentPageId}
            />
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            ".hljs": {
              maxWidth: "100%",
              overflowX: "",
            },
          }}
        >
          <Stack p={2}>
            <Stack display={{ xs: "block", md: "none" }}>
              <DocumentationTOC variant="minimal" />
            </Stack>
            <Stack mt={{ xs: 2, md: 0 }}>{children}</Stack>
          </Stack>
        </Grid>
        <Grid item xs={0} md={3} display={{ xs: "none", md: "block" }}>
          <Stack ml={2} p={2} position="sticky" top={10}>
            <DocumentationTOC />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
