import { useState } from "react";
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";

const fetchPurchases = async () => {
  const { data } = await axios.get("http://127.0.0.1:8000/purchase/");
  return data;
};

const addPurchase = async (newPurchase: any) => {
  const { data } = await axios.post("http://127.0.0.1:8000/purchase/", newPurchase);
  return data;
};

export default function Purchases() {
  const queryClient = useQueryClient();
  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ["purchases"],
    queryFn: fetchPurchases,
  });

  const addMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier_id: "", stock_id: "", items: [] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    addMutation.mutate({
      supplier_id: parseInt(form.supplier_id),
      stock_id: parseInt(form.stock_id),
      items: form.items, // aqui futuramente podemos abrir sub-form para adicionar produtos
    });
    setOpen(false);
    setForm({ supplier_id: "", stock_id: "", items: [] });
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar compras</p>;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
        field: "supplier",
        headerName: "Fornecedor",
        width: 150,
        valueGetter: (params) => params.company_name
    },
    {
        field: "stock",
        headerName: "Estoque",
        width: 150,
        valueGetter: (params) => params.description
    },
    {
      field: "items",
      headerName: "Itens",
      flex: 1,
      valueGetter: (params) =>
        params
          .map((i: any) => `Produto ${i.product.description} (Qtd: ${i.quantity}, R$${i.unit_price})`)
          .join("; "),
    },
    {
      field: "created_at",
      headerName: "Data",
      width: 180,
      valueGetter: (params) => new Date(params).toLocaleString("pt-BR"),
    },
    {
      field: "updated_at",
      headerName: "Atualizado",
      width: 180,
      valueGetter: (params) => new Date(params).toLocaleString("pt-BR"),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Compras
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => setOpen(true)}
      >
        Adicionar Compra
      </Button>
      <DataGrid rows={purchases} columns={columns} pageSizeOptions={[5, 10]} autoHeight />

      {/* Modal de adicionar compra */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Adicionar Compra</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Fornecedor ID"
            name="supplier_id"
            fullWidth
            value={form.supplier_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Estoque ID"
            name="stock_id"
            fullWidth
            value={form.stock_id}
            onChange={handleChange}
          />
          {/* Aqui futuramente podemos adicionar UI para inserir itens da compra */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
