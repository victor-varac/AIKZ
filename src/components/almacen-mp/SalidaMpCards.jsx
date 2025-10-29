import React from 'react';

const SalidaMpCards = ({ materiasPrimas, loading, onNuevaSalida, onVerDetalles }) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Materias Primas - Registrar Salidas</h2>
          <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima para registrar una salida o consumo</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">📤 Materias Primas - Registrar Salidas</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima para registrar una salida, consumo o transferencia</p>
      </div>

      <div className="p-6">
        {materiasPrimas?.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📤</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay materias primas disponibles</h3>
            <p className="text-gray-500 mt-2">Ve al tab "Materia Prima" para crear materias primas o al tab "Entrada" para añadir stock</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materiasPrimas?.map((mp) => (
              <div
                key={mp.materia_prima_id}
                className="border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onVerDetalles && onVerDetalles(mp)}
              >
                {/* Header de la materia prima */}
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {mp.nombre}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {mp.unidad_medida}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 hover:text-blue-600">
                      📋
                    </div>
                  </div>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(mp.stock_actual)}
                    </div>
                    <div className="text-xs text-gray-600">Disponible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatNumber(mp.stock_minimo)}
                    </div>
                    <div className="text-xs text-gray-600">Stock Mínimo</div>
                  </div>
                </div>

                {/* Estado del stock y disponibilidad */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Disponibilidad:</h4>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mp.stock_actual <= 0
                        ? 'bg-red-100 text-red-800'
                        : mp.stock_actual <= mp.stock_minimo
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {mp.stock_actual <= 0
                        ? '❌ Sin Stock'
                        : mp.stock_actual <= mp.stock_minimo
                        ? '⚠️ Stock Bajo'
                        : '✅ Disponible'
                      }
                    </span>
                    {mp.stock_actual <= mp.stock_minimo && mp.stock_actual > 0 && (
                      <span className="text-xs text-yellow-600 font-medium">
                        ¡Cuidado con el stock!
                      </span>
                    )}
                    {mp.stock_actual <= 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        Sin material disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Información de consumo disponible */}
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-600">Máximo a consumir:</span>
                  <span className={`font-medium ${
                    mp.stock_actual > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {formatNumber(mp.stock_actual)} {mp.unidad_medida}
                  </span>
                </div>

                {/* Advertencia si está cerca del mínimo */}
                {mp.stock_actual > 0 && mp.stock_actual <= mp.stock_minimo && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <div className="text-xs text-yellow-700">
                      <strong>⚠️ Precaución:</strong> El consumo puede dejar el stock por debajo del mínimo requerido.
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNuevaSalida && onNuevaSalida(mp);
                    }}
                    disabled={mp.stock_actual <= 0}
                    className={`w-full text-white text-sm px-4 py-2 rounded transition-colors flex items-center justify-center ${
                      mp.stock_actual <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : mp.stock_actual <= mp.stock_minimo
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <span className="mr-2">📤</span>
                    {mp.stock_actual <= 0
                      ? 'Sin Stock Disponible'
                      : mp.stock_actual <= mp.stock_minimo
                      ? 'Consumir (¡Cuidado!)'
                      : 'Registrar Salida'
                    }
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerDetalles && onVerDetalles(mp);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📋</span>
                    Ver Historial de Movimientos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalidaMpCards;