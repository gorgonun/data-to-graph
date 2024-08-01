import { Box, Stack, Typography } from "@mui/material";
import AppBar from "./components/AppBar";

function App() {
  return (
    <Stack>
      <Stack>
        <AppBar />
      </Stack>
      <Stack>
        <Box>
          <Typography>{'{)'}</Typography>
        </Box>
        <Box>
          <Typography>Migração de dados simples e escalável</Typography>
          <Typography>Com apenas as credenciais de acesso aos bancos de origem e destino, o Data2Graph migra dados de várias fontes para o Neo4j.</Typography>
        </Box>
      </Stack>
    </Stack>
  );
}

export default App;
