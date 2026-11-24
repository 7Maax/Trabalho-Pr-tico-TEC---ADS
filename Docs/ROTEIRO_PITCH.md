# Roteiro da Apresentação em Vídeo (Pitch - 3 a 5 minutos)

## Requisitos da Apresentação
- Duração: entre 3 e 5 minutos (meta: cerca de 4 minutos).
- Conteúdo: problema, modelagem adotada e pelo menos dois exemplos de consultas (banco e rota) com seus resultados no front-end.
- Não exibir conteúdo de terceiros sem referência.

## Preparação Antes de Gravar
1. Iniciar a API:
   ```powershell
   dotnet run --project LocadoraVeiculos.API
   ```
2. Iniciar o front-end:
   ```powershell
   cd LocadoraVeiculos.Web
   npm run dev
   ```
3. Ter dados reais cadastrados no SQL Server:
   - Os fabricantes e categorias do seed inicial;
   - Pelo menos 3 veículos (disponíveis e alugados);
   - Pelo menos 2 clientes, sendo um deles sem nenhuma locação (para demonstrar o LEFT JOIN);
   - Pelo menos 2 aluguéis concluídos em categorias diferentes e 1 aluguel ativo.
4. Deixar abertas as abas:
   - `http://localhost:5173` (Dashboard)
   - `http://localhost:5173/consultas` (Consultas)
   - `DOCUMENTACAO_APIS.md` ou `http://localhost:5205` (Diagrama ER / Swagger)

## Estrutura Cronometrada (aprox. 4 minutos)

### 0:00 a 0:45 - Problema e Solução
- Tela: Dashboard (`http://localhost:5173`).
- Pontos para falar:
  - Dificuldade de locadoras no controle de disponibilidade de veículos, cálculo de devoluções e acompanhamento do faturamento por categoria.
  - Apresentação do sistema LocadoraVeiculos: front-end em React + TypeScript integrado à API ASP.NET Core e ao banco SQL Server, operando apenas com dados reais.

### 0:45 a 1:30 - Modelagem e Arquitetura
- Tela: Diagrama ER e navegação rápida pelas telas de cadastro.
- Pontos para falar:
  - 5 entidades relacionais: Fabricantes, Categorias, Veículos, Clientes e Aluguéis.
  - Chaves estrangeiras com integridade referencial (`OnDelete: Restrict`) e índices únicos (placa, CPF, e-mail e nomes).
  - Telas construídas a partir dos wireframes, com CRUD completo e filtros em múltiplos campos para cada entidade.

### 1:30 a 2:30 - Exemplo de Consulta 1 (INNER JOIN)
- Tela: Consultas -> Aba 1 (Aluguéis Detalhados).
- Ação na tela: mostrar a rota `GET /api/consultas/alugueis-detalhados`, aplicar filtros (ex.: status `Concluido` e nome do fabricante ou cliente) e clicar em Consultar.
- Pontos para falar:
  - Explicar que no banco a consulta executa um `INNER JOIN` unindo as 5 tabelas (`Alugueis`, `Clientes`, `Veiculos`, `Fabricantes` e `Categorias`).
  - Mostrar os dados consolidados retornados na tabela do front-end.

### 2:30 a 3:30 - Exemplo de Consulta 2 (Agregação e LEFT OUTER JOIN)
- Tela: Consultas -> Aba 2 (Faturamento / Categoria) e Aba 3 (Resumo de Clientes).
- Ação na tela:
  - Na Aba 2 (`GET /api/consultas/faturamento-por-categoria`), mostrar o gráfico de barras e a tabela com faturamento total e ticket médio.
  - Na Aba 3 (`GET /api/consultas/clientes-resumo-locacoes`), filtrar por "Apenas clientes sem locações" e clicar em Consultar.
- Pontos para falar:
  - Explicar o agrupamento com soma no banco para gerar os indicadores por categoria.
  - Explicar o `LEFT OUTER JOIN` entre `Clientes` e `Alugueis`, que permite listar clientes cadastrados mesmo sem locações registradas.

### 3:30 a 4:05 - Encerramento
- Tela: retorno rápido ao Dashboard.
- Pontos para falar:
  - Resumo dos ganhos do sistema (controle de frota consistente, devolução com cálculo automático e relatórios direto do banco).
  - Referência ao repositório no GitHub, wireframes e documentação SBC.
