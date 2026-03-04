import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export default function Reports() {

    const fetchStockReport = async () => {
        const { data } = await client.get("/reports/stock");
        return data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["stockReport"], // chave única para cache
        queryFn: fetchStockReport, // função que busca os dados
    });

    if (error) return <p>Erro: {(error as Error).message}</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (data){
        console.log(data)
    }

    return (
        <div>
            <h1>Relatório de Estoque</h1>
            <table>
                <thead>
                    <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Preço Unitário</th>
                    <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item: any) => (
                    <tr key={item.product_id}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit_price}</td>
                        <td>{item.total_value}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
