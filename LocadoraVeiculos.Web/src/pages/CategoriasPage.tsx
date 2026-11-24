import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Categoria } from '../types/models';
import { formatCurrency } from '../utils/formatters';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadCategorias(params?: {
    nome?: string;
    valorMin?: string;
    valorMax?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.categorias.list(params);
      setCategorias(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar categorias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategorias();
  }, []);

  function currentFilters() {
    return {
      nome: filtroNome.trim(),
      valorMin: filtroValorMin.trim(),
      valorMax: filtroValorMax.trim(),
    };
  }

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    void loadCategorias(currentFilters());
  }

  function handleResetFilters() {
    setFiltroNome('');
    setFiltroValorMin('');
    setFiltroValorMax('');
    void loadCategorias();
  }

  function openCreate() {
    setEditing(null);
    setNome('');
    setDescricao('');
    setValorDiaria('');
    setModalOpen(true);
  }

  function openEdit(item: Categoria) {
    setEditing(item);
    setNome(item.nome);
    setDescricao(item.descricao);
    setValorDiaria(String(item.valorDiaria));
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const parsedDiaria = Number(valorDiaria);
    if (Number.isNaN(parsedDiaria) || parsedDiaria <= 0) {
      setError('Informe um valor de diária válido e positivo.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        valorDiaria: parsedDiaria,
      };
      if (editing) {
        await api.categorias.update(editing.id, payload);
        setSuccess(`Categoria "${payload.nome}" atualizada com sucesso.`);
      } else {
        await api.categorias.create(payload);
        setSuccess(`Categoria "${payload.nome}" cadastrada com sucesso.`);
      }
      setModalOpen(false);
      await loadCategorias(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Categoria) {
    if (!window.confirm(`Deseja realmente excluir a categoria "${item.nome}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await api.categorias.delete(item.id);
      setSuccess(`Categoria "${item.nome}" excluída com sucesso.`);
      await loadCategorias(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir categoria.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categorias</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerenciamento de categorias e tarifas diárias dos veículos.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-4"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Nome ou Descrição
          </label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Ex: SUV, Luxo..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Diária Mínima (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtroValorMin}
            onChange={(e) => setFiltroValorMin(e.target.value)}
            placeholder="80.00"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Diária Máxima (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtroValorMax}
            onChange={(e) => setFiltroValorMax(e.target.value)}
            placeholder="400.00"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nome</th>
                <th className="px-5 py-3.5">Descrição</th>
                <th className="px-5 py-3.5">Valor da Diária</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Carregando categorias...
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                categorias.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{item.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{item.nome}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.descricao || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {formatCurrency(item.valorDiaria)} / dia
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item)}
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
        title={editing ? 'Editar Categoria' : 'Nova Categoria'}
        subtitle="Defina a classificação e o valor padrão da diária."
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: SUV Premium"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              rows={3}
              maxLength={500}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Características da categoria..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Valor da Diária (R$) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              placeholder="250.00"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
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
              {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
