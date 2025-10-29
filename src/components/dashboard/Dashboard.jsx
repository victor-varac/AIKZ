import React, { useState, useEffect } from 'react';
import KPICards from './KPICards';
import InventoryStatus from './InventoryStatus';
import SalesChart from './SalesChart';
import RecentOrders from './RecentOrders';
import TopClients from './TopClients';
import VendedorPerformance from './VendedorPerformance';
import QuickActions from './QuickActions';
import { getDashboardData } from '../../services/api/dashboard';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar el dashboard</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Dashboard Ejecutivo
              </h1>
              <p className="mt-2 text-gray-600">
                Resumen general de la actividad empresarial - AIKZ
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          // Loading state
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg p-6 shadow">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg p-6 shadow">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Dashboard content
          <div className="space-y-6">
            {/* Acciones Rápidas */}
            <QuickActions dashboardData={dashboardData} />

            {/* KPIs principales */}
            <KPICards data={dashboardData?.kpis} />

            {/* Gráfico de ventas - Ancho completo */}
            <SalesChart data={dashboardData?.salesChart} />

            {/* Estado del inventario - Ancho completo */}
            <InventoryStatus data={dashboardData?.inventory} />

            {/* Grid secundario */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pedidos recientes */}
              <RecentOrders data={dashboardData?.recentOrders} />

              {/* Top clientes */}
              <TopClients data={dashboardData?.topClients} />

              {/* Rendimiento vendedores */}
              <VendedorPerformance data={dashboardData?.vendedores} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;