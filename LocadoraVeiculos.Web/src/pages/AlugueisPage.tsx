import { FormEvent, useEffect, useState } from 'react';
import { Ban, CheckCircle, Plus, RotateCcw, Search } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { AluguelDetalhado, Cliente, Veiculo } from '../types/models';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  toDateTimeLocalValue,
} from '../utils/formatters';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export function AlugueisPage() {
  const [alugueis, setAlugueis] = useState<AluguelDetalhado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 6 filtros da rota GET /api/consultas/alugueis-detalhados
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroFabricante, setFiltroFabricante] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // Modal Nova Locação
  const [createOpen, setCreateOpen] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFimPrevista, setDataFimPrevista] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal Registrar Devolução
  const [devolucaoTarget, setDevolucaoTarget] = useState<AluguelDetalhado | null>(null);
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [quilometragemFinal, setQuilometragemFinal] = useState('');
  const [returning, setReturning] = useState(false);

  function currentFilters() {
    return {
      clienteNome: filtroCliente.trim(),
      modelo: filtroModelo.trim(),
      fabricanteNome: filtroFabricante.trim(),
      status: filtroStatus,
      dataInicio: filtroDataInicio ? `${filtroDataInicio}T00:00:00` : undefined,
      dataFim: filtroDataFim ? `${filtroDataFim}T23:59:59` : undefined,
    };
  }

  async function loadAlugueis(
    filters: Parameters<typeof api.consultas.alugueisDetalhados>[0] = currentFilters()
  ) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.consultas.alugueisDetalhados(filters);
      setAlugueis(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar aluguéis.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFormOptions() {
    try {
      const [cls, disp] = await Promise.all([api.clientes.list(), api.veiculos.disponiveis()]);
      setClientes(cls);
      setVeiculosDisponiveis(disp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar clientes e veículos disponíveis.');
    }
  }

  useEffect(() => {
    void loadAlugueis({});
  }, []);

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    void loadAlugueis(currentFilters());
  }

  function handleResetFilters() {
    setFiltroCliente('');
    setFiltroModelo('');
    setFiltroFabricante('');
    setFiltroStatus('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    void loadAlugueis({});
  }

  async function openCreateModal() {
    await loadFormOptions();
    const now = new Date();
    const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    setDataInicio(toDateTimeLocalValue(now));
    setDataFimPrevista(toDateTimeLocalValue(fiveDaysLater));
    setClienteId('');
    setVeiculoId('');
    setCreateOpen(true);
  }

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.alugueis.create({
        clienteId: Number(clienteId),
        veiculoId: Number(veiculoId),
        dataInicio,
        dataFimPrevista,
      });
      setCreateOpen(false);
      setSuccess('Locação registrada com sucesso! O veículo foi marcado como indisponível.');
      await loadAlugueis(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao registrar locação.');
    } finally {
      setSaving(false);
    }
  }

  function openDevolucaoModal(item: AluguelDetalhado) {
    setDevolucaoTarget(item);
    setDataDevolucao(toDateTimeLocalValue(new Date()));
    setQuilometragemFinal(String(item.quilometragemInicial));
  }

  async function handleDevolucaoSubmit(e: FormEvent) {
    e.preventDefault();
    if (!devolucaoTarget) return;
    setReturning(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await api.alugueis.devolver(devolucaoTarget.aluguelId, {
        dataDevolucao,
        quilometragemFinal: Number(quilometragemFinal),
      });
      setDevolucaoTarget(null);
      setSuccess(
        `Devolução do aluguel #${updated.id} concluída! Valor total calculado: ${formatCurrency(
          updated.valorTotal
        )}.`
      );
      await loadAlugueis(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao registrar devolução.');
    } finally {
      setReturning(false);
    }
  }

  async function handleCancelar(item: AluguelDetalhado) {
    if (
      !window.confirm(
        `Deseja realmente cancelar o aluguel #${item.aluguelId} (${item.veiculoModelo} - ${item.clienteNome})?`
      )
    ) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.alugueis.cancelar(item.aluguelId);
      setSuccess(`Aluguel #${item.aluguelId} cancelado e veículo liberado novamente.`);
      await loadAlugueis(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cancelar aluguel.');
    }
  }

  const selectedVehicle = veiculosDisponiveis.find((v) => String(v.id) === veiculoId);
  const estimatedDays =
    dataInicio && dataFimPrevista
      ? Math.max(
          1,
          Math.ceil(
            (new Date(dataFimPrevista).getTime() - new Date(dataInicio).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Aluguéis</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registro de locações, devolução com cálculo automático e cancelamento. Listagem com INNER JOIN em 5 tabelas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openCreateModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Locação
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Barra de Filtros (6 campos) */}
      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-7"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Cliente</label>
          <input
            type="text"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Nome do cliente"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Modelo</label>
          <input
            type="text"
            value={filtroModelo}
            onChange={(e) => setFiltroModelo(e.target.value)}
            placeholder="Ex: Corolla"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Fabricante</label>
          <input
            type="text"
            value={filtroFabricante}
            onChange={(e) => setFiltroFabricante(e.target.value)}
            placeholder="Ex: Toyota"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Concluido">Concluido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Início a partir de</label>
          <input
            type="date"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Início até</label>
          <input
            type="date"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Search className="h-4 w-4" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            title="Limpar filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Veículo / Marca</th>
                <th className="px-4 py-3.5">Datas</th>
                <th className="px-4 py-3.5">KM</th>
                <th className="px-4 py-3.5">Valores</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Carregando aluguéis...
                  </td>
                </tr>
              ) : alugueis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Nenhum aluguel encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                alugueis.map((a) => (
                  <tr key={a.aluguelId} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                      #{a.aluguelId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{a.clienteNome}</div>
                      <div className="font-mono text-xs text-slate-500">{a.clienteCPF}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">
                        {a.fabricanteNome} {a.veiculoModelo}
                      </div>
                      <div className="text-xs text-slate-500">
                        {a.veiculoPlaca} • {a.categoriaNome}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div>Início: {formatDateTime(a.dataInicio)}</div>
                      <div>Prev.: {formatDateTime(a.dataFimPrevista)}</div>
                      {a.dataDevolucao && (
                        <div className="font-medium text-emerald-700">
                          Devol.: {formatDateTime(a.dataDevolucao)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div>Ini: {formatNumber(a.quilometragemInicial, 'km')}</div>
                      <div>
                        Fim: {a.quilometragemFinal !== null ? formatNumber(a.quilometragemFinal, 'km') : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-500">
                        Diária: {formatCurrency(a.valorDiaria)}
                      </div>
                      <div className="font-semibold text-slate-900">
                        Total: {formatCurrency(a.valorTotal)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {a.status === 'Ativo' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDevolucaoModal(a)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Devolver
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCancelar(a)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Locação */}
      <Modal
        open={createOpen}
        title="Nova Locação"
        subtitle="Apenas veículos disponíveis (GET /api/veiculos/disponiveis) são listados."
        onClose={() => setCreateOpen(false)}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cliente *</label>
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — CPF: {c.cpf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Veículo Disponível *
            </label>
            <select
              required
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecione um veículo disponível...</option>
              {veiculosDisponiveis.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fabricante} {v.modelo} ({v.placa}) — {v.categoria} —{' '}
                  {formatCurrency(v.valorDiaria)}/dia
                </option>
              ))}
            </select>
            {veiculosDisponiveis.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Nenhum veículo disponível no momento. Cadastre um veículo ou conclua uma devolução.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Data Início *</label>
              <input
                type="datetime-local"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Data Fim Prevista *
              </label>
              <input
                type="datetime-local"
                required
                value={dataFimPrevista}
                onChange={(e) => setDataFimPrevista(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {selectedVehicle && estimatedDays > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-sm text-blue-900">
              <p className="font-semibold">Previsão da Locação</p>
              <p className="mt-0.5 text-xs text-blue-800">
                {estimatedDays} dia(s) × {formatCurrency(selectedVehicle.valorDiaria)} ={' '}
                <strong>{formatCurrency(estimatedDays * selectedVehicle.valorDiaria)}</strong> (KM
                inicial: {formatNumber(selectedVehicle.quilometragem, 'km')})
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || veiculosDisponiveis.length === 0}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Confirmando...' : 'Confirmar Locação'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Devolução */}
      <Modal
        open={Boolean(devolucaoTarget)}
        title={`Registrar Devolução — Aluguel #${devolucaoTarget?.aluguelId ?? ''}`}
        subtitle="PUT /api/alugueis/{id}/devolver — calcula o total e libera o veículo."
        onClose={() => setDevolucaoTarget(null)}
      >
        {devolucaoTarget && (
          <form onSubmit={handleDevolucaoSubmit} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <div>
                <strong>Cliente:</strong> {devolucaoTarget.clienteNome}
              </div>
              <div>
                <strong>Veículo:</strong> {devolucaoTarget.fabricanteNome}{' '}
                {devolucaoTarget.veiculoModelo} ({devolucaoTarget.veiculoPlaca})
              </div>
              <div>
                <strong>Início:</strong> {formatDateTime(devolucaoTarget.dataInicio)} •{' '}
                <strong>KM Inicial:</strong> {formatNumber(devolucaoTarget.quilometragemInicial, 'km')}
              </div>
              <div>
                <strong>Diária contratada:</strong> {formatCurrency(devolucaoTarget.valorDiaria)}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Data e Hora da Devolução *
              </label>
              <input
                type="datetime-local"
                required
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Quilometragem Final (km) *
              </label>
              <input
                type="number"
                required
                min={devolucaoTarget.quilometragemInicial}
                step="0.01"
                value={quilometragemFinal}
                onChange={(e) => setQuilometragemFinal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                Deve ser maior ou igual à quilometragem inicial (
                {formatNumber(devolucaoTarget.quilometragemInicial, 'km')}).
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDevolucaoTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={returning}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {returning ? 'Processando...' : 'Concluir Devolução'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
