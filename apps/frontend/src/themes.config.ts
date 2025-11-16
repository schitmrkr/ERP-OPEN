import { createTheme } from "@mui/material";

export const technoLightTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1E293B", // lighter than deep slate navy
      paper: "#273449",   // slightly lighter for cards
    },
    primary: {
      main: "#38BDF8", // Neon cyan
      light: "#81E6FF", // lighter for hover & active
      dark: "#0EA5E9",
      contrastText: "#0F172A",
    },
    secondary: {
      main: "#8B5CF6", // softer electric violet
      light: "#C4B5FD",
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
      main: "#FACC15", // brighter amber
      light: "#FDE68A",
      dark: "#B45309",
      contrastText: "#000000",
    },
    error: {
      main: "#F87171", // softer red
      light: "#FECACA",
      dark: "#B91C1C",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#60A5FA", // softer blue
      light: "#93C5FD",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },
    divider: "#334155",
    text: {
      primary: "#F1F5F9", // lighter text
      secondary: "#CBD5E1", // slightly brighter secondary
      disabled: "#64748B",
    },
    action: {
      hover: "rgba(255, 255, 255, 0.05)",
      selected: "rgba(56, 189, 248, 0.2)",
      disabled: "rgba(203, 213, 225, 0.3)",
      disabledBackground: "rgba(203, 213, 225, 0.1)",
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
    body2: { fontSize: "0.875rem", color: "#CBD5E1" },
    button: { textTransform: "none", fontWeight: 600 },
    caption: { fontSize: "0.75rem", color: "#94A3B8" },
  },

  shape: {
    borderRadius: 12,
  },

  shadows: Array(25).fill("0px 4px 20px rgba(0,0,0,0.15)") as any, // softer shadows

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 18px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(56,189,248,0.3)", // softer hover glow
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
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
            boxShadow: "0 6px 20px rgba(56,189,248,0.25)", // softer
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

export const technoDarkTheme = createTheme({
palette: {
    mode: "dark",
    background: {
    default: "#121923", // Deep gray-blue
    paper: "#1E2533",   // Slightly lighter for cards
    },
    primary: {
    main: "#1976D2",    // Corporate blue
    light: "#63A4FF",
    dark: "#004BA0",
    contrastText: "#FFFFFF",
    },
    secondary: {
    main: "#9C27B0",    // Purple accent
    light: "#D05CE3",
    dark: "#6A0080",
    contrastText: "#FFFFFF",
    },
    success: {
    main: "#4CAF50",
    light: "#80E27E",
    dark: "#087F23",
    contrastText: "#FFFFFF",
    },
    warning: {
    main: "#FF9800",
    light: "#FFC947",
    dark: "#C66900",
    contrastText: "#000000",
    },
    error: {
    main: "#C44336", 
    light: "#FF7961",
    dark: "#BA000D",
    contrastText: "#FFFFFF",
    },
    info: {
    main: "#29B6F6",
    light: "#7AD6FF",
    dark: "#0086C3",
    contrastText: "#FFFFFF",
    },
    divider: "#2C3345",
    text: {
    primary: "#E0E0E0",
    secondary: "#A0A8B8",
    disabled: "#5A6370",
    },
    action: {
    hover: "rgba(255,255,255,0.08)",
    selected: "rgba(25,118,210,0.2)",
    disabled: "rgba(255,255,255,0.2)",
    disabledBackground: "rgba(255,255,255,0.05)",
    },
},

typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: "2.5rem", letterSpacing: "0.02em" },
    h2: { fontWeight: 600, fontSize: "2rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 500, fontSize: "1.5rem" },
    h5: { fontWeight: 500, fontSize: "1.25rem" },
    h6: { fontWeight: 500, fontSize: "1rem", textTransform: "uppercase" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", color: "#A0A8B8" },
    button: { textTransform: "none", fontWeight: 600 },
    caption: { fontSize: "0.75rem", color: "#6B7280" },
},

shape: {
    borderRadius: 10,
},

shadows: Array(25).fill("0px 4px 15px rgba(0,0,0,0.2)") as any,

components: {
    MuiButton: {
    styleOverrides: {
        root: {
        borderRadius: 8,
        padding: "8px 16px",
        transition: "all 0.3s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 15px rgba(25,118,210,0.3)",
        },
        },
    },
    },
    MuiPaper: {
    styleOverrides: {
        root: {
        backgroundImage: "none",
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        },
    },
    },
    MuiCard: {
    styleOverrides: {
        root: {
        borderRadius: 14,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 6px 20px rgba(25,118,210,0.2)",
        },
        },
    },
    },
    MuiLink: {
    styleOverrides: {
        root: {
        color: "#1976D2",
        "&:hover": { textDecoration: "underline", color: "#63A4FF" },
        },
    },
    },
},
});