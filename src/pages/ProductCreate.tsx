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
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const fetchSubCategories = async () => {
  const { data } = await client.get("/product_sub_categories");
  return data;
};

const fetchStocks = async () => {
  const { data } = await client.get("/stocks");
  return data;
};

const addProduct = async (newProduct: any) => {
  const { data } = await client.post("/products", newProduct);
  return data;
};

export default function ProductCreate() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    description: "",
    price: "",
    quantity: "",
    stock_id: "",
    product_sub_category_id: "",
  });

  const { data: stocks } = useQuery({
    queryKey: ["stocks"],
    queryFn: fetchStocks,
  });

  const { data: subCategories } = useQuery({
    queryKey: ["subCategories"],
    queryFn: fetchSubCategories,
  });

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      navigate("/products");
    },
    onError: () => {
      setErrorMessage("Nao foi possivel cadastrar o produto.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    setErrorMessage("");

    if (
      !form.description ||
      !form.price ||
      !form.quantity ||
      !form.stock_id ||
      !form.product_sub_category_id
    ) {
      setErrorMessage("Preencha todos os campos obrigatorios.");
      return;
    }

    addMutation.mutate({
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      stock_id: parseInt(form.stock_id),
      product_sub_category_id: parseInt(form.product_sub_category_id),
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
            <Inventory2Icon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Novo Produto
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Cadastre um novo produto com categoria, estoque e quantidade inicial.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/products")}>
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
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
              alignItems: "start",
            }}
          >
            <TextField
              label="Descricao"
              name="description"
              fullWidth
              value={form.description}
              onChange={handleChange}
            />

            <TextField
              label="Preco"
              name="price"
              type="number"
              fullWidth
              value={form.price}
              onChange={handleChange}
            />

            <TextField
              label="Quantidade inicial"
              name="quantity"
              type="number"
              fullWidth
              value={form.quantity}
              onChange={handleChange}
            />

            <FormControl fullWidth>
              <InputLabel id="subcat-label">Subcategoria</InputLabel>
              <Select
                labelId="subcat-label"
                label="Subcategoria"
                value={form.product_sub_category_id}
                onChange={(e) =>
                  handleSelectChange("product_sub_category_id", e.target.value)
                }
              >
                {(subCategories ?? []).map((sub: any) => (
                  <MenuItem key={sub.id} value={String(sub.id)}>
                    {sub.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="stock-label">Estoque</InputLabel>
              <Select
                labelId="stock-label"
                label="Estoque"
                value={form.stock_id}
                onChange={(e) => handleSelectChange("stock_id", e.target.value)}
              >
                {(stocks ?? []).map((stock: any) => (
                  <MenuItem key={stock.id} value={String(stock.id)}>
                    {stock.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 2, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => navigate("/products")}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={addMutation.isPending}
            >
              Salvar produto
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
