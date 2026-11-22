import type {
  Aluguel,
  AluguelDetalhado,
  AluguelRequest,
  Categoria,
  CategoriaRequest,
  Cliente,
  ClienteRequest,
  ClienteResumoLocacoes,
  DevolucaoRequest,
  Fabricante,
  FabricanteDesempenho,
  FabricanteRequest,
  FaturamentoCategoria,
  Veiculo,
  VeiculoRequest,
  VeiculoUtilizacao,
} from '../types/models';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5205/api';

export class ApiError extends Error {
  status: number;
  detalhe?: string;

  constructor(message: string, status: number, detalhe?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhe = detalhe;
  }
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API em ' +
        API_BASE_URL +
        '. Verifique se o back-end LocadoraVeiculos.API está em execução.',
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json');
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    let message = `Erro na requisição (HTTP ${response.status})`;
    let detalhe: string | undefined;

    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      if (typeof obj.mensagem === 'string') {
        message = obj.mensagem;
      } else if (typeof obj.title === 'string') {
        message = obj.title;
      }

      if (typeof obj.detalhe === 'string') {
        detalhe = obj.detalhe;
      }

      if (obj.errors && typeof obj.errors === 'object') {
        const errorsList = Object.values(obj.errors as Record<string, string[]>)
          .flat()
          .filter(Boolean);
        if (errorsList.length > 0) {
          message = errorsList.join(' ');
        }
      }
    } else if (typeof body === 'string' && body.trim().length > 0) {
      message = body;
    }

    throw new ApiError(message, response.status, detalhe);
  }

  return body as T;
}

export const api = {
  // Fabricantes
  fabricantes: {
    list: (filters?: { nome?: string; paisOrigem?: string }) =>
      request<Fabricante[]>(`/fabricantes${buildQuery(filters)}`),
    getById: (id: number) => request<Fabricante>(`/fabricantes/${id}`),
    create: (data: FabricanteRequest) =>
      request<Fabricante>('/fabricantes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: FabricanteRequest) =>
      request<void>(`/fabricantes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/fabricantes/${id}`, { method: 'DELETE' }),
  },

  // Categorias
  categorias: {
    list: (filters?: { nome?: string; valorMin?: string | number; valorMax?: string | number }) =>
      request<Categoria[]>(`/categorias${buildQuery(filters)}`),
    getById: (id: number) => request<Categoria>(`/categorias/${id}`),
    create: (data: CategoriaRequest) =>
      request<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: CategoriaRequest) =>
      request<void>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/categorias/${id}`, { method: 'DELETE' }),
  },

  // Veículos
  veiculos: {
    list: (filters?: {
      modelo?: string;
      placa?: string;
      fabricanteId?: string | number;
      categoriaId?: string | number;
      disponivel?: string | boolean;
    }) => request<Veiculo[]>(`/veiculos${buildQuery(filters)}`),
    disponiveis: () => request<Veiculo[]>('/veiculos/disponiveis'),
    getById: (id: number) => request<Veiculo>(`/veiculos/${id}`),
    create: (data: VeiculoRequest) =>
      request<Veiculo>('/veiculos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: VeiculoRequest) =>
      request<void>(`/veiculos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/veiculos/${id}`, { method: 'DELETE' }),
  },

  // Clientes
  clientes: {
    list: (filters?: { nome?: string; cpf?: string; email?: string }) =>
      request<Cliente[]>(`/clientes${buildQuery(filters)}`),
    getById: (id: number) => request<Cliente>(`/clientes/${id}`),
    create: (data: ClienteRequest) =>
      request<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: ClienteRequest) =>
      request<void>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/clientes/${id}`, { method: 'DELETE' }),
  },

  // Aluguéis
  alugueis: {
    list: (filters?: { status?: string; clienteId?: number; veiculoId?: number }) =>
      request<Aluguel[]>(`/alugueis${buildQuery(filters)}`),
    getById: (id: number) => request<Aluguel>(`/alugueis/${id}`),
    getByCliente: (clienteId: number) => request<Aluguel[]>(`/alugueis/cliente/${clienteId}`),
    create: (data: AluguelRequest) =>
      request<Aluguel>('/alugueis', { method: 'POST', body: JSON.stringify(data) }),
    devolver: (id: number, data: DevolucaoRequest) =>
      request<Aluguel>(`/alugueis/${id}/devolver`, { method: 'PUT', body: JSON.stringify(data) }),
    cancelar: (id: number) => request<void>(`/alugueis/${id}`, { method: 'DELETE' }),
  },

  // Consultas e Filtros com INNER / LEFT JOIN
  consultas: {
    alugueisDetalhados: (filters?: {
      clienteNome?: string;
      modelo?: string;
      fabricanteNome?: string;
      status?: string;
      dataInicio?: string;
      dataFim?: string;
    }) => request<AluguelDetalhado[]>(`/consultas/alugueis-detalhados${buildQuery(filters)}`),

    faturamentoPorCategoria: (filters?: { dataInicio?: string; dataFim?: string }) =>
      request<FaturamentoCategoria[]>(`/consultas/faturamento-por-categoria${buildQuery(filters)}`),

    clientesResumoLocacoes: (filters?: { apenasSemAluguel?: string | boolean; termoBusca?: string }) =>
      request<ClienteResumoLocacoes[]>(`/consultas/clientes-resumo-locacoes${buildQuery(filters)}`),

    veiculosUtilizacao: (filters?: {
      categoriaId?: string | number;
      fabricanteId?: string | number;
      apenasNuncaAlugados?: string | boolean;
      disponivel?: string | boolean;
    }) => request<VeiculoUtilizacao[]>(`/consultas/veiculos-utilizacao${buildQuery(filters)}`),

    fabricantesDesempenho: (filters?: { paisOrigem?: string; nome?: string }) =>
      request<FabricanteDesempenho[]>(`/consultas/fabricantes-desempenho${buildQuery(filters)}`),
  },
};
