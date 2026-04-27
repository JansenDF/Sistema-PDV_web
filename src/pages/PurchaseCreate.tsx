import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

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

export default function PurchaseCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [stockId, setStockId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [itemForm, setItemForm] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
  });

  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });
  const { data: stocks } = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const addMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      navigate("/purchases");
    },
    onError: () => {
      setErrorMessage("Nao foi possivel salvar a compra.");
    },
  });

  const handleAddItem = () => {
    if (!supplierId || !stockId || !itemForm.product_id || !itemForm.quantity || !itemForm.unit_price) {
      setErrorMessage("Preencha fornecedor, estoque e todos os campos do item.");
      return;
    }
    const product = (products ?? []).find((p: any) => p.id === parseInt(itemForm.product_id));

    setItems([
      ...items,
      {
        product_id: parseInt(itemForm.product_id),
        product_description: product?.description ?? "",
        quantity: parseInt(itemForm.quantity),
        unit_price: parseFloat(itemForm.unit_price),
      },
    ]);
    setItemForm({ product_id: "", quantity: "", unit_price: "" });
    setErrorMessage("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    setErrorMessage("");
    if (!supplierId || !stockId || items.length === 0) {
      setErrorMessage("Selecione fornecedor, estoque e adicione ao menos um item.");
      return;
    }

    addMutation.mutate({
      supplier_id: parseInt(supplierId),
      stock_id: parseInt(stockId),
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    });
  };

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
              Nova Compra
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Cadastre uma nova entrada de produtos no estoque.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/purchases")}>
          Voltar
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, width: "100%" }}>
        <CardContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              mb: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="supplier-label">Fornecedor</InputLabel>
              <Select
                labelId="supplier-label"
                label="Fornecedor"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                {(suppliers ?? []).map((s: any) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="stock-label">Estoque</InputLabel>
              <Select
                labelId="stock-label"
                label="Estoque"
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
              >
                {(stocks ?? []).map((st: any) => (
                  <MenuItem key={st.id} value={String(st.id)}>
                    {st.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Adicionar item
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto" },
              alignItems: "end",
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="product-label">Produto</InputLabel>
              <Select
                labelId="product-label"
                label="Produto"
                value={itemForm.product_id}
                onChange={(e) => setItemForm({ ...itemForm, product_id: e.target.value })}
              >
                {(products ?? []).map((p: any) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantidade"
              type="number"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
              fullWidth
            />

            <TextField
              label="Preco Unitario"
              type="number"
              value={itemForm.unit_price}
              onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
              fullWidth
            />

            <Button variant="outlined" onClick={handleAddItem}>
              Adicionar
            </Button>
          </Box>

          {items.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                Itens adicionados - Total: R$ {items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0).toFixed(2).replace(".", ",")}
              </Typography>
              <Box
                sx={{
                  maxHeight: 320,
                  overflowY: "auto",
                  pr: 0.5,
                }}
              >
                {items.map((i, idx) => (
                  <Box
                    key={`${i.product_id}-${idx}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      px: 1.5,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {i.product_description} - Qtd: {i.quantity} - R$ {Number(i.unit_price).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <IconButton color="error" onClick={() => handleRemoveItem(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              position: "sticky",
              bottom: 0,
              bgcolor: "background.paper",
              pt: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              zIndex: 1,
            }}
          >
            <Button variant="outlined" onClick={() => navigate("/purchases")}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={addMutation.isPending}>
              Salvar compra
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
