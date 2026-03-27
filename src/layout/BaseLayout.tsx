import React from "react";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const name = user ? user.name.split(' ')[0] + ' ' + user.name.split(' ').slice(-1)[0] : "Não autenticado"
  const [confirmOpenCashier, setConfirmOpenCashier] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  // gera iniciais do usuário
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Topo */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Sistema PDV
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between", // distribui topo e rodapé
          },
        }}
      >
        <Box>
          <Dialog open={confirmOpenCashier} onClose={() => setConfirmOpenCashier(false)}>
            <DialogTitle textAlign={"center"}>Abrir Caixa</DialogTitle>
            <DialogContent>
              <Typography>Você deseja abrir o caixa?</Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={() => setConfirmOpenCashier(false)} color="inherit">
                Não
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpenCashier(false);
                  navigate("/sales"); // redireciona para a tela de vendas
                }}
                color="primary"
                variant="contained"
              >
                Sim
              </Button>
            </DialogActions>
          </Dialog>

          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <ListItemButton component={Link} to="/dashboard">
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton component={Link} to="/products">
                <ListItemText primary="Produtos" />
              </ListItemButton>
              <ListItemButton component={Link} to="/purchases">
                <ListItemText primary="Compras" />
              </ListItemButton>
              <ListItemButton component={Link} to="/reports">
                <ListItemText primary="Relatórios" />
              </ListItemButton>
              <ListItemButton onClick={() => setConfirmOpenCashier(true)}>
                <ListItemText primary="Caixa" />
              </ListItemButton>
            </List>
          </Box>
        </Box>

        {/* Rodapé da sidebar */}
        <Box sx={{ p: 2, borderTop: "1px solid #ddd", display: "flex", alignItems: "center", gap: 3 }}>
          {user && (
            <>
              <Avatar>{getInitials(name)}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">{name}</Typography>
                <Button variant="outlined" color="error" size="small" onClick={handleLogout} sx={{ mt: 0.5 }} >
                  Logout
                </Button>
              </Box>
            </>
          )}
          {!user && <Typography variant="body2">Não autenticado</Typography>}
        </Box>
      </Drawer>

      {/* Conteúdo principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
