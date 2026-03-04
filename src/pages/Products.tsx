import { useState } from "react";
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales"
import type { GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import EditIcon from "@mui/icons-material/Edit";

const fetchProducts = async () => {
  const { data } = await client.get("http://127.0.0.1:8000/products");
  return data;
};

const fetchStocks = async () => {
  const { data } = await client.get("http://127.0.0.1:8000/stocks");
  return data;
};

const addProduct = async (newProduct: any) => {
  const { data } = await client.post("http://127.0.0.1:8000/products", newProduct);
  return data;
};

const updateProduct = async (product: any) => {
  const { data } = await client.patch(`http://127.0.0.1:8000/products/${product.id}`, {
    description: product.description,
    price: product.price
  });
  return data;
};

export default function Products() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: stocks } = useQuery({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
  });

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ id: "", description: "", price: "", quantity: "", stock_id: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm({ ...form, [name!]: value });
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({
        id: form.id,
        description: form.description,
        price: parseFloat(form.price),
      });
    } else {
      addMutation.mutate({
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        stock_id: parseInt(form.stock_id),
      });
    }
    setOpen(false);
    setForm({ id: "", description: "", price: "", quantity: "", stock_id: "" });
    setEditing(false);
  };

  const handleEdit = (row: any) => {
    setForm({
      id: row.id,
      description: row.description,
      price: row.price,
      quantity: row.quantity,
      stock_id: row.stock?.id || "",
    });
    setEditing(true);
    setOpen(true);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar produtos</p>;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "description", headerName: "Descrição", flex: 1 },
    {
      field: "price",
      headerName: "Preço",
      width: 150,
      valueFormatter: (params) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(params),
    },
    { field: "quantity", headerName: "Quantidade", width: 150 },
    {
      field: "stock",
      headerName: "Estoque",
      width: 200,
      valueGetter: (params) => params.description ?? "",
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
      <Typography variant="h5" gutterBottom>
        Produtos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => {
          setForm({ id: "", description: "", price: "", quantity: "", stock_id: "" });
          setEditing(false);
          setOpen(true);
        }}
      >
        Adicionar Produto
      </Button>
      <DataGrid localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} rows={products} columns={columns} pageSizeOptions={[5, 10]} autoHeight />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
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
          {!editing && (
            <>
              <TextField
                margin="dense"
                label="Quantidade"
                name="quantity"
                type="number"
                fullWidth
                value={form.quantity}
                onChange={handleChange}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="stock-label">Estoque</InputLabel>
                <Select
                  labelId="stock-label"
                  name="stock_id"
                  value={form.stock_id}
                  onChange={handleChange}
                >
                  {stocks?.map((stock: any) => (
                    <MenuItem key={stock.id} value={stock.id}>
                      {stock.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editing ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
