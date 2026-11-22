import { FormEvent, useEffect, useState } from 'react';
import { History, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Aluguel, Cliente } from '../types/models';
import { formatCurrency, formatDate, toDateInputValue } from '../utils/formatters';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros personalizados (3 campos: nome, cpf, email)
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');

  // Modal Criar / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnh, setCnh] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal Histórico do Cliente (GET /api/alugueis/cliente/{clienteId})
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyClient, setHistoryClient] = useState<Cliente | null>(null);
  const [historyAlugueis, setHistoryAlugueis] = useState<Aluguel[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadClientes(params?: { nome?: string; cpf?: string; email?: string }) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.clientes.list(params);
      setClientes(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar clientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClientes();
  }, []);

  function currentFilters() {
    return {
      nome: filtroNome.trim(),
      cpf: filtroCpf.trim(),
      email: filtroEmail.trim(),
    };
  }

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    void loadClientes(currentFilters());
  }

  function handleResetFilters() {
    setFiltroNome('');
    setFiltroCpf('');
    setFiltroEmail('');
    void loadClientes();
  }

  function openCreate() {
    setEditing(null);
    setNome('');
    setCpf('');
    setEmail('');
    setTelefone('');
    setCnh('');
    setDataNascimento('1995-01-01');
    setModalOpen(true);
  }

  function openEdit(item: Cliente) {
    setEditing(item);
    setNome(item.nome);
    setCpf(item.cpf);
    setEmail(item.email);
    setTelefone(item.telefone);
    setCnh(item.cnh);
    setDataNascimento(toDateInputValue(item.dataNascimento));
    setModalOpen(true);
  }

  async function openHistory(client: Cliente) {
    setHistoryClient(client);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const list = await api.alugueis.getByCliente(client.id);
      setHistoryAlugueis(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar histórico do cliente.');
      setHistoryAlugueis([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cnh: cnh.trim(),
        dataNascimento: dataNascimento ? `${dataNascimento}T00:00:00` : '1990-01-01T00:00:00',
      };

      if (editing) {
        await api.clientes.update(editing.id, payload);
        setSuccess(`Cliente "${payload.nome}" atualizado com sucesso.`);
      } else {
        await api.clientes.create(payload);
        setSuccess(`Cliente "${payload.nome}" cadastrado com sucesso.`);
      }
      setModalOpen(false);
      await loadClientes(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar cliente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Cliente) {
    if (!window.confirm(`Deseja realmente excluir o cliente "${item.nome}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await api.clientes.delete(item.id);
      setSuccess(`Cliente "${item.nome}" excluído com sucesso.`);
      await loadClientes(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir cliente.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestão da carteira de clientes com filtros por nome, CPF e e-mail e consulta de histórico.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Barra de Filtros */}
      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:grid-cols-4"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Nome</label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Ex: Carlos..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">CPF</label>
          <input
            type="text"
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">E-mail</label>
          <input
            type="text"
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
            placeholder="cliente@email.com"
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

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Nome</th>
                <th className="px-5 py-3.5">CPF</th>
                <th className="px-5 py-3.5">Contato</th>
                <th className="px-5 py-3.5">CNH</th>
                <th className="px-5 py-3.5">Nascimento</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Carregando clientes...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{c.nome}</div>
                      <div className="text-xs text-slate-500">
                        Cadastro: {formatDate(c.dataCadastro)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{c.cpf}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-700">{c.email}</div>
                      <div className="text-xs text-slate-500">{c.telefone || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                      {c.cnh || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(c.dataNascimento)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void openHistory(c)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                          title="Histórico de Aluguéis"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(c)}
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

      {/* Modal Criar/Editar */}
      <Modal
        open={modalOpen}
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle="CPF e e-mail devem ser únicos no sistema."
        onClose={() => setModalOpen(false)}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome Completo *</label>
            <input
              type="text"
              required
              maxLength={200}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Eduardo Pereira"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">CPF *</label>
            <input
              type="text"
              required
              maxLength={14}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="123.456.789-10"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail *</label>
            <input
              type="email"
              required
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@email.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
            <input
              type="text"
              maxLength={20}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(31) 98765-4321"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">CNH</label>
            <input
              type="text"
              maxLength={20}
              value={cnh}
              onChange={(e) => setCnh(e.target.value)}
              placeholder="98765432100"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
              {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Histórico do Cliente */}
      <Modal
        open={historyOpen}
        title={`Histórico de Locações — ${historyClient?.nome ?? ''}`}
        subtitle="Rota consumida: GET /api/alugueis/cliente/{clienteId}"
        onClose={() => setHistoryOpen(false)}
        maxWidthClass="max-w-2xl"
      >
        {historyLoading ? (
          <p className="py-6 text-center text-sm text-slate-400">Carregando histórico...</p>
        ) : historyAlugueis.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Este cliente ainda não realizou nenhuma locação.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Veículo</th>
                  <th className="px-3 py-2">Período</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyAlugueis.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500">#{a.id}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{a.veiculo}</div>
                      <div className="font-mono text-xs text-slate-500">{a.placa}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">
                      {formatDate(a.dataInicio)} → {formatDate(a.dataDevolucao ?? a.dataFimPrevista)}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {formatCurrency(a.valorTotal)}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
