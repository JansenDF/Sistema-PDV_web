import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Typography,
    Button
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom";

import client from "../api/client";

export default function Reports() {
    
    const navigate = useNavigate();
    
    const fetchSoldProducts = async (days: number) => {
        const { data } = await client.get(`/reports/sold-products?days=${days}`);
        return data;
    };
    
    const [days, setDays] = useState(7);

    const { data: soldProducts, isLoading, error } = useQuery({
    queryKey: ["soldProducts", days],
    queryFn: () => fetchSoldProducts(days),
    });

    if (error) return <p>Erro: {(error as Error).message}</p>;
    if (isLoading) return <p>Carregando...</p>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Relatórios</Typography>
            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={() => {
                    navigate("/solds")
                }}
            >
                Últimas Vendas
            </Button>
        </Box>
    );
}
