import React, { useState, useEffect, useRef } from 'react';
import { useNotasVenta } from '../../hooks/useNotasVenta';
import { useEstadisticasNotasVenta } from '../../hooks/useEstadisticasNotasVenta';
import NotaVentaCard from './NotaVentaCard';
import FiltrosNotasVenta from './FiltrosNotasVenta';
import NotaVentaForm from './NotaVentaForm';

const NotaVentasList = () => {
  const [showModal, setShowModal] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);

  const {
    notas,
    loading,
    hasMore,
    error,
    totalCount,
    filtros,
    loadMore,
    applyFilters,
    resetFilters,
    refresh,
    loadNotasWithCount
  } = useNotasVenta();

  const {
    estadisticas,
    loading: estadisticasLoading,
    refresh: refreshEstadisticas
  } = useEstadisticasNotasVenta();

  // Función para obtener el año actual
  const getCurrentYear = () => new Date().getFullYear();

  // Restaurar posición de scroll y cantidad de items cargados al regresar de detalles
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('notasVentaScrollPosition');
    const savedItemCount = sessionStorage.getItem('notasVentaItemCount');

    if (savedScrollPosition !== null && savedItemCount !== null && !loading) {
      setIsRestoringState(true);
      const scrollPos = parseInt(savedScrollPosition, 10);
      const itemCount = parseInt(savedItemCount, 10);

      // Si la cantidad de items guardados es mayor a la actual, cargar más items
      if (itemCount > notas.length) {
        loadNotasWithCount(itemCount).then(() => {
          // Una vez cargados, restaurar scroll con un pequeño delay
          setTimeout(() => {
            window.scrollTo(0, scrollPos);
            setIsRestoringState(false);
            // Limpiar sessionStorage
            sessionStorage.removeItem('notasVentaScrollPosition');
            sessionStorage.removeItem('notasVentaItemCount');
          }, 100);
        });
      } else {
        // Si no hay más items que cargar, solo restaurar el scroll
        window.scrollTo(0, scrollPos);
        setIsRestoringState(false);
        // Limpiar sessionStorage
        sessionStorage.removeItem('notasVentaScrollPosition');
        sessionStorage.removeItem('notasVentaItemCount');
      }
    }
  }, [loading, notas.length, loadNotasWithCount]);

  const handleCardClick = (nota) => {
    console.log('Clicked nota:', nota);
    // Aquí puedes agregar navegación al detalle o abrir un modal
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const handleNotaVentaSuccess = () => {
    refresh(); // Recargar la lista después de crear una nueva nota
    refreshEstadisticas(); // Recargar las estadísticas del año actual
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
                  Error al cargar las notas de venta
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
              <h1 className="text-3xl font-bold text-gray-900">📋 Pedidos (Notas de Venta)</h1>
              <p className="mt-2 text-gray-600">
                Gestiona las notas de venta y su estado de pagos, entregas y crédito
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalCount > 0 ? `${notas.length} de ${totalCount} registros` : 'Sin registros'}
              </span>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ➕ Nueva Nota de Venta
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
        <FiltrosNotasVenta
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          loading={loading}
        />

        {/* Estadísticas rápidas - Del año actual completo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {estadisticasLoading ? (
            <>
              <div className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Total Notas ({getCurrentYear()})</div>
                <div className="text-2xl font-bold text-gray-900">{estadisticas.totalNotas}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Pagadas Completo</div>
                <div className="text-2xl font-bold text-green-600">
                  {estadisticas.pagadasCompleto}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Entregadas Completo</div>
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas.entregadasCompleto}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Crédito Vencido</div>
                <div className="text-2xl font-bold text-red-600">
                  {estadisticas.creditoVencido}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Lista de cards */}
        {notas.length === 0 && !loading ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notas de venta</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.keys(filtros).length > 0
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Comienza creando una nueva nota de venta.'}
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
            {notas.map((nota) => (
              <NotaVentaCard
                key={nota.id}
                nota={nota}
                onClick={handleCardClick}
                totalNotasLoaded={notas.length}
              />
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && notas.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón Cargar más */}
        {hasMore && notas.length > 0 && (
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
                'Cargar más (15 registros)'
              )}
            </button>
          </div>
        )}

        {/* Indicador de fin de resultados */}
        {!hasMore && notas.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Has visto todas las notas de venta disponibles
            </p>
          </div>
        )}

        {/* Modal para nueva nota de venta */}
        <NotaVentaForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleNotaVentaSuccess}
        />
      </div>
    </div>
  );
};

export default NotaVentasList;