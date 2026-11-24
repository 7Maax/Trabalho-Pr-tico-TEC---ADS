# Guia de Wireframes - LocadoraVeiculos

Especificação visual das telas para montagem e compartilhamento dos wireframes de média/alta fidelidade no Figma.

- Link do Figma: `[adicionar link público do Figma]`
- Protótipo HTML local para referência: `Docs/wireframe_prototipo.html`

## 1. Padrão Visual

### Layout e Medidas (Desktop)
- Frame Desktop: `1440 x 900 px` (grid de 12 colunas, margem `24 px`, gutter `20 px`)
- Menu lateral esquerdo: `260 px`
- Área de conteúdo: `1180 px` com padding interno de `24 px`
- Modais de cadastro e edição: largura entre `520 px` e `640 px`

### Cores
| Uso | Hex |
| :--- | :--- |
| Cor principal (botões e item ativo) | `#2563EB` |
| Hover principal | `#1D4ED8` |
| Fundo da página | `#F8FAFC` |
| Fundo de cards, tabelas e modais | `#FFFFFF` |
| Menu lateral | `#0F172A` |
| Texto principal | `#0F172A` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |
| Status positivo (Disponível / Concluído) | `#10B981` |
| Status ativo (Em locação) | `#F59E0B` |
| Status de alerta/erro (Cancelado / Excluir) | `#EF4444` |

### Tipografia
- Fonte: `Inter`
- Título principal (H1): `24 px` Bold
- Subtítulos e títulos de card (H2): `16 px` SemiBold
- Texto padrão e tabelas: `14 px` Regular
- Labels e badges: `12 px` Medium

## 2. Telas Previstas

### 1. Dashboard (Visão Geral)
- Cabeçalho com título, botão de atualizar e atalho para nova locação.
- 4 cards de resumo: Frota de Veículos (com quantidade disponível), Locações Ativas, Clientes Cadastrados e Faturamento Concluído.
- 2 gráficos lado a lado: Faturamento por Categoria e Receita por Fabricante.
- Tabela com os aluguéis ativos no momento.

### 2. Fabricantes
- Filtros: Nome do Fabricante e País de Origem.
- Tabela com ID, Nome, País de Origem e botões de Editar e Excluir.
- Modal para cadastro e edição (Nome e País de Origem).

### 3. Categorias
- Filtros: Nome/Descrição, Diária Mínima e Diária Máxima.
- Tabela com ID, Nome, Descrição, Valor da Diária e ações de Editar e Excluir.
- Modal para cadastro e edição (Nome, Descrição e Valor da Diária).

### 4. Veículos
- Filtros: Modelo, Placa, Fabricante, Categoria e Disponibilidade, além de atalho para listar apenas disponíveis.
- Tabela com Modelo/Ano/Cor, Placa, Fabricante, Categoria, Quilometragem, Diária, Status e ações.
- Modal para cadastro e edição com selects de Fabricante e Categoria.

### 5. Clientes
- Filtros: Nome, CPF e E-mail.
- Tabela com Nome, CPF, E-mail, Telefone, CNH, Data de Nascimento e ações (Histórico, Editar e Excluir).
- Modal de cadastro/edição e modal de histórico de locações do cliente.

### 6. Aluguéis
- Filtros: Cliente, Modelo, Fabricante, Status, Data Início e Data Fim.
- Tabela com dados consolidados do contrato (cliente, veículo, datas, quilometragem, valores, status e ações).
- Modal de Nova Locação (listando apenas veículos disponíveis).
- Modal de Registrar Devolução (data de devolução e quilometragem final).
- Ação para cancelar locação ativa.

### 7. Consultas e Relatórios
- 5 abas correspondentes às consultas de `/api/consultas`:
  1. Aluguéis Detalhados (INNER JOIN em 5 tabelas)
  2. Faturamento por Categoria (INNER JOIN com agrupamento e gráfico)
  3. Resumo de Clientes (LEFT OUTER JOIN com filtro para clientes sem locação)
  4. Utilização de Veículos (INNER JOIN + LEFT OUTER JOIN)
  5. Desempenho por Fabricante (LEFT OUTER JOIN múltiplo com gráfico)

## 3. Passos para Montagem no Figma
1. Criar um arquivo no Figma (`LocadoraVeiculos - Wireframes`).
2. Criar 7 frames de `1440 x 900` (um para cada tela) e 1 frame para os modais.
3. Transformar o menu lateral e a barra de filtros em componentes reutilizáveis.
4. Ligar os itens do menu no modo Prototype.
5. Em Share, habilitar visualização pública ("Anyone with the link can view") e colar o link na documentação.
