import React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Link,
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: "500px",
        }}
      >
        <Box
          sx={(theme) => ({
            p: 6,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3], 
          })}
        >


          <TextField
            id="email"
            label="Email Address"
            placeholder="Enter Email Address"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error.email}
            helperText={error.email || ""}
            sx={{
              "& .MuiInputBase-input": {
                padding: "14px 16px",
              },
            }}
          />

          <TextField
            id="password"
            label="Password"
            placeholder="Enter Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            error={!!error.password}
            helperText={error.password || ""}
            sx={{
              "& .MuiInputBase-input": {
                padding: "14px 16px",
              },
            }}
          />

          {error.general && (
            <Typography 
              color="error" 
              align="center"
              sx={{
                fontSize: 11,
              }}>
              {error.general}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{
              mt: 1,
              py: 1,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Don’t have an account?{" "}
            <Link href="/register" underline="hover" color="primary">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginView;
