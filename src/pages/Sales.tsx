import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Chip, Alert, Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { Autocomplete } from "@mui/material";
import { ptBR } from "@mui/x-data-grid/locales"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import client from "../api/client";

const fetchProducts = async () => {
  const { data } = await client.get("/products/");
  return data;
};

const fetchClients = async () => {
  const { data } = await client.get("/clients/");
  return data;
};

const addSale = async (newSale: any) => {
  console.log("salesss", newSale)
  const { data } = await client.post("/sales/", newSale);
  return data;
};


export default function Sales() {
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const {
    data: clients,
    isLoading: loadingClients,
    error: errorClients,
  } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });

  const saleMutation = useMutation({
    mutationFn: addSale,
    onSuccess: () => {
      alert("Venda registrada com sucesso!");
      setCart([]);
      setReceived("");
      setClientId("");
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          alert(error.response.data.detail || "Estoque insuficiente para um dos itens.");
        } else {
          alert("Erro inesperado ao registrar venda.");
        }
      }
    },
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const operatorId = user.id;
  const [clientId, setClientId] = useState("");

  const [cart, setCart] = useState<any[]>([]);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [received, setReceived] = useState("");
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmSale, setConfirmSale] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleAddItem();
      if (e.key === "F10") handleFinishSale();
      if (e.key === "Escape") setConfirmExit(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, product, quantity, unitPrice, clientId]);

  // // Confirmação ao sair
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     if (cart.length > 0) {
  //       e.preventDefault();
  //       e.returnValue = "";
  //     }
  //   };
  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // }, [cart]);

  const handleAddItem = () => {
    if (!product || !quantity || !unitPrice) {
      alert("Preencha todos os campos!");
      return;
    }
    setCart([
      ...cart,
      {
        id: cart.length + 1,
        code: product.barcode ?? product.id,
        description: product.description,
        quantity: parseFloat(quantity),
        stock: parseInt(product.quantity),
        unit_price: parseFloat(unitPrice),
        total: parseFloat(quantity) * parseFloat(unitPrice),
      },
    ]);
    setProduct(null);
    setQuantity("");
    setUnitPrice("");
  };

  const handleRemoveItem = (id: number) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const handleOpenConfirmSale = () => {
    if (!operatorId || !clientId || cart.length === 0) {
      alert("Preencha cliente e adicione itens!");
      return;
    }
    setConfirmSale(true);
  };


  const handleFinishSale = () => {
    if (!operatorId || !clientId || cart.length === 0) {
      alert("Preencha operador, cliente e adicione itens!");
      return;
    }

    saleMutation.mutate({
      operator_id: parseInt(operatorId),
      client_id: parseInt(clientId),
      date: date.format('YYYY-MM-DD'),
      items: cart.map((i) => ({
        product_id: i.code,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  };

  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const troco = received ? parseFloat(received) - subtotal : 0;
  const hasLoadError = Boolean(errorProducts || errorClients);
  const isLoadingData = loadingProducts || loadingClients;

  const columns: GridColDef[] = [
    { field: "id", headerName: "Nº", width: 60 },
    { field: "code", headerName: "Código", width: 150 },
    { field: "description", headerName: "Descrição", flex: 1 },
    { field: "quantity", headerName: "Qtd", width: 100 },
    { field: "stock", headerName: "Estoque", width: 100 },
    { field: "unit_price", headerName: "Unitário", width: 120 },
    { field: "total", headerName: "Total", width: 120 },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleRemoveItem(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ px: 3, pt: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            mb: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <PointOfSaleIcon color="primary" />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Caixa
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Registre itens, confirme o pagamento e finalize a venda.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`Itens: ${cart.length}`} size="small" color="primary" variant="outlined" />
            <Chip
              label={`Subtotal: R$ ${subtotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmSale} onClose={() => setConfirmSale(false)}>
        <DialogTitle textAlign={"center"}>Confirmar Venda</DialogTitle>
        <DialogContent>
          <Typography>Total de produtos: {cart.length}</Typography>
          <Typography>Subtotal: R${subtotal.toFixed(2)}</Typography>
          <Typography>Valor Recebido: R${received}</Typography>
          <Typography>Troco: R${troco.toFixed(2)}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setConfirmSale(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setConfirmSale(false);
              saleMutation.mutate({
                operator_id: parseInt(operatorId),
                client_id: parseInt(clientId),
                date: date.format('YYYY-MM-DD'),
                items: cart.map((i) => ({
                  product_id: i.code,
                  quantity: i.quantity,
                  unit_price: i.unit_price,
                })),
              });
            }}
            color="primary"
            variant="contained"
          >
            Confirmar Venda
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle textAlign={"center"} alignItems={"center"}>Confirmar saída</DialogTitle>
        <DialogContent>
          <Typography>A venda atual será perdida.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setConfirmExit(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              setConfirmExit(false);
              window.location.href = "/dashboard"; // ou use navigate("/dashboard") se estiver usando react-router
            }}
            color="error"
            variant="contained"
          >
            Sair
          </Button>
        </DialogActions>
      </Dialog>
      {hasLoadError ? (
        <Box sx={{ px: 3 }}>
          <Alert severity="error">Erro ao carregar produtos ou clientes.</Alert>
        </Box>
      ) : isLoadingData ? (
        <Box sx={{ p: 3 }}>
          <Skeleton height={320} />
          <Skeleton height={56} sx={{ mt: 1 }} />
        </Box>
      ) : (
      <Box sx={{ display: "flex", gap: 3, p: 3, flexDirection: { xs: "column", md: "row" } }}>
        {/* Coluna esquerda - lista de produtos */}
        <Card sx={{ flex: 2, borderRadius: 2 }}>
          <CardContent>
          <Typography variant="h6" gutterBottom>Itens da Venda</Typography>
          <DataGrid
            rows={cart}
            columns={columns}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            autoHeight={false}
            sx={{ height: 400 }}
            hideFooter
          />
          </CardContent>
        </Card>

        {/* Coluna direita - inputs */}
        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent>
          <Typography variant="h6" gutterBottom>Dados da Venda</Typography>

          {/* Cliente */}
          <Autocomplete
            options={clients ?? []}
            getOptionLabel={(option: any) => option.name}
            value={clients?.find((c: any) => c.id === parseInt(clientId)) || null}
            onChange={(_, newValue) => setClientId(newValue?.id?.toString() || "")}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" margin="dense" fullWidth required />
            )}
          />

          {/* Data */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Data"
              value={date}
              onChange={(newValue) => setDate(newValue || dayjs())}
              slotProps={{
                textField: {
                  margin: 'dense',
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          {/* Produto */}
          <Autocomplete
            options={products ?? []}
            getOptionLabel={(option: any) => option.description}
            value={product}
            onChange={(_, newValue) => {
              setProduct(newValue);
              setUnitPrice(newValue?.price?.toString() || "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Produto" margin="dense" fullWidth required />
            )}
          />

          {/* Quantidade */}
          <TextField
            label="Quantidade"
            type="number"
            margin="dense"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {/* Preço Unitário */}
          <TextField
            label="Preço Unitário"
            type="number"
            margin="dense"
            fullWidth
            value={unitPrice}
            disabled
            onChange={(e) => setUnitPrice(e.target.value)}
          />

          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddItem}>
            Adicionar Item
          </Button>
          </CardContent>
        </Card>
      </Box>
      )}
      {/* Rodapé - subtotal e finalizar */}
      <Card sx={{ mt: 3, mx: 3, mb: 3, borderRadius: 2 }}>
        <CardContent>
        <Typography variant="h6">Subtotal: R${subtotal.toFixed(2)}</Typography>
        <TextField
          label="Valor Recebido"
          type="number"
          margin="dense"
          fullWidth
          value={received}
          onChange={(e) => setReceived(e.target.value)}
        />
        <Typography variant="h6">Troco: R${troco.toFixed(2)}</Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={cart.length === 0}
          onClick={handleOpenConfirmSale}
          fullWidth
        >
          Finalizar Venda
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => setConfirmExit(true)}
          fullWidth
        >
          Sair
        </Button>
        </CardContent>
      </Card>
    </>
  );
}
