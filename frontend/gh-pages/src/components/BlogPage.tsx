import { Box, Divider, Grid, Grid2, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import DocumentationTOC from "./DocumentationTOC";

type Props = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export default function BlogPage({ title, subtitle, children }: Props) {
  return (
    <Grid
      container
      sx={{
        width: "100%",
        maxWidth: "md",
        mx: "auto",
      }}
      mt={{ xs: 2, md: 10 }}
    >
      <Grid item xs={12} md={9}>
        <Stack>
          <Stack>
            <Box>
              <Typography variant="h1" fontSize="1.5em" fontWeight={700}>
                {title}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography
                variant="h4"
                fontSize="0.7em"
                sx={{ color: "#585858" }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <Box my={2}>
            <Divider />
          </Box>
          <Stack
            mt={2}
            sx={{
              h1: {
                fontSize: "1em",
                fontWeight: 700,
              },
            }}
          >
            <Stack>{children}</Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={0} md={3}>
        <Stack ml={2} p={2} position="sticky" top={10}>
          <DocumentationTOC skipFirsts={2} />
        </Stack>
      </Grid>
    </Grid>
  );
}
