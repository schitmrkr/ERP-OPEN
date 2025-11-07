import AppRouter from "./views/appRouter";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const technoTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F172A", 
      paper: "#111827",
    },
    primary: {
      main: "#C0E0EE", 
    },
    secondary: {
      main: "#7C3AED", 
    },
    text: {
      primary: "#E2E8F0",
      secondary: "#94A3B8",
    },
    action: {
      hover: "#1E293B"
    }
  },
  typography: {
    fontFamily: "'Orbitron', sans-serif", 
  },
});

function App() {
  return (
    <ThemeProvider theme={technoTheme}>
      <CssBaseline />
        <AppRouter />
    </ThemeProvider>
  );
}

export default App;
