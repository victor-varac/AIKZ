import React, { useState } from 'react';
import EstadoCuentas from '../components/cuentas-por-pagar/EstadoCuentas';
import GestionFacturas from '../components/cuentas-por-pagar/GestionFacturas';
import ControlPagos from '../components/cuentas-por-pagar/ControlPagos';
import ReportesCuentasPagar from '../components/cuentas-por-pagar/ReportesCuentasPagar';
import GestionGastos from '../components/cuentas-por-pagar/GestionGastos';

const CuentasPorPagar = () => {
  const [activeTab, setActiveTab] = useState('estado');

  const tabs = [
    {
      id: 'estado',
      label: 'Estado de Cuentas',
      icon: '📊',
      component: EstadoCuentas,
    },
    {
      id: 'facturas',
      label: 'Gestión de Facturas',
      icon: '🧾',
      component: GestionFacturas,
    },
    {
      id: 'pagos',
      label: 'Control de Pagos',
      icon: '💰',
      component: ControlPagos,
    },
    {
      id: 'gastos',
      label: 'Gastos',
      icon: '💳',
      component: GestionGastos,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '📈',
      component: ReportesCuentasPagar,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            💸 Cuentas por Pagar
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión integral de pagos a proveedores y control de egresos
          </p>
        </div>

        {/* Navegación de Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido del Tab Activo */}
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuentasPorPagar;