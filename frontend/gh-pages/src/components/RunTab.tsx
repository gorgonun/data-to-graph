import { useState } from "react";
import { Box, Tab, Tabs, useTheme, alpha } from "@mui/material";
import CodeBlock from "./CodeBlock";
import { useI18n } from "@/hooks/useI18n";

export function RunTab() {
  const [tab, setTab] = useState(0);
  const { t } = useI18n({ namespace: "main" });
  const theme = useTheme();

  const handleChange = (_event: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={tab}
        onChange={handleChange}
        aria-label="wrapped label tabs example"
        variant="fullWidth"
      >
        <Tab
          value={0}
          color="primary"
          sx={{
            backgroundColor: alpha("#9d8a54", 0.5),
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          label={t("pages.home.runBlock.runWithDocker")}
        />
        <Tab
          value={1}
          sx={{
            backgroundColor: alpha("#9d8a54", 0.5),
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          label={t("pages.home.runBlock.runWithDockerCompose")}
        />
        <Tab
          value={2}
          sx={{
            backgroundColor: alpha("#9d8a54", 0.5),
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          label={t("pages.home.runBlock.manually")}
        />
      </Tabs>
      {tab === 0 && (
        <CodeBlock
          code={`export NEO4J_URL=<neo4j url>
export NEO4J_USER=<neo4j user>
export NEO4J_PASSWORD=<neo4j password>
export PROMETHEUS_HOST=<prometheus host>

docker run -d -p 8000:8000 -p 8265:8265 -p 7475:7475 --name data2graph_backend \\
-e NEO4J_URL=$NEO4J_URL -e NEO4J_USER=$NEO4J_USER -e NEO4J_PASSWORD=$NEO4J_PASSWORD \\
-e PROMETHEUS_HOST=$PROMETHEUS_HOST  ghcr.io/gorgonun/data_to_graph_backend:latest

docker run -d -p 80:80 --name data2graph_frontend ghcr.io/gorgonun/data_to_graph_frontend:latest
`}
        />
      )}
      {tab === 1 && (
        <CodeBlock
          code={`make start_infra profile=full
`}
        />
      )}
      {tab === 2 && (
        <CodeBlock
          code={`poetry install
make run

cd frontend/data2graph
npm install
npm run dev
`}
        />
      )}
    </Box>
  );
}
