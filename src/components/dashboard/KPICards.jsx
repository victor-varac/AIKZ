import React from 'react';

const KPICards = ({ data }) => {
  const kpis = [
    {
      title: 'Ventas del Mes',
      value: data?.ventasDelMes || 0,
      format: 'currency',
      icon: '💰',
      color: 'bg-green-500',
      change: data?.cambioVentas || 0,
      changeType: data?.cambioVentas >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Órdenes Activas',
      value: data?.ordenesActivas || 0,
      format: 'number',
      icon: '📝',
      color: 'bg-blue-500',
      change: data?.cambioOrdenes || 0,
      changeType: data?.cambioOrdenes >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Stock Crítico',
      value: data?.stockCritico || 0,
      format: 'number',
      icon: '⚠️',
      color: 'bg-red-500',
      change: data?.cambioStock || 0,
      changeType: data?.cambioStock <= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Clientes Activos',
      value: data?.clientesActivos || 0,
      format: 'number',
      icon: '👥',
      color: 'bg-purple-500',
      change: data?.cambioClientes || 0,
      changeType: data?.cambioClientes >= 0 ? 'positive' : 'negative'
    }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const getChangeIcon = (changeType) => {
    return changeType === 'positive' ? '↗️' : '↘️';
  };

  const getChangeColor = (changeType) => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {kpi.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(kpi.value, kpi.format)}
              </p>

              {/* Cambio respecto al período anterior */}
              {kpi.change !== undefined && kpi.change !== 0 && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(kpi.changeType)}`}>
                  <span className="mr-1">{getChangeIcon(kpi.changeType)}</span>
                  <span>
                    {Math.abs(kpi.change)}% vs mes anterior
                  </span>
                </div>
              )}
            </div>

            {/* Icono con fondo de color */}
            <div className={`${kpi.color} rounded-full p-3 ml-4`}>
              <span className="text-white text-xl">
                {kpi.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;