import { useState } from "react";
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, Card, CardContent, Chip, Alert, Skeleton,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const fetchPurchases = async () => {
  const { data } = await client.get("/purchase/");
  return data;
};

export default function Purchases() {
  const navigate = useNavigate();
  const { data: purchases, isLoading, error } = useQuery({ queryKey: ["purchases"], queryFn: fetchPurchases });
  const [openItemsModal, setOpenItemsModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  const handleOpenItemsModal = (purchase: any) => {
    setSelectedPurchase(purchase);
    setOpenItemsModal(true);
  };
  
  const totalCompras = (purchases ?? []).length;
  const totalItensCadastrados = (purchases ?? []).reduce(
    (acc: number, purchase: any) => acc + (purchase?.items?.length ?? 0),
    0
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "supplier",
      headerName: "Fornecedor",
      width: 150,
      valueGetter: (_value, row) =>
        row?.supplier.company_name?.toUpperCase() ?? row?.supplier_id
    },
    {
      field: "stock",
      headerName: "Estoque",
      width: 150,
      valueGetter: (_value, row) => row?.stock.description ?? row?.stock_id
    },
    {
      field: "items",
      headerName: "Itens",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {(params.row?.items ?? [])
              .map(
                (i: any) =>
                  `${i.product?.description.toUpperCase() ?? i.product_id}`
              )
              .join("; ")}
          </Typography>
          <Button
            size="small"
            onClick={() => handleOpenItemsModal(params.row)}
            sx={{ minWidth: "auto", whiteSpace: "nowrap" }}
          >
            Detalhes
          </Button>
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Data",
      width: 180,
      valueGetter: (value) => new Date(String(value)).toLocaleString("pt-BR"),
    },
    {
      field: "updated_at",
      headerName: "Atualizado",
      width: 180,
      valueGetter: (value) => new Date(String(value)).toLocaleString("pt-BR"),
    },
  ];

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
            <ShoppingCartCheckoutIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Compras
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Gerencie entradas de produtos e acompanhe o historico de compras.
          </Typography>
        </Box>

        <Button variant="contained" color="primary" onClick={() => navigate("/purchases/new")}>
          Adicionar compra
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar compras.
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
                  label={`Compras: ${totalCompras}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`Itens registrados: ${totalItensCadastrados}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {isLoading ? (
              <Box>
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} />
              </Box>
            ) : (
              <Box sx={{ width: "100%" }}>
                <DataGrid
                  rows={purchases ?? []}
                  columns={columns}
                  pageSizeOptions={[5, 10]}
                  autoHeight
                  disableRowSelectionOnClick
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={openItemsModal}
        onClose={() => setOpenItemsModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Itens da compra #{selectedPurchase?.id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fornecedor: {selectedPurchase?.supplier?.company_name ?? "-"} | Estoque:{" "}
            {selectedPurchase?.stock?.description ?? "-"}
          </Typography>

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
                {(selectedPurchase?.items ?? []).map((item: any, index: number) => (
                  <TableRow key={`${item?.id ?? "item"}-${index}`} hover>
                    <TableCell>{item?.product?.description ?? item?.product_id}</TableCell>
                    <TableCell align="right">{item?.quantity ?? 0}</TableCell>
                    <TableCell align="right">
                      R${" "}
                      {Number(item?.unit_price ?? 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      R${" "}
                      {(Number(item?.quantity ?? 0) * Number(item?.unit_price ?? 0)).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemsModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
