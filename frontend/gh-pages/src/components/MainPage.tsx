import {
  alpha,
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import JsonDataExample from "../assets/json-data-example.png";
import MigratedDataExample from "../assets/migrated-data-example.png";
import DatabaseConnectionScreen from "../assets/database-connection-screen.png";
import MetricsAggregated from "../assets/metrics-aggregated.png";
import MetricsRealTime from "../assets/metrics-real-time.png";
import StreamingFromTurboC2 from "../assets/streaming-from-turbo-c2.png";
import { MessageBlock, MessageBlockProps } from "./MessageBlock";
import { ResourceBlock, ResourceBlockProps } from "./ResourceBlock";
import { pages } from "./pages";
import { IconD2G } from "./appbar/icons/d2g-icon";
import { useI18n } from "../hooks/useI18n";
import Trans from "next-translate/Trans";
import { RunTab } from "./RunTab";
import Link from "next/link";

type Message = Omit<MessageBlockProps, "title" | "message"> & {
  label: string;
};

export function MainPage() {
  const theme = useTheme();
  const { t } = useI18n({ namespace: "main" });
  const { t: tCommon } = useI18n({ namespace: "common" });

  
  const messages: Message[] = [
    {
      label: "automaticMigration",
      icon: "spa",
    },
    {
      label: "streaming",
      icon: "directionsBoat",
    },
    {
      label: "metricsVisualization",
      icon: "barChart",
    },
    {
      label: "scale",
      icon: "insights",
    },
  ];
  
  const resourceBlocks: (Omit<
    ResourceBlockProps,
    "direction" | "title" | "message"
  > & { label: string })[] = [
    {
      label: "automaticMigration",
      image: JsonDataExample,
      alt: "Exemplo de dados JSON.",
      size: "small",
    },
    {
      label: "jsonToGraph",
      image: MigratedDataExample,
      alt: "Exemplo de Migração de dados.",
      size: "small",
    },
    {
      label: "aggregatedMetrics",
      image: MetricsAggregated,
      alt: "Métricas agregadas de desempenho.",
      size: "medium",
    },
    {
      label: "realTimeMetrics",
      image: MetricsRealTime,
      alt: "Métricas em tempo real.",
      size: "large",
    },
    {
      label: "streamingTurboC2",
      image: StreamingFromTurboC2,
      alt: "Streaming a partir do Turbo C2.",
      size: "small",
    },
    {
      label: "databaseConnection",
      image: DatabaseConnectionScreen,
      alt: "Tela de conexão com banco de dados.",
      size: "xlarge",
    },
  ];

  return (
    <Box>
      <Stack width="100%" maxWidth="lg" mx="auto">
        <Stack
          ml={{ xs: 0, md: 2 }}
          mt={{ xs: 0, md: 15 }}
          p={2}
          alignItems={{ xs: "center", md: "auto" }}
          mb={{ xs: 2, md: 10 }}
        >
          <Stack alignItems="center">
            <Typography
              variant="h3"
              fontFamily="oxygenMono"
              fontWeight={700}
              color="primary"
            >
              {t(`pages.home.title`)}
            </Typography>
          </Stack>
          <Stack mt={2}>
            <Typography fontSize="1.5rem">
              {t(`pages.home.subtitle`)}
            </Typography>
          </Stack>
          <Stack
            mt={{ xs: 2, md: 5 }}
            px={{ xs: 0, md: 20 }}
            textAlign="justify"
          >
            <Typography fontSize="0.9rem" whiteSpace="pre-wrap">
              <Trans
                i18nKey="main:pages.home.description"
                components={{ b: <b /> }}
                values={{ src: "MongoDB", dest: "Neo4j" }}
              />
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent={{ xs: "center", md: "left" }}
            width={{ xs: "100%", md: "fit-content" }}
            mt={5}
          >
            <Box>
              <Button
                color="primary"
                variant="contained"
                sx={{ width: { xs: "100%", md: "auto" } }}
                component={Link}
                href="/documentation/getting-started"
              >
                {tCommon("actionButton")}
              </Button>
            </Box>
            <Box ml={{ xs: 0, md: 2 }} mt={{ xs: 2, md: 0 }}>
              <Button
                color="primary"
                startIcon={<ArticleIcon />}
                variant="outlined"
                sx={{ width: { xs: "100%", md: "auto" } }}
                component={Link}
                href="/documentation/introduction"
              >
                {tCommon("documentationButton")}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <Stack sx={{ backgroundColor: alpha("#9d8a54", 0.2) }}>
        <Stack width="100%" maxWidth="lg" mx="auto">
          <Stack p={{ xs: 2, md: 5 }}>
            <Typography>{t("pages.home.runBlock.title")}</Typography>
            <Box mt={2}>
              <RunTab />
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{ backgroundColor: alpha(theme.palette["secondary"].main, 0.2) }}
      >
        <Stack width="100%" maxWidth="lg" mx="auto">
          <Stack p={2}>
            {messages
              .reduce((accumulator, _, currentIndex, array) => {
                if (currentIndex % 2 === 0) {
                  accumulator.push(array.slice(currentIndex, currentIndex + 2));
                }
                return accumulator;
              }, [] as Message[][])
              .map(([messageOne, messageTwo], index) => (
                <Grid container key={index}>
                  <Grid item xs={12} md={6}>
                    <MessageBlock
                      title={t(
                        `pages.home.messageBlock.${messageOne.label}.title`
                      )}
                      message={t(
                        `pages.home.messageBlock.${messageOne.label}.content`
                      )}
                      icon={messageOne.icon}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MessageBlock
                      title={t(
                        `pages.home.messageBlock.${messageTwo.label}.title`
                      )}
                      message={t(
                        `pages.home.messageBlock.${messageTwo.label}.content`
                      )}
                      icon={messageTwo.icon}
                    />
                  </Grid>
                </Grid>
              ))}
          </Stack>
        </Stack>
      </Stack>
      <Stack mb={{ xs: 2, md: 10 }}>
        <Stack width="100%" maxWidth="lg" mx="auto">
          <Stack p={2}>
            {resourceBlocks.map((resourceBlock, index) => (
              <Box key={index} mt={{ xs: 2, md: 10 }}>
                <ResourceBlock
                  title={t(
                    `pages.home.resourceBlock.${resourceBlock.label}.title`
                  )}
                  message={t(
                    `pages.home.resourceBlock.${resourceBlock.label}.content`
                  )}
                  image={resourceBlock.image}
                  alt={resourceBlock.alt}
                  direction={index % 2 === 0 ? "left" : "right"}
                  size={resourceBlock.size}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>
      <Stack sx={{ backgroundColor: theme.palette["primary"].main }}>
        <Stack width="100%" maxWidth="lg" mx="auto">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent={{ xs: "auto", md: "space-evenly" }}
            alignItems={{ xs: "center", md: "auto" }}
            px={{ xs: 2, md: 10 }}
            py={{ xs: 6, md: 10 }}
          >
            <Stack direction="row" alignItems="center">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                flexWrap="wrap"
              >
                <IconD2G
                  sx={{
                    mr: 1,
                    fontSize: "3rem",
                    color: theme.palette["primary"].contrastText,
                  }}
                />
                <Typography
                  variant="h3"
                  fontFamily="oxygenMono"
                  fontWeight={700}
                  sx={{ color: theme.palette["primary"].contrastText }}
                >
                  Data 2 Graph
                </Typography>
              </Stack>
            </Stack>
            <Stack>
              {pages.map(({ label, href, target }, index) => (
                <Button
                  key={index}
                  LinkComponent={"a"}
                  href={href}
                  sx={{ color: theme.palette["primary"].contrastText }}
                  target={target}
                >
                  {t(`pages.${label}.title`)}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
