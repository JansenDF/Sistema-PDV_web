import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography
} from "@mui/material"
import client from "../api/client";

export default function Solds() {
    
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
            <Typography variant="h5" gutterBottom>Últimas vendas</Typography>
            <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel sx={{backgroundColor: "white", paddingX: 1}}>Período</InputLabel>
                <Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    <MenuItem value={7}>Últimos 7 dias</MenuItem>
                    <MenuItem value={15}>Últimos 15 dias</MenuItem>
                    <MenuItem value={30}>Últimos 30 dias</MenuItem>
                </Select>
            </FormControl>
            <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Quantidade Vendida</TableCell>
                    <TableCell>Valor Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {soldProducts?.map((p: any) => (
                    <TableRow key={p.id}>
                        <TableCell>{p.description.toUpperCase()}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>R$ {p.total_value.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}
