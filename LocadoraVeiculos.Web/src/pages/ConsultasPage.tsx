import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Database, RotateCcw, Search } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type {
  AluguelDetalhado,
  Categoria,
  ClienteResumoLocacoes,
  Fabricante,
  FabricanteDesempenho,
  FaturamentoCategoria,
  VeiculoUtilizacao,
} from '../types/models';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { Alert } from '../components/Alert';
import { StatusBadge } from '../components/StatusBadge';

type TabId =
  | 'alugueis-detalhados'
  | 'faturamento-categoria'
  | 'clientes-resumo'
  | 'veiculos-utilizacao'
  | 'fabricantes-desempenho';

const TABS: { id: TabId; label: string; route: string; joinInfo: string }[] = [
  {
    id: 'alugueis-detalhados',
    label: '1. Aluguéis Detalhados',
    route: 'GET /api/consultas/alugueis-detalhados',
    joinInfo: 'INNER JOIN: Alugueis, Clientes, Veiculos, Fabricantes e Categorias',
  },
  {
    id: 'faturamento-categoria',
    label: '2. Faturamento / Categoria',
    route: 'GET /api/consultas/faturamento-por-categoria',
    joinInfo: 'INNER JOIN com GROUP BY e SUM: Categorias, Veiculos e Alugueis',
  },
  {
    id: 'clientes-resumo',
    label: '3. Resumo de Clientes',
    route: 'GET /api/consultas/clientes-resumo-locacoes',
    joinInfo: 'LEFT OUTER JOIN: Clientes e Alugueis',
  },
  {
    id: 'veiculos-utilizacao',
    label: '4. Utilização de Veículos',
    route: 'GET /api/consultas/veiculos-utilizacao',
    joinInfo: 'INNER JOIN + LEFT OUTER JOIN: Veiculos, Fabricantes, Categorias e Alugueis',
  },
  {
    id: 'fabricantes-desempenho',
    label: '5. Desempenho Fabricantes',
    route: 'GET /api/consultas/fabricantes-desempenho',
    joinInfo: 'LEFT OUTER JOIN múltiplo: Fabricantes, Veiculos e Alugueis',
  },
];

export function ConsultasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('alugueis-detalhados');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [alugueis, setAlugueis] = useState<AluguelDetalhado[]>([]);
  const [faturamento, setFaturamento] = useState<FaturamentoCategoria[]>([]);
  const [clientesResumo, setClientesResumo] = useState<ClienteResumoLocacoes[]>([]);
  const [veiculosUtilizacao, setVeiculosUtilizacao] = useState<VeiculoUtilizacao[]>([]);
  const [fabricantesDesempenho, setFabricantesDesempenho] = useState<FabricanteDesempenho[]>([]);

  const [t1Cliente, setT1Cliente] = useState('');
  const [t1Modelo, setT1Modelo] = useState('');
  const [t1Fabricante, setT1Fabricante] = useState('');
  const [t1Status, setT1Status] = useState('');

  const [t2DataInicio, setT2DataInicio] = useState('');
  const [t2DataFim, setT2DataFim] = useState('');

  const [t3Busca, setT3Busca] = useState('');
  const [t3SemAluguel, setT3SemAluguel] = useState('');

  const [t4CategoriaId, setT4CategoriaId] = useState('');
  const [t4FabricanteId, setT4FabricanteId] = useState('');
  const [t4Disponivel, setT4Disponivel] = useState('');
  const [t4NuncaAlugados, setT4NuncaAlugados] = useState('');

  const [t5Nome, setT5Nome] = useState('');
  const [t5Pais, setT5Pais] = useState('');

  useEffect(() => {
    void Promise.all([api.fabricantes.list(), api.categorias.list()])
      .then(([f, c]) => {
        setFabricantes(f);
        setCategorias(c);
      })
      .catch(() => {});
  }, []);

  const executeQuery = useCallback(async (tab: TabId, clearFilters = false) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'alugueis-detalhados') {
        const data = await api.consultas.alugueisDetalhados(
          clearFilters
            ? undefined
            : {
                clienteNome: t1Cliente.trim(),
                modelo: t1Modelo.trim(),
                fabricanteNome: t1Fabricante.trim(),
                status: t1Status,
              }
        );
        setAlugueis(data);
      } else if (tab === 'faturamento-categoria') {
        const data = await api.consultas.faturamentoPorCategoria(
          clearFilters
            ? undefined
            : {
                dataInicio: t2DataInicio ? `${t2DataInicio}T00:00:00` : undefined,
                dataFim: t2DataFim ? `${t2DataFim}T23:59:59` : undefined,
              }
        );
        setFaturamento(data);
      } else if (tab === 'clientes-resumo') {
        const data = await api.consultas.clientesResumoLocacoes(
          clearFilters
            ? undefined
            : {
                termoBusca: t3Busca.trim(),
                apenasSemAluguel: t3SemAluguel || undefined,
              }
        );
        setClientesResumo(data);
      } else if (tab === 'veiculos-utilizacao') {
        const data = await api.consultas.veiculosUtilizacao(
          clearFilters
            ? undefined
            : {
                categoriaId: t4CategoriaId,
                fabricanteId: t4FabricanteId,
                disponivel: t4Disponivel,
                apenasNuncaAlugados: t4NuncaAlugados,
              }
        );
        setVeiculosUtilizacao(data);
      } else if (tab === 'fabricantes-desempenho') {
        const data = await api.consultas.fabricantesDesempenho(
          clearFilters
            ? undefined
            : {
                nome: t5Nome.trim(),
                paisOrigem: t5Pais.trim(),
              }
        );
        setFabricantesDesempenho(data);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao executar consulta na API.');
    } finally {
      setLoading(false);
    }
  }, [
    t1Cliente,
    t1Modelo,
    t1Fabricante,
    t1Status,
    t2DataInicio,
    t2DataFim,
    t3Busca,
    t3SemAluguel,
    t4CategoriaId,
    t4FabricanteId,
    t4Disponivel,
    t4NuncaAlugados,
    t5Nome,
    t5Pais,
  ]);

  useEffect(() => {
    void executeQuery(activeTab);
  }, [activeTab]);

  const currentTabMeta = TABS.find((t) => t.id === activeTab)!;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void executeQuery(activeTab);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Consultas e Relatórios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Relatórios gerenciais com filtros personalizados utilizando consultas INNER JOIN e LEFT OUTER JOIN.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs text-blue-950 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-mono font-semibold text-blue-800">
          <Database className="h-4 w-4 shrink-0" />
          <span>{currentTabMeta.route}</span>
        </div>
        <span className="text-blue-700">{currentTabMeta.joinInfo}</span>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {activeTab === 'alugueis-detalhados' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-5"
          >
            <input
              type="text"
              value={t1Cliente}
              onChange={(e) => setT1Cliente(e.target.value)}
              placeholder="Cliente (nome)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={t1Modelo}
              onChange={(e) => setT1Modelo(e.target.value)}
              placeholder="Modelo do veículo"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={t1Fabricante}
              onChange={(e) => setT1Fabricante(e.target.value)}
              placeholder="Fabricante"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={t1Status}
              onChange={(e) => setT1Status(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Concluido">Concluido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Search className="h-4 w-4" /> Consultar
              </button>
              <button
                type="button"
                onClick={() => {
                  setT1Cliente('');
                  setT1Modelo('');
                  setT1Fabricante('');
                  setT1Status('');
                  void executeQuery('alugueis-detalhados', true);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Limpar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3">Marca / Categoria</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Valor Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Consultando banco de dados...</td></tr>
                  ) : alugueis.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhum registro retornado.</td></tr>
                  ) : (
                    alugueis.map((a) => (
                      <tr key={a.aluguelId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">#{a.aluguelId}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{a.clienteNome}</div>
                          <div className="text-xs text-slate-500">{a.clienteEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{a.veiculoModelo}</div>
                          <div className="font-mono text-xs text-slate-500">{a.veiculoPlaca}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{a.fabricanteNome} / {a.categoriaNome}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{formatDate(a.dataInicio)} a {formatDate(a.dataFimPrevista)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(a.valorTotal)}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faturamento-categoria' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Data Início</label>
              <input
                type="date"
                value={t2DataInicio}
                onChange={(e) => setT2DataInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Data Fim</label>
              <input
                type="date"
                value={t2DataFim}
                onChange={(e) => setT2DataFim(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Search className="h-4 w-4" /> Filtrar Período
              </button>
              <button
                type="button"
                onClick={() => {
                  setT2DataInicio('');
                  setT2DataFim('');
                  void executeQuery('faturamento-categoria', true);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Limpar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          {faturamento.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Comparativo de Faturamento e Ticket Médio por Categoria
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faturamento}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="categoriaNome" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="totalFaturado" name="Total Faturado" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="ticketMedioLocacao" name="Ticket Médio" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Diária Padrão</th>
                    <th className="px-4 py-3">Total de Locações</th>
                    <th className="px-4 py-3">Faturamento Total</th>
                    <th className="px-4 py-3">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Calculando faturamento...</td></tr>
                  ) : faturamento.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhuma locação concluída no período selecionado.</td></tr>
                  ) : (
                    faturamento.map((item) => (
                      <tr key={item.categoriaId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.categoriaNome}</td>
                        <td className="px-4 py-3 text-slate-600">{formatCurrency(item.valorDiariaPadrao)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.totalLocacoes}</td>
                        <td className="px-4 py-3 font-bold text-blue-700">{formatCurrency(item.totalFaturado)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">{formatCurrency(item.ticketMedioLocacao)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clientes-resumo' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3"
          >
            <input
              type="text"
              value={t3Busca}
              onChange={(e) => setT3Busca(e.target.value)}
              placeholder="Buscar por Nome, CPF ou E-mail"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={t3SemAluguel}
              onChange={(e) => setT3SemAluguel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos os clientes</option>
              <option value="true">Apenas clientes sem locações</option>
              <option value="false">Apenas clientes com locações</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Search className="h-4 w-4" /> Consultar
              </button>
              <button
                type="button"
                onClick={() => {
                  setT3Busca('');
                  setT3SemAluguel('');
                  void executeQuery('clientes-resumo', true);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Limpar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">CPF / Contato</th>
                    <th className="px-4 py-3">Total Aluguéis</th>
                    <th className="px-4 py-3">Total Gasto</th>
                    <th className="px-4 py-3">Último Aluguel</th>
                    <th className="px-4 py-3">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Consultando clientes...</td></tr>
                  ) : clientesResumo.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
                  ) : (
                    clientesResumo.map((c) => (
                      <tr key={c.clienteId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{c.nome}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <div className="font-mono">{c.cpf}</div>
                          <div>{c.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{c.totalAlugueis}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(c.totalGasto)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(c.ultimoAluguel)}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.statusCliente} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'veiculos-utilizacao' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-5"
          >
            <select
              value={t4FabricanteId}
              onChange={(e) => setT4FabricanteId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todos Fabricantes</option>
              {fabricantes.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>

            <select
              value={t4CategoriaId}
              onChange={(e) => setT4CategoriaId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas Categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <select
              value={t4Disponivel}
              onChange={(e) => setT4Disponivel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Disponibilidade: Todos</option>
              <option value="true">Disponíveis</option>
              <option value="false">Alugados</option>
            </select>

            <select
              value={t4NuncaAlugados}
              onChange={(e) => setT4NuncaAlugados(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Histórico: Todos</option>
              <option value="true">Nunca alugados</option>
              <option value="false">Já alugados</option>
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Search className="h-4 w-4" /> Filtrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setT4CategoriaId('');
                  setT4FabricanteId('');
                  setT4Disponivel('');
                  setT4NuncaAlugados('');
                  void executeQuery('veiculos-utilizacao', true);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Limpar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3">Marca / Categoria</th>
                    <th className="px-4 py-3">KM Atual</th>
                    <th className="px-4 py-3">Locações</th>
                    <th className="px-4 py-3">KM Rodada em Locações</th>
                    <th className="px-4 py-3">Receita Gerada</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Calculando métricas da frota...</td></tr>
                  ) : veiculosUtilizacao.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhum veículo retornado.</td></tr>
                  ) : (
                    veiculosUtilizacao.map((v) => (
                      <tr key={v.veiculoId} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{v.modelo} ({v.anoFabricacao})</div>
                          <div className="font-mono text-xs text-slate-500">{v.placa}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{v.fabricante} / {v.categoria}</td>
                        <td className="px-4 py-3 text-slate-600">{formatNumber(v.quilometragemAtual, 'km')}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{v.totalLocacoes}</td>
                        <td className="px-4 py-3 text-slate-600">{formatNumber(v.quilometragemTotalRodada ?? 0, 'km')}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(v.totalFaturadoVeiculo)}</td>
                        <td className="px-4 py-3"><StatusBadge status={v.disponivel ? 'Disponível' : 'Alugado'} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fabricantes-desempenho' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3"
          >
            <input
              type="text"
              value={t5Nome}
              onChange={(e) => setT5Nome(e.target.value)}
              placeholder="Nome do fabricante"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={t5Pais}
              onChange={(e) => setT5Pais(e.target.value)}
              placeholder="País de origem"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Search className="h-4 w-4" /> Consultar
              </button>
              <button
                type="button"
                onClick={() => {
                  setT5Nome('');
                  setT5Pais('');
                  void executeQuery('fabricantes-desempenho', true);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                title="Limpar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>

          {fabricantesDesempenho.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Receita Acumulada por Fabricante
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fabricantesDesempenho}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="nomeFabricante" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="totalReceitaGerada" name="Receita Gerada" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Fabricante</th>
                    <th className="px-4 py-3">País de Origem</th>
                    <th className="px-4 py-3">Veículos na Frota</th>
                    <th className="px-4 py-3">Total de Locações</th>
                    <th className="px-4 py-3">Receita Acumulada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Consultando fabricantes...</td></tr>
                  ) : fabricantesDesempenho.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum fabricante encontrado.</td></tr>
                  ) : (
                    fabricantesDesempenho.map((f) => (
                      <tr key={f.fabricanteId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{f.nomeFabricante}</td>
                        <td className="px-4 py-3 text-slate-600">{f.paisOrigem || '-'}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{f.totalVeiculosCadastrados}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{f.totalLocacoesRealizadas}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(f.totalReceitaGerada)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
