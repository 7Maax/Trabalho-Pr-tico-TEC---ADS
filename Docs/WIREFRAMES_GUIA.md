# Guia de Wireframes — Sistema de Aluguel de Veículos (`LocadoraVeiculos`)

Este documento serve como guia completo para montagem e compartilhamento dos **wireframes de média/alta fidelidade** no **Figma** (ou ferramenta equivalente com link público compartilhável), cumprindo o requisito do Trabalho Prático 2.

> **Link público do Figma:** `[INSIRA AQUI O LINK PÚBLICO DO SEU PROJETO NO FIGMA APÓS IMPORTAR/MONTAR]`
> **Protótipo navegável local de referência:** abra `Docs/wireframe_prototipo.html` no navegador para visualizar todas as 7 telas em modo wireframe e usar como referência fiel no Figma.

---

## 1. Sistema de Design (Design System)

### 1.1 Dimensões e Grid (Frames no Figma)
- **Desktop Frame:** `1440 x 900 px` (Layout Grid: 12 colunas, margem `24 px`, gutter `20 px`)
- **Sidebar fixa à esquerda:** `260 px` de largura
- **Área de conteúdo principal:** `1180 px` (Topbar `64 px` + área de trabalho com padding `24 px`)
- **Modais de CRUD:** Largura `520 px` a `640 px`, centralizado com backdrop `rgba(15, 23, 42, 0.55)`

### 1.2 Paleta de Cores (Alta Fidelidade)
| Papel | Hex | Uso |
| :--- | :--- | :--- |
| Primária (Brand) | `#2563EB` | Botões principais, item ativo na sidebar, destaques |
| Primária Hover | `#1D4ED8` | Estado hover de CTAs |
| Fundo Principal | `#F8FAFC` | Background da área de trabalho |
| Superfície (Card) | `#FFFFFF` | Cards, tabelas, modais, barra de filtros |
| Sidebar | `#0F172A` | Navegação lateral escura |
| Texto Principal | `#0F172A` | Títulos e valores numéricos |
| Texto Secundário | `#64748B` | Labels, subtítulos, metadados |
| Borda | `#E2E8F0` | Divisórias, inputs, linhas de tabela |
| Sucesso (Disponível / Concluído) | `#10B981` | Badges positivos e confirmações |
| Alerta (Ativo / Em Locação) | `#F59E0B` | Badges de locação em andamento |
| Perigo (Indisponível / Cancelado / Erro) | `#EF4444` | Exclusões, cancelamentos e alertas de erro |

### 1.3 Tipografia
- **Fonte:** `Inter` (disponível nativamente no Figma e Google Fonts)
- **Título da Página (H1):** `24 px` Bold (`#0F172A`)
- **Título de Card/Seção (H2):** `16 px` SemiBold (`#0F172A`)
- **Texto / Células de Tabela:** `14 px` Regular (`#334155`)
- **Labels / Badges / Legendas:** `12 px` Medium (`#64748B`)

---

## 2. Especificação das 7 Telas do Wireframe

### Tela 1 — Dashboard (Visão Geral)
- **Header:** Título "Visão Geral da Locadora", subtítulo e botão CTA rápido `+ Novo Aluguel`.
- **Linha de KPIs (4 cards):**
  1. Frota Total (com quantidade disponível)
  2. Aluguéis Ativos
  3. Clientes Cadastrados
  4. Faturamento Total Consolidado (R$)
- **Grade de Gráficos (2 colunas):**
  - *Esquerda:* Gráfico de Barras — **Faturamento por Categoria** (`GET /api/consultas/faturamento-por-categoria`)
  - *Direita:* Gráfico Horizontal / Ranking — **Desempenho por Fabricante** (`GET /api/consultas/fabricantes-desempenho`)
- **Tabela Resumida Inferior:** Últimos Aluguéis Ativos com acesso rápido para registrar devolução.

### Tela 2 — Gestão de Fabricantes
- **Header:** Título "Fabricantes" + botão `+ Novo Fabricante`.
- **Barra de Filtros (2 campos):**
  - Input texto: **Nome do Fabricante**
  - Input texto: **País de Origem**
  - Botões: `Filtrar` e `Limpar`
- **Tabela Principal:** Colunas `ID`, `Nome`, `País de Origem`, `Veículos`, `Locações`, `Receita Gerada`, `Ações (Editar / Excluir)`.
- **Modal Criar/Editar Fabricante:** Campos `Nome*` e `País de Origem`.

### Tela 3 — Gestão de Categorias
- **Header:** Título "Categorias" + botão `+ Nova Categoria`.
- **Barra de Filtros (3 campos):**
  - Input texto: **Nome ou Descrição**
  - Input numérico: **Diária Mínima (R$)**
  - Input numérico: **Diária Máxima (R$)**
- **Grade de Cards / Tabela:** Nome da categoria, descrição, badge com **Valor da Diária (R$)** e ações `Editar` / `Excluir`.
- **Modal Criar/Editar Categoria:** Campos `Nome*`, `Descrição`, `Valor da Diária (R$)*`.

### Tela 4 — Gestão de Veículos
- **Header:** Título "Frota de Veículos" + botão `+ Novo Veículo`.
- **Barra de Filtros (5 campos):**
  - Input texto: **Modelo**
  - Input texto: **Placa**
  - Select: **Fabricante**
  - Select: **Categoria**
  - Select/Toggle: **Disponibilidade** (`Todos`, `Apenas Disponíveis`, `Alugados`)
- **Tabela de Veículos:** `Modelo / Ano`, `Placa`, `Cor`, `Fabricante`, `Categoria`, `Quilometragem`, `Diária`, `Badge Status (Disponível / Alugado)`, `Ações (Editar / Excluir)`.
- **Modal Criar/Editar Veículo:** `Modelo*`, `Ano de Fabricação*`, `Placa*`, `Cor`, `Quilometragem`, `Fabricante*` (select), `Categoria*` (select).

### Tela 5 — Gestão de Clientes
- **Header:** Título "Clientes" + botão `+ Novo Cliente`.
- **Barra de Filtros (3 campos):**
  - Input texto: **Nome**
  - Input texto: **CPF**
  - Input texto: **E-mail**
- **Tabela de Clientes:** `Nome`, `CPF`, `E-mail`, `Telefone`, `CNH`, `Data Nasc.`, `Ações (Histórico / Editar / Excluir)`.
- **Modal Criar/Editar Cliente:** `Nome*`, `CPF*`, `E-mail*`, `Telefone`, `CNH`, `Data de Nascimento`.
- **Modal Histórico do Cliente:** Consome `GET /api/alugueis/cliente/{clienteId}` listando todas as locações, status e valores pagos.

### Tela 6 — Gestão de Aluguéis
- **Header:** Título "Gestão de Aluguéis" + botão `+ Nova Locação`.
- **Barra de Filtros (6 campos — rota `GET /api/consultas/alugueis-detalhados`):**
  - `Cliente` (nome)
  - `Modelo do Veículo`
  - `Fabricante`
  - `Status` (`Todos`, `Ativo`, `Concluido`, `Cancelado`)
  - `Data Início` (date)
  - `Data Fim` (date)
- **Tabela Detalhada (INNER JOIN de 5 tabelas):** `ID`, `Cliente (Nome/CPF)`, `Veículo (Modelo/Placa/Marca/Categoria)`, `Período`, `KM Inicial → Final`, `Diária / Total`, `Status`, `Ações (Devolver / Cancelar — quando Ativo)`.
- **Modal Nova Locação (`POST /api/alugueis`):** Select `Cliente*`, Select `Veículo Disponível*` (`GET /api/veiculos/disponiveis`), `Data Início*`, `Data Fim Prevista*`, prévia automática de valor estimado.
- **Modal Registrar Devolução (`PUT /api/alugueis/{id}/devolver`):** Resumo do contrato, `Data de Devolução*`, `Quilometragem Final*` (mínimo = KM inicial) e cálculo estimado do valor total.

### Tela 7 — Central de Consultas e Relatórios (`/api/consultas`)
- **Abas Interativas (5 consultas SQL com INNER/LEFT JOIN):**
  1. **Aluguéis Detalhados** (INNER JOIN 5 tabelas)
  2. **Faturamento por Categoria** (INNER JOIN + Agregação + Gráfico de Barras)
  3. **Resumo de Clientes** (LEFT OUTER JOIN — filtro "Apenas sem aluguel" + busca por Nome/CPF/E-mail)
  4. **Utilização de Veículos** (INNER + LEFT JOIN — filtros por Categoria, Fabricante, Disponibilidade e "Nunca Alugados")
  5. **Desempenho por Fabricante** (Múltiplo LEFT JOIN — filtros por País de Origem e Nome + Gráfico)
- **Badge técnico em cada aba:** Exibe a rota HTTP exata e o tipo de JOIN executado no banco de dados (ideal para demonstração no vídeo Pitch!).

---

## 3. Como montar rapidamente no Figma (Passo a Passo)
1. Acesse [figma.com](https://www.figma.com), crie um novo **Design File** chamado `LocadoraVeiculos - Wireframes TP2`.
2. Crie 7 frames Desktop (`1440 x 900`) nomeados de `01 - Dashboard` até `07 - Consultas e Relatorios`, além de um frame `08 - Modais CRUD`.
3. Crie um componente reutilizável para a **Sidebar** (`260 x 900`) e outro para a **Barra de Filtros** e **Tabela**, usando o protótipo `Docs/wireframe_prototipo.html` como referência visual direta.
4. Conecte os botões do menu lateral no modo **Prototype** do Figma.
5. Clique em **Share** → altere para **Anyone with the link can view** → copie o link e cole na seção de Wireframes do artigo SBC (`Docs/artigo_sbc.tex`) e neste documento.
