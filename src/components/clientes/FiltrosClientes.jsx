import React, { useState, useEffect } from 'react';
import { getVendedores } from '../../services/api/clientes';

const FiltrosClientes = ({ onApplyFilters, onResetFilters, loading }) => {
  const [filtros, setFiltros] = useState({
    empresa: '',
    nombre_contacto: '',
    vendedor_id: '',
    estado: '',
    dias_credito_min: '',
    dias_credito_max: '',
    correo: '',
    telefono: ''
  });

  const [vendedores, setVendedores] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    try {
      const data = await getVendedores();
      setVendedores(data || []);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      setVendedores([]);
    }
  };

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
      empresa: '',
      nombre_contacto: '',
      vendedor_id: '',
      estado: '',
      dias_credito_min: '',
      dias_credito_max: '',
      correo: '',
      telefono: ''
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
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros de Clientes</h3>
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
            {/* Búsqueda por empresa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Empresa
              </label>
              <input
                type="text"
                placeholder="Buscar por empresa..."
                value={filtros.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Búsqueda por contacto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre del contacto
              </label>
              <input
                type="text"
                placeholder="Buscar por contacto..."
                value={filtros.nombre_contacto}
                onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Vendedor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Vendedor
              </label>
              <select
                value={filtros.vendedor_id}
                onChange={(e) => handleInputChange('vendedor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los vendedores</option>
                {vendedores.map(vendedor => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="true">🟢 Activo</option>
                <option value="false">🔴 Inactivo</option>
              </select>
            </div>

            {/* Días de crédito mínimo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Días de crédito mínimo
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filtros.dias_credito_min}
                onChange={(e) => handleInputChange('dias_credito_min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Días de crédito máximo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Días de crédito máximo
              </label>
              <input
                type="number"
                placeholder="999"
                min="0"
                value={filtros.dias_credito_max}
                onChange={(e) => handleInputChange('dias_credito_max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Correo electrónico */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="Buscar por correo..."
                value={filtros.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="Buscar por teléfono..."
                value={filtros.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

export default FiltrosClientes;