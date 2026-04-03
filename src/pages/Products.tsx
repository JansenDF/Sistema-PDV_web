import { useState } from "react";
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
  Card, CardContent, Chip, Alert, Skeleton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales"
import type { GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate } from "react-router-dom";
import { exportProductsLabelExcel } from "../utils/exportProductsLabelExcel";

const fetchProducts = async () => {
  const { data } = await client.get("/products");
  return data;
};

const updateProduct = async (product: any) => {
  const { data } = await client.patch(`/products/${product.id}`, {
    description: product.description,
    price: product.price
  });
  return data;
};

export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    description: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm({ ...form, [name!]: value });
  };

  const handleSubmit = () => {
    updateMutation.mutate({
      id: form.id,
      description: form.description,
      price: parseFloat(form.price),
    });
    setOpen(false);
    setForm({
      id: "",
      description: "",
      price: "",
    });
  };

  const handleEdit = (row: any) => {
    setForm({
      id: row.id,
      description: row.description,
      price: row.price,
    });
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "description",
      headerName: "Descrição",
      flex: 1,
      valueFormatter: (value) => (value ? String(value).toUpperCase() : ""),
    },
    {
      field: "product_sub_category",
      headerName: "Categoria",
      width: 200,
      valueGetter: (_value, row) =>
        row?.product_sub_category?.description?.toUpperCase?.() ?? "",
    },
    {
      field: "price",
      headerName: "Preço",
      width: 150,
      valueFormatter: (value) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)),
    },
    { field: "quantity", headerName: "Quantidade", width: 150 },
    {
      field: "stock",
      headerName: "Estoque",
      width: 200,
      valueGetter: (_value, row) => row?.stock?.description ?? "",
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleEdit(params.row)}>
          <EditIcon />
        </IconButton>
      ),
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
            <Inventory2Icon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Produtos
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Cadastre e atualize produtos com categoria, estoque e preco.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: { xs: "stretch", sm: "flex-end" } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            disabled={isLoading || !(products ?? []).length}
            onClick={() => {
              void exportProductsLabelExcel(products ?? []);
            }}
          >
            Excel para etiquetas
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/products/new")}
          >
            Adicionar Produto
          </Button>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar produtos.
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
              <Chip
                label={`Produtos: ${(products ?? []).length}`}
                variant="outlined"
                color="primary"
                size="small"
              />
            </Box>

            {isLoading ? (
              <Box>
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} sx={{ mb: 1 }} />
                <Skeleton height={42} />
              </Box>
            ) : (
              <DataGrid
                pageSizeOptions={[10, 100, { value: 1000, label: "1,000" }, { value: -1, label: "All" }]}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                rows={products ?? []}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
              />
            )}
          </CardContent>
        </Card>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Editar Produto</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Descrição"
            name="description"
            fullWidth
            value={form.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Preço"
            name="price"
            type="number"
            fullWidth
            value={form.price}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
