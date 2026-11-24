# Sistema de Aluguel de Veículos (LocadoraVeiculos)

Sistema desenvolvido para a disciplina **Tecnologias para Análise e Desenvolvimento de Sistemas**, integrando a API RESTful do Trabalho Prático 1 com o front-end web do Trabalho Prático 2.

## Estrutura do Projeto

```text
├── LocadoraVeiculos.API/       # Back-end ASP.NET Core (.NET 9) + EF Core + SQL Server
├── LocadoraVeiculos.Web/       # Front-end React + Vite + TypeScript + Tailwind CSS
├── Docs/
│   ├── WIREFRAMES_GUIA.md      # Especificação das telas para o Figma
│   ├── wireframe_prototipo.html# Protótipo navegável local
│   ├── artigo_sbc.tex          # Artigo no modelo SBC (LaTeX/Overleaf)
│   └── ROTEIRO_PITCH.md        # Roteiro do vídeo de apresentação
├── Prints/                     # Capturas de tela da Etapa 1
├── DOCUMENTACAO_APIS.md        # Documentação das rotas e diagrama ER
└── LocadoraVeiculos.sln
```

## Requisitos

- .NET 9 SDK
- SQL Server Express ou LocalDB (`(localdb)\mssqllocaldb`)
- Node.js 20+ e npm

## Execução Local

### 1. Back-end (`LocadoraVeiculos.API`)

Na raiz do projeto:

```powershell
dotnet run --project LocadoraVeiculos.API
```

A API será iniciada em `http://localhost:5205` (com Swagger na raiz) e aplicará automaticamente as migrations e os dados iniciais de Fabricantes e Categorias.

### 2. Front-end (`LocadoraVeiculos.Web`)

Em outro terminal:

```powershell
cd LocadoraVeiculos.Web
npm install
npm run dev
```

A interface ficará disponível em `http://localhost:5173`, consumindo `http://localhost:5205/api` (ou a URL definida em `VITE_API_URL`).

## Funcionalidades do Front-end

- **Dashboard:** resumo de veículos, locações ativas, clientes, faturamento concluído e gráficos por categoria e fabricante.
- **Fabricantes:** cadastro, edição, exclusão e filtros por nome e país de origem.
- **Categorias:** cadastro, edição, exclusão e filtros por nome/descrição e faixa de valor da diária.
- **Veículos:** cadastro, edição, exclusão, atalho para disponíveis e filtros por modelo, placa, fabricante, categoria e disponibilidade.
- **Clientes:** cadastro, edição, exclusão, filtros por nome, CPF e e-mail e consulta de histórico de locações.
- **Aluguéis:** filtros combinados (cliente, modelo, fabricante, status e datas), abertura de locação, registro de devolução e cancelamento.
- **Consultas:** visualização tabular e gráfica das cinco rotas de `/api/consultas` com `INNER JOIN` e `LEFT OUTER JOIN`.
