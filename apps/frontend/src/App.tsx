import AppRouter from "./views/appRouter";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";


const technoTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F172A", // Deep slate navy
      paper: "#111827", // Slightly lighter for cards
    },
    primary: {
      main: "#38BDF8", // Neon cyan
      light: "#67E8F9",
      dark: "#0EA5E9",
      contrastText: "#0F172A",
    },
    secondary: {
      main: "#7C3AED", // Electric violet
      light: "#A78BFA",
      dark: "#5B21B6",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#22C55E",
      light: "#4ADE80",
      dark: "#15803D",
      contrastText: "#000000",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#B45309",
      contrastText: "#000000",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#B91C1C",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    divider: "#1E293B",
    text: {
      primary: "#E2E8F0",
      secondary: "#94A3B8",
      disabled: "#475569",
    },
    action: {
      hover: "#1E293B",
      selected: "#1E40AF",
      disabled: "#334155",
      disabledBackground: "#1E293B",
    },
  },

  typography: {
    fontFamily: "'Orbitron', 'Roboto', sans-serif",
    h1: { fontWeight: 700, fontSize: "2.75rem", letterSpacing: "0.02em" },
    h2: { fontWeight: 600, fontSize: "2.25rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 500, fontSize: "1.5rem" },
    h5: { fontWeight: 500, fontSize: "1.25rem" },
    h6: { fontWeight: 500, fontSize: "1rem", textTransform: "uppercase" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", color: "#94A3B8" },
    button: { textTransform: "none", fontWeight: 600 },
    caption: { fontSize: "0.75rem", color: "#64748B" },
  },

  shape: {
    borderRadius: 12,
  },

  shadows: Array(25).fill("0px 4px 20px rgba(0,0,0,0.2)") as any,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 18px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 25px rgba(56,189,248,0.2)",
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#38BDF8",
          "&:hover": { textDecoration: "underline", color: "#67E8F9" },
        },
      },
    },
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
