# Roteiro de Apresentação em Vídeo (Pitch — 3 a 5 minutos)
## Sistema de Aluguel de Veículos (`LocadoraVeiculos`)

> **Regras da disciplina:**
> - Duração obrigatória: **entre 3 e 5 minutos** (meta ideal: **4 minutos cravados**).
> - Foco estrito em: **o problema**, **a modelagem adotada** e **pelo menos dois exemplos de consultas (banco + rota) e seus resultados no front-end**.
> - Formato **Pitch de Startup** (claro, objetivo, despertando interesse de clientes/investidores).
> - **Não exibir conteúdo de terceiros** sem devida referência.

---

## Preparação Antes de Gravar (Checklist)
1. Subir o back-end:
   ```powershell
   dotnet run --project LocadoraVeiculos.API
   ```
2. Subir o front-end:
   ```powershell
   cd LocadoraVeiculos.Web
   npm run dev
   ```
3. Garantir que existam no banco (SQL Server) pelo menos:
   - Os 5 fabricantes e 5 categorias do Seed Data;
   - 3 a 4 veículos cadastrados (incluindo pelo menos 1 alugado e 2 disponíveis);
   - 2 a 3 clientes (incluindo pelo menos 1 cliente **sem** locação para brilhar no `LEFT JOIN`!);
   - Pelo menos 2 aluguéis concluídos (em categorias diferentes) e 1 aluguel ativo.
4. Deixar abertas 3 abas no navegador (em tela limpa, sem barra de favoritos poluída):
   - Aba 1: `http://localhost:5173` (Front-end — Dashboard)
   - Aba 2: `http://localhost:5173/consultas` (Central de Consultas & JOINs)
   - Aba 3: `http://localhost:5205` (Swagger ou diagrama ER em `DOCUMENTACAO_APIS.md`)

---

## Roteiro Cronometrado (Meta: 4min00s)

### [0:00 – 0:45] Bloco 1 — O Problema & Proposta de Valor (45s)
- **Tela:** Dashboard do `LocadoraVeiculos` (`http://localhost:5173`).
- **Fala sugerida:**
  > "Olá! Imagine gerenciar uma locadora de veículos onde o atendente não sabe em tempo real quais carros estão livres, o cálculo de devolução é feito manualmente e o gestor não consegue enxergar qual categoria realmente dá lucro.
  > Para resolver esse problema, desenvolvi o **LocadoraVeiculos**, um sistema web completo que integra gestão de frota, carteira de clientes, controle automatizado de contratos e inteligência financeira em tempo real — tudo conectado diretamente a uma API RESTful e a um banco de dados relacional SQL Server, sem nenhum dado estático ou mocado."

### [0:45 – 1:30] Bloco 2 — A Modelagem Adotada (45s)
- **Tela:** Diagrama ER (em `DOCUMENTACAO_APIS.md`) e rápida passagem pela barra lateral das 5 entidades no front-end.
- **Fala sugerida:**
  > "A base do sistema foi modelada com cinco entidades normalizadas no SQL Server via Entity Framework Core: **Fabricantes**, **Categorias**, **Veículos**, **Clientes** e **Aluguéis**.
  > Cada veículo pertence a um fabricante e a uma categoria tarifária, e cada aluguel conecta um cliente a um veículo, com chaves estrangeiras protegidas por integridade referencial (`OnDelete: Restrict`) e índices únicos para CPF, e-mail e placa.
  > No front-end em React, TypeScript e Tailwind CSS, desenhado a partir de wireframes dedicados, implementei todos os CRUDs e filtros personalizados em múltiplos campos para cada entidade, consumindo as rotas criadas na API ASP.NET Core."

### [1:30 – 2:30] Bloco 3 — Exemplo de Consulta 1: `INNER JOIN` em 5 Tabelas (60s)
- **Tela:** Ir para **Consultas & JOINs → Aba 1 (Aluguéis Detalhados)** (`http://localhost:5173/consultas`).
- **Ação ao vivo:** Mostrar o selo da rota `GET /api/consultas/alugueis-detalhados`, digitar um filtro (ex.: Status = `Concluido` ou nome de um cliente/fabricante) e clicar em **Consultar**.
- **Fala sugerida:**
  > "Vou demonstrar dois exemplos práticos de como as consultas do banco alimentam o front-end.
  > O primeiro é a consulta de **Aluguéis Detalhados**, exposta na rota `GET /api/consultas/alugueis-detalhados`. No banco de dados, ela executa um **INNER JOIN conectando as cinco tabelas** — `Alugueis`, `Clientes`, `Veiculos`, `Fabricantes` e `Categorias`.
  > Quando aplico aqui na tela o filtro por status e fabricante, o front-end envia os parâmetros na query string para a API, o SQL Server processa a junção e devolve instantaneamente a visão consolidada do contrato: cliente, placa, marca, categoria, período e valor total."

### [2:30 – 3:30] Bloco 4 — Exemplo de Consulta 2: `LEFT OUTER JOIN` e Agregação Financeira (60s)
- **Tela:** Alternar para **Aba 2 (Faturamento / Categoria)** e em seguida **Aba 3 (Resumo de Clientes)**.
- **Ação ao vivo:**
  1. Na Aba 2, mostrar o gráfico de barras e tabela da rota `GET /api/consultas/faturamento-por-categoria` (INNER JOIN + `GroupBy`/`Sum` com faturamento total e ticket médio).
  2. Na Aba 3 (`GET /api/consultas/clientes-resumo-locacoes`), selecionar o filtro **"Apenas clientes sem locações"** e clicar em **Consultar**.
- **Fala sugerida:**
  > "O segundo exemplo traz inteligência gerencial. Na rota `GET /api/consultas/faturamento-por-categoria`, um `INNER JOIN` com agregação calcula no banco o total de locações, a receita e o ticket médio por categoria, renderizados aqui em gráfico e tabela.
  > Já na rota `GET /api/consultas/clientes-resumo-locacoes`, utilizamos um **LEFT OUTER JOIN** entre `Clientes` e `Alugueis`. Isso permite filtrar clientes que estão cadastrados mas nunca alugaram um veículo — um dado estratégico para campanhas de ativação comercial, impossível de obter com um `INNER JOIN` comum."

### [3:30 – 4:10] Bloco 5 — Fechamento (Pitch) (40s)
- **Tela:** Voltar rapidamente ao **Dashboard** (`http://localhost:5173`).
- **Fala sugerida:**
  > "Com essa arquitetura full-stack, o **LocadoraVeiculos** garante consistência transacional — bloqueando veículos ao alugar, recalculando quilometragem e valor total na devolução — e transforma dados relacionais em decisões rápidas para a operação da locadora.
  > O código-fonte completo, os wireframes e a documentação técnica no padrão SBC estão disponíveis no repositório do projeto. Muito obrigado!"
