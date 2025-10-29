import React, { useState, useEffect } from 'react';
import { getClientes } from '../../services/api/clientes';

const FiltrosNotasVenta = ({ onApplyFilters, onResetFilters, loading }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    estadoPago: '',
    estadoEntrega: '',
    estadoCredito: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await getClientes({ limit: 1000 });
      setClientes(response.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
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
      fechaDesde: '',
      fechaHasta: '',
      cliente: '',
      estadoPago: '',
      estadoEntrega: '',
      estadoCredito: ''
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
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros</h3>
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
            {/* Rango de fechas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Búsqueda por cliente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              {loadingClientes ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-gray-500">Cargando clientes...</span>
                </div>
              ) : (
                <select
                  value={filtros.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.empresa} - {cliente.nombre_contacto}
                    </option>
                  ))}
                </select>
              )}
            </div>


            {/* Estado de pago */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado de pago
              </label>
              <select
                value={filtros.estadoPago}
                onChange={(e) => handleInputChange('estadoPago', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="parcial">Parcial</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            {/* Estado de entrega */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado de entrega
              </label>
              <select
                value={filtros.estadoEntrega}
                onChange={(e) => handleInputChange('estadoEntrega', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="completo">Completo</option>
                <option value="parcial">Parcial</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            {/* Estado de crédito */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado de crédito
              </label>
              <select
                value={filtros.estadoCredito}
                onChange={(e) => handleInputChange('estadoCredito', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="vigente">Vigente</option>
                <option value="por_vencer">Por vencer (7 días)</option>
                <option value="vencido">Vencido</option>
              </select>
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

export default FiltrosNotasVenta;