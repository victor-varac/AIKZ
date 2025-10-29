import React, { useState } from 'react';
import { useClientesData } from '../../hooks/useClientesData';
import ClienteCard from './ClienteCard';
import FiltrosClientes from './FiltrosClientes';
import ClienteForm from './ClienteForm';

const ClientesList = () => {
  const {
    clientes,
    loading,
    hasMore,
    error,
    totalCount,
    filtros,
    loadMore,
    applyFilters,
    resetFilters,
    refresh
  } = useClientesData();

  const [showClienteForm, setShowClienteForm] = useState(false);

  const handleCardClick = (cliente) => {
    console.log('Clicked cliente:', cliente);
    // Aquí puedes agregar navegación al detalle o abrir un modal
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const handleClienteCreated = (nuevoCliente) => {
    console.log('Nuevo cliente creado:', nuevoCliente);
    refresh(); // Recargar la lista para mostrar el nuevo cliente
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar los clientes
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={refresh}
                    className="bg-red-100 px-2 py-1 text-sm text-red-800 rounded hover:bg-red-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
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
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
              <p className="mt-2 text-gray-600">
                Gestiona tu cartera de clientes y sus datos comerciales
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalCount > 0 ? `${clientes.length} de ${totalCount} clientes` : 'Sin clientes'}
              </span>
              <button
                onClick={() => setShowClienteForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ➕ Nuevo Cliente
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosClientes
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          loading={loading}
        />

        {/* Estadísticas rápidas */}
        {clientes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Total Clientes</div>
              <div className="text-2xl font-bold text-gray-900">{clientes.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Clientes Activos</div>
              <div className="text-2xl font-bold text-green-600">
                {clientes.filter(c => c.estado).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Con Vendedor</div>
              <div className="text-2xl font-bold text-blue-600">
                {clientes.filter(c => c.vendedor && c.vendedor !== 'Sin asignar').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Con Crédito</div>
              <div className="text-2xl font-bold text-purple-600">
                {clientes.filter(c => c.dias_credito > 0).length}
              </div>
            </div>
          </div>
        )}

        {/* Lista de cards */}
        {clientes.length === 0 && !loading ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.keys(filtros).length > 0
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Comienza agregando un nuevo cliente.'}
            </p>
            {Object.keys(filtros).length > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && clientes.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón Cargar más */}
        {hasMore && clientes.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </div>
              ) : (
                'Cargar más (15 clientes)'
              )}
            </button>
          </div>
        )}

        {/* Indicador de fin de resultados */}
        {!hasMore && clientes.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Has visto todos los clientes disponibles
            </p>
          </div>
        )}

        {/* Modal de nuevo cliente */}
        <ClienteForm
          isOpen={showClienteForm}
          onClose={() => setShowClienteForm(false)}
          onClienteCreated={handleClienteCreated}
        />
      </div>
    </div>
  );
};

export default ClientesList;