import React from 'react';

const EntradaMpPolietilenCards = ({ materiasPrimas, loading, onNuevaEntrada }) => {

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
          <h2 className="text-xl font-semibold text-gray-900">Materias Primas de Polietileno - Registrar Entradas</h2>
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
        <h2 className="text-xl font-semibold text-gray-900">📥 Materias Primas de Polietileno - Registrar Entradas</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona una materia prima de polietileno para registrar una nueva entrada al almacén</p>
      </div>

      <div className="p-6">
        {materiasPrimas?.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">🛢️</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay materias primas de polietileno registradas</h3>
            <p className="text-gray-500 mt-2">Ve al tab "Materia Prima" para crear tu primera materia prima de polietileno</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materiasPrimas?.map((mp) => (
              <div
                key={mp.materia_prima_id}
                className="border rounded-lg p-6 hover:shadow-lg transition-all"
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
                <div className="mb-4">
                  <div className={`px-3 py-2 rounded-md text-center text-sm font-medium ${
                    mp.estado_stock === 'BAJO'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {mp.estado_stock === 'BAJO' ? '⚠️ Stock Bajo' : '✅ Stock OK'}
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

                {/* Botón de nueva entrada */}
                <button
                  onClick={() => onNuevaEntrada(mp)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  📥 Nueva Entrada
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntradaMpPolietilenCards;