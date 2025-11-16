import React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLoginViewModel } from "../../../viewmodels/auth/useLoginViewModel";

const LoginView: React.FC = () => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    loading, 
    error, 
    handleLogin 
  } = useLoginViewModel();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        bgcolor: "background.default",
      }}
    >

      {/* LEFT BRANDING (HIDDEN ON MOBILE) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1.8,
            p: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "white",
            background: "linear-gradient(135deg, #1A237E, #303F9F)",
          }}
        >
          <Typography variant="h2" fontWeight={800}>
            Mo:
          </Typography>

          <Typography variant="h4" sx={{ mt: 2, opacity: 0.95 }}>
            ERP Management System
          </Typography>

          <Typography variant="body1" sx={{ mt: 3, opacity: 0.8, maxWidth: 420 }}>
            A modern ERP platform built for Nepali companies — empowering businesses 
            with AI automation, accounting, inventory, and HR all in one place.
          </Typography>
        </Box>
      )}

      {/* RIGHT LOGIN SECTION — SINGLE CONTAINER */}
      <Box
        sx={{
          flex: isMobile ? "1" : "0.55",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: isMobile ? 4 : 8,
        }}
      >

        <Container
          maxWidth={false}
          sx={{
            width: isMobile ? "100%" : "380px",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{
                letterSpacing: "0.5px",
                mb: 0.5,
              }}
            >
              MoERP Console
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.7,
                letterSpacing: "0.3px"
              }}
            >
              Smart Business. Simplified.
            </Typography>
          </Box>

          <TextField
            label="Email Address"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error.email}
            helperText={error.email || ""}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: "4px" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error.password}
            helperText={error.password || ""}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: "4px" },
            }}
          />

          {error.general && (
            <Typography color="error" align="center" sx={{ fontSize: 12, mb: 1 }}>
              {error.general}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{
              py: 1.2,
              borderRadius: "4px",
              mt: 1,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
          </Button>
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "6px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: "0.85rem",
              }}
            >
              Need an account?
            </Typography>

            <Typography
              variant="body2"
              color="primary"
              sx={{
                fontWeight: 600,
                mt: 0.5,
                cursor: "pointer",
              }}
            >
              Contact: schitmrkr@gmail.com
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginView;
