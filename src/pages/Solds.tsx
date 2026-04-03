import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Paper,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import client from "../api/client";

export default function Solds() {
  const fetchSoldProducts = async (days: number) => {
    const { data } = await client.get(`/reports/sold-products?days=${days}`);
    return data;
  };

  const [days, setDays] = useState(7);

  const { data: soldProducts, isLoading, error } = useQuery({
    queryKey: ["soldProducts", days],
    queryFn: () => fetchSoldProducts(days),
  });

  const totalItens = (soldProducts ?? []).reduce(
    (acc: number, p: any) => acc + Number(p.quantity ?? 0),
    0
  );
  const totalValor = (soldProducts ?? []).reduce(
    (acc: number, p: any) => acc + Number(p.total_value ?? 0),
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ReceiptLongIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Mais vendidos
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Produtos mais vendidos no periodo selecionado.
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="periodo-label">Periodo</InputLabel>
          <Select
            labelId="periodo-label"
            value={days}
            label="Periodo"
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <MenuItem value={7}>Ultimos 7 dias</MenuItem>
            <MenuItem value={15}>Ultimos 15 dias</MenuItem>
            <MenuItem value={30}>Ultimos 30 dias</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Alert severity="error">
          Erro ao carregar: {(error as Error).message}
        </Alert>
      ) : (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Resumo
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Itens: ${totalItens}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`Total: R$ ${totalValor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {isLoading ? (
              <Box>
                <Skeleton height={36} sx={{ mb: 1 }} />
                <Skeleton height={36} sx={{ mb: 1 }} />
                <Skeleton height={36} sx={{ mb: 1 }} />
                <Skeleton height={36} />
              </Box>
            ) : (soldProducts ?? []).length === 0 ? (
              <Alert severity="info">Nenhuma venda encontrada no periodo.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Valor total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(soldProducts ?? []).map((p: any) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {String(p.description ?? "").toUpperCase()}
                        </TableCell>
                        <TableCell align="right">{p.quantity}</TableCell>
                        <TableCell align="right">
                          R${" "}
                          {Number(p.total_value ?? 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
