import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <AssessmentIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Relatorios
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Escolha o tipo de relatorio que deseja consultar.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Box>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ReceiptLongIcon color="primary" />
                <Typography variant="h6">Mais vendidos</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Visualize rapidamente as vendas recentes para acompanhar o
                movimento atual do caixa.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/solds");
                }}
              >
                Acessar
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">Historico de Vendas</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Consulte o historico completo de vendas para analises e
                conferencias detalhadas.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/sales_history");
                }}
              >
                Acessar
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
