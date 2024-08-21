import {
  Stack,
} from "@mui/material";
import { D2GAppBar } from "./components/AppBar";
import { MainPage } from "./components/MainPage";



function App() {
  return (
    <Stack id="app-root" sx={{ width: "100%", height: "100%" }}>
      <Stack>
        <D2GAppBar />
      </Stack>
      <MainPage />
    </Stack>
  );
}

export default App;
