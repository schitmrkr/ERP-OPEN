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


const RegisterView: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [errorEmail, setErrorEmail] = React.useState("");
  const [errorConfirm, setErrorConfirm] = React.useState("");

  const handleRegister = async () => {
    setLoading(true);
    try {
      // simulate register call
      await new Promise((r) => setTimeout(r, 1000));
      setErrorEmail("");
      setErrorConfirm("");
    } catch (e) {
      setErrorEmail("An error has occurred.");
      setErrorConfirm("Passwords do not match.");
    } finally {
      setLoading(false);
    }
  };

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
            boxShadow: theme.shadows[3], // replicates Paper's elevation={3}
          })}
        >

          <TextField
            id="email"
            label="Email Address"
            placeholder="Enter Email Address"
            fullWidth
            error={!!errorEmail}
            helperText={errorEmail}
            sx={{
              "& .MuiInputBase-input": {
                padding: "14px 16px",
              },
            }}
          />

          <TextField
            id="username"
            label="Username"
            placeholder="Enter Username"
            fullWidth
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
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                padding: "14px 16px",
              },
            }}
          />

          <TextField
            id="confirm-password"
            label="Confirm Password"
            placeholder="Confirm Password"
            type="password"
            fullWidth
            error={!!errorConfirm}
            helperText={errorConfirm}
            sx={{
              "& .MuiInputBase-input": {
                padding: "14px 16px",
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            onClick={handleRegister}
            sx={{
              mt: 1,
              py: 1,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Already have an account?{" "}
            <Link href="/login" underline="hover" color="primary">
              Log in
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterView;
