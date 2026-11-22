# Sistema de Aluguel de Veículos (`LocadoraVeiculos`)

Projeto full-stack desenvolvido para a disciplina **Tecnologias para Análise e Desenvolvimento de Sistemas**, integrando o **Back-end RESTful (Trabalho Prático 1)** com o **Front-end Web (Trabalho Prático 2)**.

---

## Estrutura do Repositório

```text
├── LocadoraVeiculos.API/       # Back-end ASP.NET Core (.NET 9) + EF Core + SQL Server
├── LocadoraVeiculos.Web/       # Front-end React + Vite + TypeScript + Tailwind CSS + Recharts
├── Docs/
│   ├── WIREFRAMES_GUIA.md      # Especificação de Design System e telas para Figma
│   ├── wireframe_prototipo.html# Protótipo navegável local (tons de cinza e colorido)
│   ├── artigo_sbc.tex          # Artigo científico pronto no template SBC (Overleaf/LaTeX)
│   └── ROTEIRO_PITCH.md        # Roteiro cronometrado do vídeo pitch (3 a 5 min)
├── Prints/                     # Evidências do Swagger (Trabalho Prático 1)
├── DOCUMENTACAO_APIS.md        # Especificação detalhada das rotas e modelo ER
└── LocadoraVeiculos.sln
```

---

## Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/)
- Microsoft SQL Server Express ou LocalDB (`(localdb)\mssqllocaldb`)
- [Node.js 20+](https://nodejs.org/) e npm

---

## Como Executar o Projeto

### 1. Iniciar o Back-end (`LocadoraVeiculos.API`)

Na raiz do repositório:

```powershell
dotnet run --project LocadoraVeiculos.API
```

- A API inicia em **`http://localhost:5205`** (Swagger UI disponível na raiz).
- As migrations do Entity Framework Core e o *Seed Data* de Fabricantes e Categorias são aplicados automaticamente ao iniciar.

### 2. Iniciar o Front-end (`LocadoraVeiculos.Web`)

Em outro terminal:

```powershell
cd LocadoraVeiculos.Web
npm install
npm run dev
```

- A aplicação web ficará disponível em **`http://localhost:5173`**.
- Por padrão, o front-end consome `http://localhost:5205/api` (personalizável via variável `VITE_API_URL`).

---

## Funcionalidades Implementadas no Front-end

- **Dashboard:** KPIs em tempo real (frota total, disponíveis, locações ativas, clientes e faturamento) + gráficos de Faturamento por Categoria e Desempenho por Fabricante.
- **CRUD Completo + Filtros Personalizados ($\ge$ 2 campos por entidade):**
  - **Fabricantes:** filtros por *Nome* e *País de Origem*.
  - **Categorias:** filtros por *Nome/Descrição*, *Diária Mínima* e *Diária Máxima*.
  - **Veículos:** filtros por *Modelo*, *Placa*, *Fabricante*, *Categoria*, *Disponibilidade* + atalho *Apenas Disponíveis* (`/api/veiculos/disponiveis`).
  - **Clientes:** filtros por *Nome*, *CPF* e *E-mail* + modal de *Histórico de Locações* (`/api/alugueis/cliente/{clienteId}`).
  - **Aluguéis:** filtros por *Cliente*, *Modelo*, *Fabricante*, *Status* e *Período* + *Nova Locação*, *Registrar Devolução* (cálculo automático e liberação do veículo) e *Cancelamento*.
- **Central de Consultas & JOINs (`/consultas`):** Interface interativa para todas as 5 rotas analíticas de `/api/consultas/*` (`INNER JOIN` e `LEFT OUTER JOIN`), exibindo rota HTTP, tipo de junção SQL, filtros dinâmicos, gráficos e tabelas.
