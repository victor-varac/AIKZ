import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import ProductosList from './components/productos/ProductosList';
import ClientesList from './components/clientes/ClientesList';
import VendedoresList from './components/vendedores/VendedoresList';
import DetalleNotaVenta from './pages/DetalleNotaVenta';
import DetalleCliente from './pages/DetalleCliente';
import DetalleVendedor from './pages/DetalleVendedor';
import AlmacenCelofan from './pages/AlmacenCelofan';
import AlmacenPolietileno from './pages/AlmacenPolietileno';
import AlmacenMpCelofan from './pages/AlmacenMpCelofan';
import AlmacenMpPolietileno from './pages/AlmacenMpPolietileno';
import DashboardFinanciero from './pages/DashboardFinanciero';
import CuentasPorCobrar from './pages/CuentasPorCobrar';
import CuentasPorPagar from './pages/CuentasPorPagar';
import ReportesContables from './pages/ReportesContables';
import ProveedoresCelofan from './pages/ProveedoresCelofan';
import ProveedoresPolietileno from './pages/ProveedoresPolietileno';
import ProduccionCelofan from './pages/ProduccionCelofan';
import ProduccionPolietileno from './pages/ProduccionPolietileno';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/:id" element={<DetalleNotaVenta />} />
          <Route path="/productos" element={<ProductosList />} />
          <Route path="/productos/:material" element={<ProductosList />} />
          <Route path="/clientes" element={<ClientesList />} />
          <Route path="/clientes/:id" element={<DetalleCliente />} />
          <Route path="/vendedores" element={<VendedoresList />} />
          <Route path="/vendedores/:id" element={<DetalleVendedor />} />
          <Route path="/almacen/celofan" element={<AlmacenCelofan />} />
          <Route path="/almacen/polietileno" element={<AlmacenPolietileno />} />
          <Route path="/almacen-mp/celofan" element={<AlmacenMpCelofan />} />
          <Route path="/almacen-mp/polietileno" element={<AlmacenMpPolietileno />} />
          <Route path="/finanzas/dashboard" element={<DashboardFinanciero />} />
          <Route path="/finanzas/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
          <Route path="/finanzas/cuentas-por-pagar" element={<CuentasPorPagar />} />
          <Route path="/finanzas/reportes" element={<ReportesContables />} />
          <Route path="/produccion/celofan" element={<ProduccionCelofan />} />
          <Route path="/produccion/polietileno" element={<ProduccionPolietileno />} />
          <Route path="/proveedores/celofan" element={<ProveedoresCelofan />} />
          <Route path="/proveedores/polietileno" element={<ProveedoresPolietileno />} />
          {/* Agregar más rutas aquí según sea necesario */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;