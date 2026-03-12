import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  Legend, Line, LineChart
} from "recharts";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoney from "@mui/icons-material/AttachMoney";

// Funções de API
const fetchStockReport = async () => {
  const { data } = await client.get("/reports/stock");
  return data;
};
const fetchSalesReport = async () => {
  const { data } = await client.get("/reports/sales");
  return data;
};

export default function Dashboard() {
  const { data: stock, isLoading: loadingStock } = useQuery({
    queryKey: ["stockReport"],
    queryFn: fetchStockReport,
  });
  const { data: sales, isLoading: loadingSales } = useQuery({
    queryKey: ["salesReport"],
    queryFn: fetchSalesReport,
  });

  if (loadingStock || loadingSales) return <p>Carregando...</p>;

  // Totais
  const totalProdutos = stock.length;
  const valorTotalEstoque = stock.reduce((acc: number, item: any) => acc + item.total_value, 0);

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const vendasMes = sales.filter((s: any) => {
    const dataVenda = new Date(s.created_at);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });
  const vendasDia = sales.filter((s: any) => {
  const dataVenda = new Date(s.created_at);
  return (
    dataVenda.getDate() === now.getDate() &&
    dataVenda.getMonth() === now.getMonth() &&
    dataVenda.getFullYear() === now.getFullYear()
  );
});
  const totalVendasMes = vendasMes.reduce((acc: number, s: any) => acc + s.total_value, 0);
  const totalVendasDia = vendasDia.reduce((acc: number, s: any) => acc + s.total_value, 0);

  const nomesMeses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const vendasPorMes = Array.from({ length: 12 }, (_, i) => {
    const vendasDoMes = sales.filter((s: any) => new Date(s.created_at).getMonth() === i);
    const total = vendasDoMes.reduce((acc: number, s: any) => acc + s.total_value, 0);
    const quantidade = vendasDoMes.length;
    return { mes: nomesMeses[i], total, quantidade };
  });
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const vendasPorDia = Array.from({ length: diasNoMes }, (_, i) => {
    const vendasDoDia = vendasMes.filter((s: any) => new Date(s.created_at).getDate() === i + 1);
    const total = vendasDoDia.reduce((acc: number, s: any) => acc + s.total_value, 0);
    return { dia: i + 1, total };
  });

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      {/* Cards */}
      <Grid container spacing={3} marginBottom={5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#e3f2fd" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <InventoryIcon fontSize="large" color="primary" />
              <Typography variant="h6">Produtos em Estoque</Typography>
              <Typography variant="h4">{totalProdutos}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#e8f5e9" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <MonetizationOnIcon fontSize="large" color="success" />
              <Typography variant="h6">Valor do Estoque</Typography>
              {/* <Typography variant="h4">R$ {valorTotalEstoque.toFixed(2)}</Typography> */}
              <Typography variant="h4">R$ {valorTotalEstoque.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#fff3e0" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <AttachMoney fontSize="large" color="warning"/>
              <Typography variant="h6">Vendas Mês</Typography>
              <Typography variant="h4">R$ {totalVendasMes.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</Typography>
            </CardContent>
          </Card>
        </Grid>
      
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#fce4ec" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <AttachMoney fontSize="large" color="error"/>
              <Typography variant="h6">Vendas Dia</Typography>
              <Typography variant="h4">R$ {totalVendasDia.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mt: 5 }}>
        Vendas Dia (R$)
      </Typography>
      <ResponsiveContainer width="70%" height={200}>
        <LineChart data={vendasPorDia}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#4caf50" name="Valor Diário" />
        </LineChart>
      </ResponsiveContainer>

      {/* Gráfico de valor */}
      <Box width="100%">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          Vendas Mês (R$)
        </Typography>
        <ResponsiveContainer width="70%" height={200}>
          <BarChart data={vendasPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#1976d2" name="Valor Total" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
