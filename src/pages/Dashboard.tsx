import { Box, Card, CardContent, Typography, Alert, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  Legend, Line, LineChart
} from "recharts";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AttachMoney from "@mui/icons-material/AttachMoney";
import DashboardIcon from "@mui/icons-material/Dashboard";

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
  const { data: stock, isLoading: loadingStock, error: stockError } = useQuery({
    queryKey: ["stockReport"],
    queryFn: fetchStockReport,
  });
  const { data: sales, isLoading: loadingSales, error: salesError } = useQuery({
    queryKey: ["salesReport"],
    queryFn: fetchSalesReport,
  });

  if (loadingStock || loadingSales) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton height={44} sx={{ mb: 1 }} />
        <Skeleton height={180} sx={{ mb: 2 }} />
        <Skeleton height={260} sx={{ mb: 2 }} />
        <Skeleton height={260} />
      </Box>
    );
  }

  if (stockError || salesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Erro ao carregar dados do dashboard.</Alert>
      </Box>
    );
  }

  // Totais
  const totalProdutos = (stock ?? []).length;
  const valorTotalEstoque = (stock ?? []).reduce((acc: number, item: any) => acc + item.total_value, 0);

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const vendasMes = (sales ?? []).filter((s: any) => {
    const dataVenda = new Date(s.created_at);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });
  const vendasDia = (sales ?? []).filter((s: any) => {
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
    const vendasDoMes = (sales ?? []).filter((s: any) => new Date(s.created_at).getMonth() === i);
    const total = vendasDoMes.reduce((acc: number, s: any) => acc + s.total_value, 0);
    const quantidade = vendasDoMes.length;
    return { mes: nomesMeses[i], total, quantidade };
  });

  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const diasNoMesAnterior = new Date(anoMesAnterior, mesAnterior + 1, 0).getDate();
  const diasNoMesAtual = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const diaHoje = now.getDate();

  const vendasMesAnterior = (sales ?? []).filter((s: any) => {
    const d = new Date(s.created_at);
    return d.getMonth() === mesAnterior && d.getFullYear() === anoMesAnterior;
  });

  const diasNoGrafico = Math.max(diasNoMesAnterior, diaHoje, diasNoMesAtual);
  const labelMesAnterior = `${nomesMeses[mesAnterior]}/${anoMesAnterior}`;
  const labelMesAtual = `${nomesMeses[mesAtual]}/${anoAtual}`;

  const vendasPorDiaComparativo = Array.from({ length: diasNoGrafico }, (_, i) => {
    const dia = i + 1;
    const totalAnterior = dia <= diasNoMesAnterior
      ? vendasMesAnterior
          .filter((s: any) => new Date(s.created_at).getDate() === dia)
          .reduce((acc: number, s: any) => acc + s.total_value, 0)
      : null;
    const totalAtual =
      dia <= diaHoje
        ? vendasMes
            .filter((s: any) => new Date(s.created_at).getDate() === dia)
            .reduce((acc: number, s: any) => acc + s.total_value, 0)
        : null;
    return { dia, mesAnterior: totalAnterior, mesAtual: totalAtual };
  });

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <DashboardIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Dashboard
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Acompanhe rapidamente estoque e desempenho de vendas.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          mb: 3,
        }}
      >
        <Card sx={{ borderRadius: 2, backgroundColor: "#e3f2fd" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <InventoryIcon fontSize="large" color="primary" />
            <Typography variant="h6">Produtos em Estoque</Typography>
            <Typography variant="h4">{totalProdutos}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, backgroundColor: "#e8f5e9" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <MonetizationOnIcon fontSize="large" color="success" />
            <Typography variant="h6">Valor do Estoque</Typography>
            <Typography variant="h4">
              R$ {valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, backgroundColor: "#fce4ec" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <AttachMoney fontSize="large" color="error" />
            <Typography variant="h6">Vendas Dia</Typography>
            <Typography variant="h4">
              R$ {totalVendasDia.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, backgroundColor: "#fff3e0" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <AttachMoney fontSize="large" color="warning" />
            <Typography variant="h6">Vendas Mes</Typography>
            <Typography variant="h4">
              R$ {totalVendasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Vendas por dia (R$)
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={vendasPorDiaComparativo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mesAtual"
                  stroke="#4caf50"
                  name={`${labelMesAtual}`}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mesAnterior"
                  stroke="#9e9e9e"
                  name={labelMesAnterior}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Vendas Mes (R$)
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
