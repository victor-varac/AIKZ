import React, { useState } from 'react';

const FiltrosVendedores = ({ onApplyFilters, onResetFilters, loading }) => {
  const [filtros, setFiltros] = useState({
    nombre: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    const filtrosSaneados = Object.fromEntries(
      Object.entries(filtros).filter(([_, value]) => value !== '')
    );
    onApplyFilters(filtrosSaneados);
  };

  const handleResetFilters = () => {
    setFiltros({
      nombre: ''
    });
    onResetFilters();
  };

  const hasActiveFilters = Object.values(filtros).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header del panel de filtros */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros de Vendedores</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetFilters();
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible de filtros */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Búsqueda por nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre del vendedor
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Información adicional */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h4 className="text-sm font-medium text-blue-900">Información de búsqueda</h4>
                </div>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Los cards muestran estadísticas en tiempo real de cada vendedor</li>
                  <li>• Puedes ver clientes asignados, ventas del mes y rendimiento</li>
                  <li>• Los indicadores de color muestran el nivel de performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Aplicando...' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosVendedores;