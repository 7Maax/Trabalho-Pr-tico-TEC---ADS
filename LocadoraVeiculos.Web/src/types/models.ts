export interface Fabricante {
  id: number;
  nome: string;
  paisOrigem: string;
}

export interface FabricanteRequest {
  nome: string;
  paisOrigem: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  valorDiaria: number;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string;
  valorDiaria: number;
}

export interface Veiculo {
  id: number;
  modelo: string;
  anoFabricacao: number;
  quilometragem: number;
  placa: string;
  cor: string;
  disponivel: boolean;
  fabricanteId: number;
  fabricante: string;
  categoriaId: number;
  categoria: string;
  valorDiaria: number;
}

export interface VeiculoRequest {
  modelo: string;
  anoFabricacao: number;
  quilometragem: number;
  placa: string;
  cor: string;
  fabricanteId: number;
  categoriaId: number;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cnh: string;
  dataNascimento: string;
  dataCadastro: string;
}

export interface ClienteRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cnh: string;
  dataNascimento: string;
}

export interface Aluguel {
  id: number;
  cliente: string;
  veiculo: string;
  placa: string;
  dataInicio: string;
  dataFimPrevista: string;
  dataDevolucao: string | null;
  quilometragemInicial: number;
  quilometragemFinal: number | null;
  valorDiaria: number;
  valorTotal: number | null;
  status: 'Ativo' | 'Concluido' | 'Cancelado' | string;
}

export interface AluguelRequest {
  clienteId: number;
  veiculoId: number;
  dataInicio: string;
  dataFimPrevista: string;
}

export interface DevolucaoRequest {
  dataDevolucao: string;
  quilometragemFinal: number;
}

export interface AluguelDetalhado {
  aluguelId: number;
  clienteNome: string;
  clienteCPF: string;
  clienteEmail: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  fabricanteNome: string;
  categoriaNome: string;
  dataInicio: string;
  dataFimPrevista: string;
  dataDevolucao: string | null;
  quilometragemInicial: number;
  quilometragemFinal: number | null;
  valorDiaria: number;
  valorTotal: number | null;
  status: string;
}

export interface FaturamentoCategoria {
  categoriaId: number;
  categoriaNome: string;
  valorDiariaPadrao: number;
  totalLocacoes: number;
  totalFaturado: number;
  ticketMedioLocacao: number;
}

export interface ClienteResumoLocacoes {
  clienteId: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  totalAlugueis: number;
  totalGasto: number;
  ultimoAluguel: string | null;
  statusCliente: string;
}

export interface VeiculoUtilizacao {
  veiculoId: number;
  modelo: string;
  placa: string;
  anoFabricacao: number;
  quilometragemAtual: number;
  fabricante: string;
  categoria: string;
  disponivel: boolean;
  totalLocacoes: number;
  quilometragemTotalRodada: number | null;
  totalFaturadoVeiculo: number;
  ultimaLocacao: string | null;
}

export interface FabricanteDesempenho {
  fabricanteId: number;
  nomeFabricante: string;
  paisOrigem: string;
  totalVeiculosCadastrados: number;
  totalLocacoesRealizadas: number;
  totalReceitaGerada: number;
}
