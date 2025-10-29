import React from 'react';

const SalidaMpPolietilenCards = ({ materiasPrimas, loading, onNuevaSalida }) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  const getTipoDisplayName = (tipo) => {
    const tipos = {
      'resina_virgen_natural': 'Resina Virgen Natural',
      'resina_virgen_color': 'Resina Virgen Color',
      'arana_bolsas': 'Araña para Bolsas',
      'pellet_reciclado': 'Pellet Reciclado'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      'resina_virgen_natural': '🔹',
      'resina_virgen_color': '🎨',
      'arana_bolsas': '🕷️',
      'pellet_reciclado': '♻️'
    };
    return iconos[tipo] || '🛢️';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'resina_virgen_natural': 'bg-blue-100 text-blue-800',
      'resina_virgen_color': 'bg-purple-100 text-purple-800',
      'arana_bolsas': 'bg-yellow-100 text-yellow-800',
      'pellet_reciclado': 'bg-green-100 text-green-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Materias Primas de Polietileno - Registrar Salidas</h2>
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
        <h2 className="text-xl font-semibold text-gray-900">📤 Materias Primas de Polietileno - Registrar Salidas</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima de polietileno para registrar una salida, consumo o transferencia</p>
      </div>

      <div className="p-6">
        {materiasPrimas?.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📤</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay materias primas de polietileno disponibles</h3>
            <p className="text-gray-500 mt-2">Ve al tab "Materia Prima" para crear materias primas o al tab "Entrada" para añadir stock</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materiasPrimas?.map((mp) => {
              const stockDisponible = mp.stock_actual || 0;
              const stockBajo = stockDisponible <= (mp.stock_minimo || 0);
              const sinStock = stockDisponible <= 0;

              return (
                <div
                  key={mp.materia_prima_id}
                  className={`border rounded-lg p-6 hover:shadow-lg transition-all ${
                    sinStock ? 'bg-gray-50 border-gray-200' : 'hover:shadow-lg'
                  }`}
                >
                  {/* Header de la materia prima */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {mp.nombre}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(mp.tipo)}`}>
                            {getTipoIcon(mp.tipo)} {getTipoDisplayName(mp.tipo)}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {mp.unidad_medida}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${sinStock ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatNumber(stockDisponible)}
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

                  {/* Estado del stock */}
                  <div className="mb-4">
                    <div className={`px-3 py-2 rounded-md text-center text-sm font-medium ${
                      sinStock
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : stockBajo
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {sinStock ? '❌ Sin Stock' : stockBajo ? '⚠️ Stock Bajo' : '✅ Stock OK'}
                    </div>
                  </div>

                  {/* Precio promedio */}
                  {mp.precio_promedio && (
                    <div className="mb-4 text-center">
                      <div className="text-sm text-gray-600">Precio Promedio</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(mp.precio_promedio)}
                      </div>
                    </div>
                  )}

                  {/* Procesamiento */}
                  {mp.requiere_procesamiento && (
                    <div className="mb-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        🔄 Requiere Procesamiento
                      </span>
                      {mp.proceso_asociado && (
                        <div className="text-xs text-gray-500 mt-1">
                          Proceso: {mp.proceso_asociado}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advertencia de stock bajo */}
                  {stockBajo && !sinStock && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="text-xs text-yellow-800">
                        ⚠️ Stock por debajo del mínimo recomendado
                      </div>
                    </div>
                  )}

                  {/* Advertencia de sin stock */}
                  {sinStock && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-xs text-red-800">
                        ❌ No hay stock disponible para salidas
                      </div>
                    </div>
                  )}

                  {/* Botón de nueva salida */}
                  <button
                    onClick={() => onNuevaSalida(mp)}
                    disabled={sinStock}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      sinStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    📤 {sinStock ? 'Sin Stock' : 'Nueva Salida'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalidaMpPolietilenCards;