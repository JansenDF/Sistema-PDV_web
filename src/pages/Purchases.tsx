import { useState } from "react";
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

const fetchPurchases = async () => {
  const { data } = await client.get("/purchase/");
  return data;
};

const fetchSuppliers = async () => {
  const { data } = await client.get("/suppliers/");
  return data;
};

const fetchStocks = async () => {
  const { data } = await client.get("/stocks/");
  return data;
};

const fetchProducts = async () => {
  const { data } = await client.get("/products/");
  return data;
};

const addPurchase = async (newPurchase: any) => {
  const { data } = await client.post("/purchase/", newPurchase);
  return data;
};

export default function Purchases() {
  const queryClient = useQueryClient();
  const { data: purchases, isLoading, error } = useQuery({ queryKey: ["purchases"], queryFn: fetchPurchases });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });
  const { data: stocks } = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const addMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });

  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [stockId, setStockId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [itemForm, setItemForm] = useState({ product_id: "", quantity: "", unit_price: "" });

  const handleAddItem = () => {
    if (!stockId || !supplierId || !itemForm.product_id || !itemForm.quantity || !itemForm.unit_price) {
      alert("Preencha todos os campos do item antes de adicionar.");
      return;
    }
    const product = products?.find((p: any) => p.id === parseInt(itemForm.product_id));

    setItems([...items, {
      product_id: parseInt(itemForm.product_id),
      product_description: product?.description ?? "",
      quantity: parseInt(itemForm.quantity),
      unit_price: parseFloat(itemForm.unit_price)
    }]);
    setItemForm({ product_id: "", quantity: "", unit_price: "" });
  };

  const handleSubmit = () => {
    addMutation.mutate({
      supplier_id: parseInt(supplierId),
      stock_id: parseInt(stockId),
      items,
    });
    setOpen(false);
    setSupplierId("");
    setStockId("");
    setItems([]);
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar compras</p>;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "supplier",
      headerName: "Fornecedor",
      width: 150,
      valueGetter: (params) => params?.company_name.toUpperCase() ?? params.supplier_id
    },
    {
      field: "stock",
      headerName: "Estoque",
      width: 150,
      valueGetter: (params) => params?.description ?? params.stock_id
    },
    {
      field: "items",
      headerName: "Itens",
      flex: 1,
      valueGetter: (params) =>
        params
          .map((i: any) => `${i.product?.description.toUpperCase() ?? i.product_id} (Qtd: ${i.quantity}, R$${i.unit_price})`)
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
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Adicionar Compra
      </Button>
      <DataGrid rows={purchases ?? []} columns={columns} pageSizeOptions={[5, 10]} autoHeight />

      {/* Modal de adicionar compra */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Compra</DialogTitle>
        <DialogContent>
          {/* Fornecedor */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="supplier-label">Fornecedor</InputLabel>
            <Select labelId="supplier-label" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              {suppliers?.map((s: any) => (
                <MenuItem key={s.id} value={s.id}>{s.company_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Estoque */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="stock-label">Estoque</InputLabel>
            <Select labelId="stock-label" value={stockId} onChange={(e) => setStockId(e.target.value)}>
              {stocks?.map((st: any) => (
                <MenuItem key={st.id} value={st.id}>{st.description}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Itens */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="product-label">Produto</InputLabel>
            <Select
              labelId="product-label"
              value={itemForm.product_id}
              onChange={(e) => setItemForm({ ...itemForm, product_id: e.target.value })}
            >
              {products?.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>{p.description}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            required
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Preço Unitário"
            type="number"
            fullWidth
            required
            value={itemForm.unit_price}
            onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
          />
          <Button sx={{ mt: 1 }} variant="outlined" onClick={handleAddItem}>
            Adicionar Item
          </Button>

          {/* Lista de itens adicionados */}
          {items.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Itens adicionados:</Typography>
              {items.map((i, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography>
                    {i.product_description} - Qtd: {i.quantity} - R${i.unit_price}
                  </Typography>
                  <IconButton color="error" onClick={() => handleRemoveItem(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
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
