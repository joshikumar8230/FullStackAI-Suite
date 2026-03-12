import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Card, TextField, Button, Typography, Stack } from "@mui/material";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("https://fullstackai-suite.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", data.user.username);
        navigate("/auto-category");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4f6f8",
        p: 2,
      }}
    >
      <Card
        sx={{
          p: 4,
          width: 350,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h4" mb={3}>
          Login
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleLogin}
            sx={{ mt: 1 }}
          >
            Login
          </Button>
        </Stack>

        <Typography variant="body2" mt={3}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "500" }}>
            Signup
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}

export default LoginPage;