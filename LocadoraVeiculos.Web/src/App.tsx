import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { FabricantesPage } from './pages/FabricantesPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { VeiculosPage } from './pages/VeiculosPage';
import { ClientesPage } from './pages/ClientesPage';
import { AlugueisPage } from './pages/AlugueisPage';
import { ConsultasPage } from './pages/ConsultasPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/fabricantes" element={<FabricantesPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/veiculos" element={<VeiculosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/alugueis" element={<AlugueisPage />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
