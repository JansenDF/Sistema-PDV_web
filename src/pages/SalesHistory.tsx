import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  TableContainer,
  Paper,
  Chip,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import HistoryIcon from "@mui/icons-material/History";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const fetchSales = async () => {
  const { data } = await client.get("/sales");
  return data;
};

export default function SalesHistory() {
  const { data: sales, isLoading, error } = useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });

  const [days, setDays] = useState(30);

  const filteredSales = useMemo(() => {
    const list = Array.isArray(sales) ? sales : [];
    const now = Date.now();
    const from = now - days * 24 * 60 * 60 * 1000;
    return list.filter((s: any) => {
      const t = new Date(s?.created_at).getTime();
      return Number.isFinite(t) ? t >= from : true;
    });
  }, [sales, days]);

  const totalVendas = filteredSales.length;
  const totalValor = filteredSales.reduce(
    (acc: number, s: any) => acc + Number(s?.total_value ?? 0),
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
            <HistoryIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Historico de Vendas
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Consulte vendas por periodo e confira os itens de cada venda.
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
            <MenuItem value={90}>Ultimos 90 dias</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Alert severity="error">
          Erro ao carregar: {(error as Error).message}
        </Alert>
      ) : (
        <>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Resumo
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`Vendas: ${totalVendas}`}
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
            </CardContent>
          </Card>

          {isLoading ? (
            <Box>
              <Skeleton height={84} sx={{ mb: 2 }} />
              <Skeleton height={84} sx={{ mb: 2 }} />
              <Skeleton height={84} />
            </Box>
          ) : filteredSales.length === 0 ? (
            <Alert severity="info">Nenhuma venda encontrada no periodo.</Alert>
          ) : (
            filteredSales.map((sale: any) => (
              <Card key={sale.id} sx={{ mb: 3, borderRadius: 2 }}>
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
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Venda #{sale.id} •{" "}
                        {sale.date ? dayjs(sale.date).format("DD/MM/YYYY"): ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Criado em: {sale.created_at ? new Date(sale.created_at).toLocaleString("pt-BR"): ""}
                      </Typography>
                    </Box>
                    <Chip
                      label={`R$ ${Number(sale?.total_value ?? 0).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Produto</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Preco unitario</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(sale.items ?? []).map((item: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {item?.product?.description}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              R${" "}
                              {Number(item.unit_price ?? 0).toLocaleString(
                                "pt-BR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </TableCell>
                            <TableCell align="right">
                              R${" "}
                              {(
                                Number(item.quantity ?? 0) *
                                Number(item.unit_price ?? 0)
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </Box>
  );
}
