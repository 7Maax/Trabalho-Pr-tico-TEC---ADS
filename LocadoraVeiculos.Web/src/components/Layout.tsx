import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Car,
  CarFront,
  Factory,
  FileKey2,
  LayoutDashboard,
  Menu,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alugueis', label: 'Aluguéis', icon: FileKey2 },
  { to: '/veiculos', label: 'Veículos', icon: Car },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/fabricantes', label: 'Fabricantes', icon: Factory },
  { to: '/categorias', label: 'Categorias', icon: Tags },
  { to: '/consultas', label: 'Consultas & JOINs', icon: BarChart3 },
];

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-base font-bold tracking-tight text-white">
            LocadoraVeiculos
          </span>
          <span className="block text-[11px] font-medium text-slate-400">
            Gestão Integrada • TP2
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">API REST Conectada</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-emerald-400">
            {API_BASE_URL}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64">{sidebarContent}</div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="relative z-10 m-3 h-10 w-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-slate-900">LocadoraVeiculos</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
