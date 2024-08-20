import {
  alpha,
  Box,
  Button,
  Grid,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import { D2GAppBar } from "./components/AppBar";
import ArticleIcon from "@mui/icons-material/Article";
import InsightsIcon from "@mui/icons-material/Insights";
import SpaIcon from "@mui/icons-material/Spa";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import BarChartIcon from "@mui/icons-material/BarChart";
import JsonDataExample from "./assets/json-data-example.png";
import MigratedDataExample from "./assets/migrated-data-example.png";
import DatabaseConnectionScreen from "./assets/database-connection-screen.png";
import MetricsAggregated from "./assets/metrics-aggregated.png";
import MetricsRealTime from "./assets/metrics-real-time.png";
import StreamingFromTurboC2 from "./assets/streaming-from-turbo-c2.png";
import { IconD2G } from "./components/icons/d2g-icon";
import { pages } from "./components/pages";

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

function App() {
  const theme = useTheme();

  return (
    <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
      <Stack>
        <D2GAppBar />
      </Stack>
      <Stack width="100%" maxWidth="lg" mx="auto">
        <Stack ml={2} mt={15} p={2}>
          <Stack>
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
            direction="row"
            justifyContent="left"
            width="fit-content"
            mt={5}
          >
            <Box>
              <Button color="primary" variant="contained">
                Baixe agora
              </Button>
            </Box>
            <Box ml={2}>
              <Button
                color="primary"
                startIcon={<ArticleIcon />}
                variant="outlined"
              >
                Leia a documentação
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        mt={10}
        p={2}
        sx={{ backgroundColor: alpha(theme.palette["secondary"].main, 0.2) }}
      >
        <Stack width="100%" maxWidth="lg" mx="auto">
          {messages.map((message, index) =>
            index % 2 === 0 ? (
              <Grid container>
                <Grid item xs={6}>
                  <MessageBlock
                    title={message.title}
                    message={message.message}
                    icon={message.icon}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MessageBlock
                    title={messages[index + 1].title}
                    message={messages[index + 1].message}
                    icon={messages[index + 1].icon}
                  />
                </Grid>
              </Grid>
            ) : (
              <></>
            )
          )}
        </Stack>
      </Stack>
      <Stack>
        <Stack p={2} width="100%" maxWidth="lg" mx="auto">
          {resourceBlocks.map((resourceBlock, index) => (
            <Box key={index} mt={10}>
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
      <Stack
        mt={10}
        sx={{ backgroundColor: alpha(theme.palette["secondary"].main, 0.2) }}
      >
        <Stack direction='row' justifyContent='space-evenly' p={10} width="100%" maxWidth="lg" mx="auto">
          <Stack direction='row' alignItems='center'>
            <IconD2G color='primary' sx={{ mr: 1, fontSize: '3rem'  }} />
            <Typography
              variant="h3"
              fontFamily="oxygenMono"
              fontWeight={700}
              color="primary"
            >
              Data 2 Graph
            </Typography>
          </Stack>
          <Stack>
            {pages.map(({ name, onClick }) => (
              <Button
                key={name}
                onClick={() => {
                  onClick();
                }}
                sx={{ color: "primary" }}
              >
                {name}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

const iconMap = {
  article: (props: SxProps) => (
    <ArticleIcon color="primary" sx={{ ...props }} />
  ),
  insights: (props: SxProps) => (
    <InsightsIcon color="primary" sx={{ ...props }} />
  ),
  spa: (props: SxProps) => <SpaIcon color="primary" sx={{ ...props }} />,
  directionsBoat: (props: SxProps) => (
    <DirectionsBoatIcon color="primary" sx={{ ...props }} />
  ),
  barChart: (props: SxProps) => (
    <BarChartIcon color="primary" sx={{ ...props }} />
  ),
};

interface MessageBlockProps {
  title: string;
  message: string;
  icon: keyof typeof iconMap;
}

function MessageBlock({ title, message, icon }: MessageBlockProps) {
  const globalIconProps: SxProps = {
    fontSize: "4rem",
  };

  const iconComponent = iconMap[icon](globalIconProps);

  return (
    <Stack p={4}>
      <Stack alignItems="center">{iconComponent}</Stack>
      <Stack mt={2}>
        <Typography
          variant="h6"
          fontFamily="oxygenMono"
          fontWeight={700}
          color="primary"
        >
          {title}
        </Typography>
        <Typography>{message}</Typography>
      </Stack>
    </Stack>
  );
}

interface ResourceBlockProps {
  title: string;
  message: string;
  image: string;
  alt: string;
  direction: "left" | "right";
  size: "small" | "medium" | "large" | "xlarge";
}

function ResourceBlock({
  title,
  message,
  image,
  alt,
  direction,
  size,
}: ResourceBlockProps) {
  const sizeMapping = {
    small: "10vw",
    medium: "15vw",
    large: "20vw",
    xlarge: "30vw",
  };

  const TextResource = (
    <Stack>
      <Typography
        variant="h4"
        fontFamily="oxygenMono"
        fontWeight={700}
        color="secondary"
      >
        {title}
      </Typography>
      <Typography>{message}</Typography>
    </Stack>
  );

  const ImageResource = (
    <Box
      component="img"
      alt={alt}
      src={image}
      sx={{
        maxWidth: sizeMapping[size],
        borderRadius: "10px",
        boxShadow: 2,
        ml: direction === "left" ? 0 : 3,
        mr: direction === "right" ? 3 : 0,
      }}
    />
  );

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {direction === "left" ? TextResource : ImageResource}
      {direction === "right" ? TextResource : ImageResource}
    </Stack>
  );
}

export default App;
