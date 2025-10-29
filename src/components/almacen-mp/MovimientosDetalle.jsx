import React, { useState, useEffect } from 'react';
import { getMovimientosMateriaPrima, deleteMovimientoMateriaPrima } from '../../services/api/almacenMp';

const MovimientosDetalle = ({ materiaPrima, onBack }) => {
  const [movimientosDetalle, setMovimientosDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (materiaPrima) {
      loadMovimientos();
    }
  }, [materiaPrima]);

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros = {
        materiaPrimaId: materiaPrima.materia_prima_id,
        movimiento: 'entrada' // Solo mostrar entradas
      };

      const movimientos = await getMovimientosMateriaPrima(filtros);

      // Procesar estadísticas de entradas (movimientos ya vienen filtrados)
      const estadisticas = {
        totalEntradas: movimientos.length,
        ultimaEntrada: movimientos.length > 0 ? movimientos[0] : null,
        totalCantidadEntradas: movimientos.reduce((sum, m) => sum + (parseFloat(m.cantidad) || 0), 0)
      };

      setMovimientosDetalle({
        entradas: movimientos,
        estadisticas
      });
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
      setError(err.message || 'Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntrada = async (entradaId) => {
    try {
      await deleteMovimientoMateriaPrima(entradaId);
      setShowDeleteConfirm(null);
      loadMovimientos();
    } catch (error) {
      console.error('Error al eliminar entrada:', error);
      alert('Error al eliminar la entrada. Por favor, inténtalo nuevamente.');
    }
  };

  const confirmDelete = (entrada) => {
    setShowDeleteConfirm(entrada);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar los datos</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={loadMovimientos}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={onBack}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Volver
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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2">←</span>
              Volver a Entradas
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📥 {materiaPrima?.nombre || 'Materia Prima sin nombre'}
              </h1>
              <div className="mt-2 text-gray-600">
                <span className="mr-4">Stock actual: {formatNumber(materiaPrima?.stock_actual)} {materiaPrima?.unidad_medida}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                  {materiaPrima?.unidad_medida}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {movimientosDetalle?.estadisticas?.totalEntradas || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Entradas</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(movimientosDetalle?.estadisticas?.totalCantidadEntradas || 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Cantidad Total Ingresada</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {movimientosDetalle?.estadisticas?.totalEntradas > 0
                  ? formatNumber(Math.round(movimientosDetalle.estadisticas.totalCantidadEntradas / movimientosDetalle.estadisticas.totalEntradas))
                  : 0
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">Promedio por Entrada</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {movimientosDetalle?.estadisticas?.ultimaEntrada
                  ? formatDateShort(movimientosDetalle.estadisticas.ultimaEntrada.fecha)
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">Última Entrada</div>
            </div>
          </div>
        </div>

        {/* Información de última entrada */}
        {movimientosDetalle?.estadisticas?.ultimaEntrada && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Última Entrada Registrada</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600">Fecha</div>
                <div className="text-lg font-medium">
                  {formatDate(movimientosDetalle.estadisticas.ultimaEntrada.fecha)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tipo</div>
                <div className="text-lg font-medium">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    📥 Entrada
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cantidad</div>
                <div className="text-lg font-medium text-green-600">
                  +{formatNumber(movimientosDetalle.estadisticas.ultimaEntrada.cantidad)} {materiaPrima?.unidad_medida}
                </div>
              </div>
              {movimientosDetalle.estadisticas.ultimaEntrada.proveedor && (
                <div>
                  <div className="text-sm text-gray-600">Proveedor</div>
                  <div className="text-lg font-medium">
                    {movimientosDetalle.estadisticas.ultimaEntrada.proveedor}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Historial completo de entradas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historial Completo de Entradas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {movimientosDetalle?.entradas?.length || 0} entradas registradas
            </p>
          </div>

          <div className="p-6">
            {movimientosDetalle?.entradas?.length > 0 ? (
              <div className="space-y-4">
                {movimientosDetalle.entradas.map((entrada, index) => (
                  <div key={entrada.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatDate(entrada.fecha)}
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            +{formatNumber(entrada.cantidad)} {materiaPrima?.unidad_medida}
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            📥 Entrada
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {entrada.precio_unitario && (
                            <div>
                              <strong>Precio unitario:</strong> {formatCurrency(entrada.precio_unitario)}
                            </div>
                          )}
                          {entrada.proveedor && (
                            <div>
                              <strong>Proveedor:</strong> {entrada.proveedor}
                            </div>
                          )}
                          {entrada.observaciones && (
                            <div>
                              <strong>Observaciones:</strong> {entrada.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-500">
                          #{entrada.id}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => confirmDelete(entrada)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                            title="Eliminar entrada"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">📥</span>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  No hay entradas registradas
                </h3>
                <p className="text-gray-500 mt-2">
                  Esta materia prima aún no tiene entradas registradas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
                <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta entrada del {formatDate(showDeleteConfirm.fecha)}
                con {formatNumber(showDeleteConfirm.cantidad)} {materiaPrima?.unidad_medida}?
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteEntrada(showDeleteConfirm.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimientosDetalle;