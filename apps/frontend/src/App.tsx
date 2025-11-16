import { useState } from "react";
import AppRouter from "./views/appRouter";
import { ThemeProvider, CssBaseline, MenuItem, Select, Box } from "@mui/material";
import { technoDarkTheme, technoLightTheme } from "./themes.config";

const themes = {
  "Techno Dark": technoDarkTheme,
  "Techno Light": technoLightTheme,
};

function App() {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>("Techno Dark");

  return (
    <ThemeProvider theme={themes[selectedTheme]}>
      <CssBaseline />
      
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 999 }}>
        <Select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value as keyof typeof themes)}
          size="small"
          sx={{ bgcolor: "background.paper", color: "text.primary", borderRadius: 1 }}
        >
          {Object.keys(themes).map((themeName) => (
            <MenuItem key={themeName} value={themeName}>
              {themeName}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
