import { ThemeProvider } from "@mui/material/styles";
import Dashboards from "./components/Dashboards";
import { useThemeContext } from "./theme/use-theme-context";
import { CssBaseline } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import Migrations from "./components/Migrations";
import MiniDrawer from "./components/Drawer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Page component={<Dashboards />} />}></Route>
      <Route path="/migrations" element={<Page component={<Migrations />} />}></Route>
    </Routes>
  );
}

interface PageProps {
  component: JSX.Element;
}

function Page({ component }: PageProps) {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MiniDrawer children={component}/>
    </ThemeProvider>
  );
}

export default App;
