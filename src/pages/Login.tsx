import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import client from "../api/client";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
        const params = new URLSearchParams();
        params.append("username", form.username);
        params.append("password", form.password);

        const { data } = await client.post("http://127.0.0.1:8000/login", params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        // salva token
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({ email: data.email, name: data.name }));
        // redireciona para dashboard
        window.location.href = "/dashboard";
    } catch (err: any) {
        setError("Usuário ou senha inválidos");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <TextField
          label="Email"
          name="username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange}
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Entrar
        </Button>
      </Paper>
    </Box>
  );
}
