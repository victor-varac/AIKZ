import React from 'react';

const EntradaMpCards = ({ materiasPrimas, loading, onNuevaEntrada, onVerDetalles }) => {

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
          <h2 className="text-xl font-semibold text-gray-900">Materias Primas - Registrar Entradas</h2>
          <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima para registrar una nueva entrada</p>
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
        <h2 className="text-xl font-semibold text-gray-900">📥 Materias Primas - Registrar Entradas</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima para registrar una nueva entrada al almacén</p>
      </div>

      <div className="p-6">
        {materiasPrimas?.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📋</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay materias primas registradas</h3>
            <p className="text-gray-500 mt-2">Ve al tab "Materia Prima" para crear tu primera materia prima</p>
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
                    <div className="text-xs text-gray-600">Stock Actual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatNumber(mp.stock_minimo)}
                    </div>
                    <div className="text-xs text-gray-600">Stock Mínimo</div>
                  </div>
                </div>

                {/* Estado del stock */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Estado del Stock:</h4>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mp.estado_stock === 'BAJO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {mp.estado_stock === 'BAJO' ? '⚠️ Stock Bajo' : '✅ Stock OK'}
                    </span>
                    {mp.estado_stock === 'BAJO' && (
                      <span className="text-xs text-red-600 font-medium">
                        ¡Necesita reposición!
                      </span>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-600">Diferencia:</span>
                  <span className={`font-medium ${
                    (mp.stock_actual - mp.stock_minimo) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mp.stock_actual >= mp.stock_minimo ? '+' : ''}{formatNumber(mp.stock_actual - mp.stock_minimo)} {mp.unidad_medida}
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNuevaEntrada && onNuevaEntrada(mp);
                    }}
                    className={`w-full text-white text-sm px-4 py-2 rounded transition-colors flex items-center justify-center ${
                      mp.estado_stock === 'BAJO'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <span className="mr-2">📥</span>
                    {mp.estado_stock === 'BAJO' ? 'Reabastecer Urgente' : 'Añadir Nueva Entrada'}
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

export default EntradaMpCards;