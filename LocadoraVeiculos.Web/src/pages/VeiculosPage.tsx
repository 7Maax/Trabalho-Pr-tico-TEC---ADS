import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Categoria, Fabricante, Veiculo } from '../types/models';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros personalizados (5 campos: modelo, placa, fabricanteId, categoriaId, disponivel)
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroFabricanteId, setFiltroFabricanteId] = useState('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState('');
  const [filtroDisponivel, setFiltroDisponivel] = useState('');

  // Modal Criar / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [modelo, setModelo] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState(String(new Date().getFullYear()));
  const [quilometragem, setQuilometragem] = useState('0');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [fabricanteId, setFabricanteId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadDependencies() {
    try {
      const [fabs, cats] = await Promise.all([api.fabricantes.list(), api.categorias.list()]);
      setFabricantes(fabs);
      setCategorias(cats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar fabricantes e categorias.');
    }
  }

  async function loadVeiculos(params?: {
    modelo?: string;
    placa?: string;
    fabricanteId?: string;
    categoriaId?: string;
    disponivel?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const hasOnlyDisponiveis =
        params?.disponivel === 'true' &&
        !params.modelo &&
        !params.placa &&
        !params.fabricanteId &&
        !params.categoriaId;

      const data = hasOnlyDisponiveis
        ? await api.veiculos.disponiveis()
        : await api.veiculos.list(params);
      setVeiculos(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar veículos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([loadDependencies(), loadVeiculos()]);
  }, []);

  function currentFilters() {
    return {
      modelo: filtroModelo.trim(),
      placa: filtroPlaca.trim(),
      fabricanteId: filtroFabricanteId,
      categoriaId: filtroCategoriaId,
      disponivel: filtroDisponivel,
    };
  }

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    void loadVeiculos(currentFilters());
  }

  function handleOnlyDisponiveis() {
    setFiltroModelo('');
    setFiltroPlaca('');
    setFiltroFabricanteId('');
    setFiltroCategoriaId('');
    setFiltroDisponivel('true');
    void loadVeiculos({ disponivel: 'true' });
  }

  function handleResetFilters() {
    setFiltroModelo('');
    setFiltroPlaca('');
    setFiltroFabricanteId('');
    setFiltroCategoriaId('');
    setFiltroDisponivel('');
    void loadVeiculos();
  }

  function openCreate() {
    setEditing(null);
    setModelo('');
    setAnoFabricacao(String(new Date().getFullYear()));
    setQuilometragem('0');
    setPlaca('');
    setCor('');
    setFabricanteId(fabricantes[0] ? String(fabricantes[0].id) : '');
    setCategoriaId(categorias[0] ? String(categorias[0].id) : '');
    setModalOpen(true);
  }

  function openEdit(item: Veiculo) {
    setEditing(item);
    setModelo(item.modelo);
    setAnoFabricacao(String(item.anoFabricacao));
    setQuilometragem(String(item.quilometragem));
    setPlaca(item.placa);
    setCor(item.cor);
    setFabricanteId(String(item.fabricanteId));
    setCategoriaId(String(item.categoriaId));
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        modelo: modelo.trim(),
        anoFabricacao: Number(anoFabricacao),
        quilometragem: Number(quilometragem),
        placa: placa.trim().toUpperCase(),
        cor: cor.trim(),
        fabricanteId: Number(fabricanteId),
        categoriaId: Number(categoriaId),
      };

      if (editing) {
        await api.veiculos.update(editing.id, payload);
        setSuccess(`Veículo "${payload.modelo}" (${payload.placa}) atualizado com sucesso.`);
      } else {
        await api.veiculos.create(payload);
        setSuccess(`Veículo "${payload.modelo}" (${payload.placa}) cadastrado com sucesso.`);
      }
      setModalOpen(false);
      await loadVeiculos(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar veículo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Veiculo) {
    if (!window.confirm(`Deseja realmente excluir o veículo "${item.modelo}" (${item.placa})?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.veiculos.delete(item.id);
      setSuccess(`Veículo "${item.modelo}" excluído com sucesso.`);
      await loadVeiculos(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir veículo.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Frota de Veículos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastro completo da frota com filtros por modelo, placa, fabricante, categoria e disponibilidade.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOnlyDisponiveis}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            Apenas Disponíveis
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Veículo
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Barra de Filtros */}
      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-6"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Modelo</label>
          <input
            type="text"
            value={filtroModelo}
            onChange={(e) => setFiltroModelo(e.target.value)}
            placeholder="Ex: Corolla..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Placa</label>
          <input
            type="text"
            value={filtroPlaca}
            onChange={(e) => setFiltroPlaca(e.target.value)}
            placeholder="Ex: BRA2E19"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Fabricante</label>
          <select
            value={filtroFabricanteId}
            onChange={(e) => setFiltroFabricanteId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos</option>
            {fabricantes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Categoria</label>
          <select
            value={filtroCategoriaId}
            onChange={(e) => setFiltroCategoriaId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Disponibilidade</label>
          <select
            value={filtroDisponivel}
            onChange={(e) => setFiltroDisponivel(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos</option>
            <option value="true">Disponíveis</option>
            <option value="false">Alugados</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                <th className="px-5 py-3.5">Veículo</th>
                <th className="px-5 py-3.5">Placa</th>
                <th className="px-5 py-3.5">Fabricante</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5">Quilometragem</th>
                <th className="px-5 py-3.5">Diária</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Carregando veículos...
                  </td>
                </tr>
              ) : veiculos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Nenhum veículo encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                veiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {v.modelo} ({v.anoFabricacao})
                      </div>
                      <div className="text-xs text-slate-500">{v.cor || 'Cor não informada'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-800">
                      {v.placa}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{v.fabricante}</td>
                    <td className="px-5 py-3.5 text-slate-700">{v.categoria}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatNumber(v.quilometragem, 'km')}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(v.valorDiaria)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={v.disponivel ? 'Disponível' : 'Alugado'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(v)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar Veículo' : 'Novo Veículo'}
        subtitle="Informe os dados técnicos e vincule ao fabricante e categoria."
        onClose={() => setModalOpen(false)}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Modelo *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex: Corolla Cross"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Placa *</label>
            <input
              type="text"
              required
              maxLength={10}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="BRA2E19"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ano de Fabricação *</label>
            <input
              type="number"
              required
              min={1900}
              max={2100}
              value={anoFabricacao}
              onChange={(e) => setAnoFabricacao(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Quilometragem (km)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={quilometragem}
              onChange={(e) => setQuilometragem(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cor</label>
            <input
              type="text"
              maxLength={50}
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              placeholder="Ex: Branco Perolizado"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fabricante *</label>
            <select
              required
              value={fabricanteId}
              onChange={(e) => setFabricanteId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecione...</option>
              {fabricantes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome} ({f.paisOrigem})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Categoria *</label>
            <select
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {formatCurrency(c.valorDiaria)}/dia
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
