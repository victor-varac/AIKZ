import React, { useState } from 'react';
import { useVendedoresData } from '../../hooks/useVendedoresData';
import FiltrosVendedores from './FiltrosVendedores';
import VendedorCard from './VendedorCard';
import VendedorForm from './VendedorForm';

const VendedoresList = () => {
  const {
    vendedores,
    loading,
    hasMore,
    error,
    totalCount,
    filtros,
    loadMore,
    applyFilters,
    resetFilters,
    refresh
  } = useVendedoresData();

  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [showVendedorForm, setShowVendedorForm] = useState(false);

  const handleVendedorClick = (vendedor) => {
    setSelectedVendedor(vendedor);
    console.log('Vendedor seleccionado:', vendedor);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const handleVendedorCreated = (nuevoVendedor) => {
    console.log('Nuevo vendedor creado:', nuevoVendedor);
    refresh(); // Recargar la lista para mostrar el nuevo vendedor
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤝 Vendedores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu equipo de ventas y consulta estadísticas detalladas
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando {vendedores.length} de {totalCount} vendedores
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowVendedorForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Vendedor</span>
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosVendedores
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        loading={loading}
      />

      {/* Contenido principal */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Error al cargar vendedores</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de vendedores */}
      {vendedores.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vendedores</h3>
          <p className="text-gray-500">
            {Object.keys(filtros).length > 0
              ? 'No se encontraron vendedores con los filtros aplicados'
              : 'Aún no tienes vendedores registrados en el sistema'
            }
          </p>
          {Object.keys(filtros).length > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {vendedores.length > 0 && (
        <div className="space-y-6">
          {/* Grid de vendedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vendedores.map((vendedor) => (
              <VendedorCard
                key={vendedor.id}
                vendedor={vendedor}
                onClick={handleVendedorClick}
              />
            ))}
          </div>

          {/* Loading inicial */}
          {loading && vendedores.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón cargar más */}
          {hasMore && !loading && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                <span>Cargar más vendedores</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Loading más datos */}
          {loading && vendedores.length > 0 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Cargando más vendedores...</span>
              </div>
            </div>
          )}

          {/* Indicador final */}
          {!hasMore && vendedores.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                Has visto todos los vendedores disponibles
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas de resumen */}
      {vendedores.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Resumen del equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">👥</span>
                <div>
                  <div className="font-medium text-gray-900">Total vendedores</div>
                  <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">📈</span>
                <div>
                  <div className="font-medium text-gray-900">En la lista actual</div>
                  <div className="text-2xl font-bold text-green-600">{vendedores.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">🔍</span>
                <div>
                  <div className="font-medium text-gray-900">Filtros activos</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {Object.keys(filtros).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo vendedor */}
      <VendedorForm
        isOpen={showVendedorForm}
        onClose={() => setShowVendedorForm(false)}
        onVendedorCreated={handleVendedorCreated}
      />
    </div>
  );
};

export default VendedoresList;