import React from 'react';

const FiltrosCuentasPorCobrar = ({ filtros, onFilterChange, onClearFilters }) => {
  const handleInputChange = (field, value) => {
    onFilterChange(field, value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">🔍 Filtros</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <input
            type="text"
            value={filtros.cliente}
            onChange={(e) => handleInputChange('cliente', e.target.value)}
            placeholder="Nombre del cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="VIGENTE">Vigente</option>
            <option value="VENCIDA">Vencida</option>
            <option value="PAGADA">Pagada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto mínimo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtros.montoMinimo}
            onChange={(e) => handleInputChange('montoMinimo', e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto máximo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtros.montoMaximo}
            onChange={(e) => handleInputChange('montoMaximo', e.target.value)}
            placeholder="Sin límite"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filtros.soloConSaldo}
            onChange={(e) => handleInputChange('soloConSaldo', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Solo mostrar cuentas con saldo pendiente
          </span>
        </label>
      </div>
    </div>
  );
};

export default FiltrosCuentasPorCobrar;