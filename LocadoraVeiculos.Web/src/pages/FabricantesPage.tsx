import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Fabricante } from '../types/models';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';

export function FabricantesPage() {
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros personalizados (2 campos: nome e paisOrigem)
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPais, setFiltroPais] = useState('');

  // Modal Criar / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fabricante | null>(null);
  const [nome, setNome] = useState('');
  const [paisOrigem, setPaisOrigem] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadFabricantes(params?: { nome?: string; paisOrigem?: string }) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fabricantes.list(params);
      setFabricantes(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar fabricantes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFabricantes();
  }, []);

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    void loadFabricantes({ nome: filtroNome.trim(), paisOrigem: filtroPais.trim() });
  }

  function handleResetFilters() {
    setFiltroNome('');
    setFiltroPais('');
    void loadFabricantes();
  }

  function openCreate() {
    setEditing(null);
    setNome('');
    setPaisOrigem('');
    setModalOpen(true);
  }

  function openEdit(item: Fabricante) {
    setEditing(item);
    setNome(item.nome);
    setPaisOrigem(item.paisOrigem);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editing) {
        await api.fabricantes.update(editing.id, { nome: nome.trim(), paisOrigem: paisOrigem.trim() });
        setSuccess(`Fabricante "${nome.trim()}" atualizado com sucesso.`);
      } else {
        await api.fabricantes.create({ nome: nome.trim(), paisOrigem: paisOrigem.trim() });
        setSuccess(`Fabricante "${nome.trim()}" cadastrado com sucesso.`);
      }
      setModalOpen(false);
      await loadFabricantes({ nome: filtroNome.trim(), paisOrigem: filtroPais.trim() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar fabricante.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Fabricante) {
    if (!window.confirm(`Deseja realmente excluir o fabricante "${item.nome}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await api.fabricantes.delete(item.id);
      setSuccess(`Fabricante "${item.nome}" excluído com sucesso.`);
      await loadFabricantes({ nome: filtroNome.trim(), paisOrigem: filtroPais.trim() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir fabricante.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fabricantes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastro, edição, exclusão e pesquisa por nome e país de origem.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Fabricante
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Barra de Filtros */}
      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Nome do Fabricante
          </label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Ex: Toyota, Honda..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            País de Origem
          </label>
          <input
            type="text"
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
            placeholder="Ex: Japão, Alemanha..."
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
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nome</th>
                <th className="px-5 py-3.5">País de Origem</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Carregando fabricantes...
                  </td>
                </tr>
              ) : fabricantes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Nenhum fabricante encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                fabricantes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{item.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{item.nome}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.paisOrigem || '—'}</td>
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
        title={editing ? 'Editar Fabricante' : 'Novo Fabricante'}
        subtitle="Preencha os dados da montadora."
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
              placeholder="Ex: Toyota"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">País de Origem</label>
            <input
              type="text"
              maxLength={100}
              value={paisOrigem}
              onChange={(e) => setPaisOrigem(e.target.value)}
              placeholder="Ex: Japão"
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
