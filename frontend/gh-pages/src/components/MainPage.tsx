"use client" 
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
import { IconD2G } from "./icons/d2g-icon";

const messages: MessageBlockProps[] = [
  {
    title: "Migração automática",
    message:
      "Com apenas as credenciais de acesso, o Data2Graph migra dados de várias fontes para o Neo4j.",
    icon: "spa",
  },
  {
    title: "Streaming",
    message:
      "O Data2Graph realiza o processamento de dados em tempo real e você pode controlar a sua execução.",
    icon: "directionsBoat",
  },
  {
    title: "Visualização de métricas",
    message: "Acompanhe o desempenho da migração por meio de dashboards.",
    icon: "barChart",
  },
  {
    title: "Escale conforme a necessidade",
    message:
      "O Data2Graph é escalável e pode ser utilizado em diferentes cenários de migração, tanto utilizando recursos de sua máquina local como em um cluster.",
    icon: "insights",
  },
];

const resourceBlocks: Omit<ResourceBlockProps, "direction">[] = [
  {
    title: "Migração completamente automática",
    message:
      "Utilize dados JSON com qualquer nível de complexidade e a migração irá ocorrer de forma automática.",
    image: JsonDataExample,
    alt: "Exemplo de dados JSON.",
    size: "small",
  },
  {
    title: "De objetos JSON para grafos",
    message:
      "Objetos são transformados em vértices e arestas, mantendo a estrutura e as relações entre eles.",
    image: MigratedDataExample,
    alt: "Exemplo de Migração de dados.",
    size: "small",
  },
  {
    title: "Com métricas agregadas",
    message:
      "Visualize métricas agregadas de desempenho da migração e acompanhe o progresso.",
    image: MetricsAggregated,
    alt: "Métricas agregadas de desempenho.",
    size: "medium",
  },
  {
    title: "E métricas em tempo real",
    message:
      "Acompanhe o progresso da migração em tempo real e tome decisões baseadas em dados.",
    image: MetricsRealTime,
    alt: "Métricas em tempo real.",
    size: "large",
  },
  {
    title: "Com streaming a partir do Turbo C2",
    message:
      "Visualize e gerencie sua migração utilizando o Turbo C2 e mantenha seus dados atualizados.",
    image: StreamingFromTurboC2,
    alt: "Streaming a partir do Turbo C2.",
    size: "small",
  },
  {
    title: "Necessitando apenas da conexão com banco de dados",
    message:
      "Conecte-se com o banco de dados de sua escolha e faça a migração de dados de forma simples.",
    image: DatabaseConnectionScreen,
    alt: "Tela de conexão com banco de dados.",
    size: "xlarge",
  },
];

export function MainPage() {
  const theme = useTheme();

  return (
    <Box>
      <Stack>
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
              Aproveite todo o potencial dos seus dados
            </Typography>
          </Stack>
          <Stack mt={2}>
            <Typography fontSize="1.5rem">
              Não se torne refém do formato
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
              >
                Baixe agora
              </Button>
            </Box>
            <Box ml={{ xs: 0, md: 2 }} mt={{ xs: 2, md: 0 }}>
              <Button
                color="primary"
                startIcon={<ArticleIcon />}
                variant="outlined"
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                Leia a documentação
              </Button>
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
              }, [] as MessageBlockProps[][])
              .map(([messageOne, messageTwo], index) =>
                  <Grid container key={index}>
                    <Grid item xs={12} md={6}>
                      <MessageBlock
                        title={messageOne.title}
                        message={messageOne.message}
                        icon={messageOne.icon}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MessageBlock
                        title={messageTwo.title}
                        message={messageTwo.message}
                        icon={messageTwo.icon}
                      />
                    </Grid>
                  </Grid>
              )}
          </Stack>
        </Stack>
      </Stack>
      <Stack mb={{ xs: 2, md: 10 }}>
        <Stack width="100%" maxWidth="lg" mx="auto">
          <Stack p={2}>
            {resourceBlocks.map((resourceBlock, index) => (
              <Box key={index} mt={{ xs: 2, md: 10 }}>
                <ResourceBlock
                  title={resourceBlock.title}
                  message={resourceBlock.message}
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
      <Stack
        sx={{ backgroundColor: theme.palette["primary"].main }}
      >
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
                <IconD2G sx={{ mr: 1, fontSize: "3rem", color: theme.palette["primary"].contrastText }} />
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
              {pages.map(({ name, onClick }, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    onClick();
                  }}
                  sx={{ color: theme.palette["primary"].contrastText }}
                >
                  {name}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
