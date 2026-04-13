# Sistema-PDV_web

Sistema de ponto de venda front-end desenvolvido em React, TypeScript e Vite.

## Visão geral

Aplicação web para gerenciamento de vendas, compras, produtos e relatórios com autenticação via token.

## Tecnologias

- React 18
- TypeScript
- Vite
- Material UI
- React Router DOM
- React Query
- Axios
- MUI Data Grid
- ExcelJS
- Day.js

## Funcionalidades

- Autenticação de usuário via login
- Dashboard de indicadores
- Gestão de produtos (listagem, edição e criação)
- Gestão de compras e vendas
- Histórico de vendas
- Relatórios e dashboards
- Exportação de dados para Excel

## Requisitos

- Node.js 18 ou superior
- Backend API disponível em `http://127.0.0.1:8000`

> O cliente Axios está configurado em `src/api/client.ts` para usar essa URL e enviar o token JWT nos headers.

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

Abra o navegador em:

```text
http://localhost:5173
```

## Build e preview

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` — iniciar servidor de desenvolvimento
- `npm run build` — gerar bundle de produção
- `npm run preview` — pré-visualizar build de produção
- `npm run lint` — executar ESLint

## Estrutura relevante

- `src/App.tsx` — rotas da aplicação
- `src/pages/` — páginas do sistema
- `src/layout/BaseLayout.tsx` — layout principal
- `src/api/client.ts` — cliente para comunicação com a API
- `src/utils/exportProductsLabelExcel.ts` — exportação de etiquetas para Excel
- `src/components/PrivateRoute.tsx` — proteção de rotas autenticadas

## Observações

- A autenticação salva o token no `localStorage` e redireciona para `/dashboard`.
- Ajuste a URL do backend em `src/api/client.ts` caso o endpoint esteja em outro host ou porta.
