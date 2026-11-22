import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Car,
  DollarSign,
  FileKey2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import type {
  AluguelDetalhado,
  FabricanteDesempenho,
  FaturamentoCategoria,
} from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Alert } from '../components/Alert';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalVeiculos, setTotalVeiculos] = useState(0);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [alugueisAtivos, setAlugueisAtivos] = useState<AluguelDetalhado[]>([]);
  const [faturamentoCategorias, setFaturamentoCategorias] = useState<FaturamentoCategoria[]>([]);
  const [desempenhoFabricantes, setDesempenhoFabricantes] = useState<FabricanteDesempenho[]>([]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const [veiculos, disponiveis, clientes, ativos, faturamento, fabricantes] =
        await Promise.all([
          api.veiculos.list(),
          api.veiculos.disponiveis(),
          api.clientes.list(),
          api.consultas.alugueisDetalhados({ status: 'Ativo' }),
          api.consultas.faturamentoPorCategoria(),
          api.consultas.fabricantesDesempenho(),
        ]);

      setTotalVeiculos(veiculos.length);
      setVeiculosDisponiveis(disponiveis.length);
      setTotalClientes(clientes.length);
      setAlugueisAtivos(ativos);
      setFaturamentoCategorias(faturamento);
      setDesempenhoFabricantes(fabricantes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const receitaTotal = faturamentoCategorias.reduce((acc, item) => acc + item.totalFaturado, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard — Visão Geral
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores operacionais e financeiros em tempo real diretamente do SQL Server.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <Link
            to="/alugueis"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Nova Locação
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Frota de Veículos
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Car className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : totalVeiculos}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            {loading ? 'Carregando...' : `${veiculosDisponiveis} disponíveis para locação`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Locações Ativas
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <FileKey2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : alugueisAtivos.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Contratos aguardando devolução</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Clientes Cadastrados
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : totalClientes}
          </p>
          <p className="mt-1 text-xs text-slate-500">Base ativa no banco de dados</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Faturamento Concluído
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : formatCurrency(receitaTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Consolidado via INNER JOIN</p>
        </div>
      </div>

      {/* Gráficos das Consultas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Faturamento por Categoria
              </h2>
              <p className="text-xs text-slate-500">
                GET /api/consultas/faturamento-por-categoria
              </p>
            </div>
            <Link
              to="/consultas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {faturamentoCategorias.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              Nenhum aluguel concluído registrado ainda.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faturamentoCategorias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="categoriaNome" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  />
                  <Bar dataKey="totalFaturado" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Receita por Fabricante
              </h2>
              <p className="text-xs text-slate-500">
                GET /api/consultas/fabricantes-desempenho (LEFT JOIN)
              </p>
            </div>
            <Link
              to="/consultas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Explorar JOINs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {desempenhoFabricantes.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              Nenhum fabricante cadastrado.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={desempenhoFabricantes} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="nomeFabricante" type="category" width={95} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Receita Gerada']}
                  />
                  <Bar dataKey="totalReceitaGerada" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Aluguéis Ativos */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Aluguéis Ativos no Momento
            </h2>
            <p className="text-xs text-slate-500">
              Consulta consolidada com INNER JOIN entre 5 tabelas
            </p>
          </div>
          <Link
            to="/alugueis"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Gerenciar todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Veículo</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Período Previsto</th>
                <th className="px-5 py-3">Diária</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alugueisAtivos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    {loading ? 'Carregando aluguéis...' : 'Nenhum aluguel ativo no momento.'}
                  </td>
                </tr>
              ) : (
                alugueisAtivos.slice(0, 6).map((item) => (
                  <tr key={item.aluguelId} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      #{item.aluguelId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{item.clienteNome}</div>
                      <div className="text-xs text-slate-500">{item.clienteCPF}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">
                        {item.fabricanteNome} {item.veiculoModelo}
                      </div>
                      <div className="font-mono text-xs text-slate-500">{item.veiculoPlaca}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.categoriaNome}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(item.dataInicio)} → {formatDate(item.dataFimPrevista)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {formatCurrency(item.valorDiaria)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
