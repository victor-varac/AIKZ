import React from 'react';

const InventarioMpPolietilenTable = ({ inventario, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'BAJO':
        return 'bg-red-100 text-red-800';
      case 'OK':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'resina_virgen_natural':
        return 'Resina Virgen Natural';
      case 'resina_virgen_color':
        return 'Resina Virgen Color';
      case 'pellet_reciclado':
        return 'Pellet Reciclado';
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'resina_virgen_natural':
        return 'bg-blue-100 text-blue-800';
      case 'resina_virgen_color':
        return 'bg-purple-100 text-purple-800';
      case 'pellet_reciclado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inventario || inventario.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-5xl mb-4">🛢️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin inventario disponible</h3>
          <p className="text-gray-500">No hay materias primas de polietileno registradas en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">📊 Inventario Actual de Materia Prima</h3>
        <p className="text-sm text-gray-500 mt-1">
          Stock disponible de materias primas de polietileno
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventario.map((item) => (
              <tr key={item.materia_prima_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {item.nombre}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(item.tipo)}`}>
                    {getTipoLabel(item.tipo)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {formatNumber(item.stock_actual)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatNumber(item.stock_minimo)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(item.estado_stock)}`}>
                    {item.estado_stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unidad_medida}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Total de materiales: {inventario.length}
          </span>
          <div className="flex space-x-4">
            <span className="text-green-600">
              Stock OK: {inventario.filter(item => item.estado_stock === 'OK').length}
            </span>
            <span className="text-red-600">
              Stock Bajo: {inventario.filter(item => item.estado_stock === 'BAJO').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventarioMpPolietilenTable;