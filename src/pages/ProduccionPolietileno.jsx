import React from 'react';

const ProduccionPolietileno = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🛢️ Producción Polietileno
          </h1>
          <p className="text-gray-600 mt-1">
            Control de producción, extrusión y transformación de polietileno
          </p>
        </div>

        {/* Mensaje de próximamente */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <span className="text-6xl">🚧</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Módulo en Pausa
          </h2>

          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            El módulo de Producción de Polietileno permitirá gestionar todo el proceso
            productivo desde materia prima hasta producto terminado, incluyendo el proceso de pelletizado
            para conversión de araña a pellet reciclado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🏭 Control de Producción</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Planificación de órdenes de producción</li>
                <li>• Seguimiento de extrusión en tiempo real</li>
                <li>• Control de temperatura y presión</li>
                <li>• Registro de velocidades de máquina</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">⚖️ Gestión de Materia Prima</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Consumo de resina_virgen_natural/color</li>
                <li>• Uso de pellet_reciclado del proceso_pelletizado</li>
                <li>• Integración con almacen_materia_prima_movimientos</li>
                <li>• Control de arana_bolsas para reciclaje</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">🔧 Especificaciones Técnicas</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Control de ancho_cm por producto</li>
                <li>• Registro por kilos producidos</li>
                <li>• Configuración por turno (matutino/vespertino/nocturno)</li>
                <li>• Gestión de tipos (mordaza/lateral/pegol/bolsas/etc)</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">📊 Reportes Productivos</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Rendimiento por turno en kilos</li>
                <li>• Análisis de eficiencia energética</li>
                <li>• Costos de producción por kg</li>
                <li>• KPIs de productividad</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">🔬 Control de Calidad</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Pruebas de resistencia</li>
                <li>• Control de transparencia</li>
                <li>• Medición de espesor</li>
                <li>• Certificados de calidad</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">📦 Almacenamiento</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Registro automático por kilos</li>
                <li>• Etiquetado con peso neto</li>
                <li>• Control de lotes producidos</li>
                <li>• Transferencia a inventario</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center p-4 bg-gray-100 rounded-lg">
              <span className="text-2xl mr-3">🗃️</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Estructura BD Disponible</p>
                <p className="text-sm text-gray-600">
                  Ya tienes <code>produccion_polietileno</code> (fecha, turno, maquina, productos_id, kilos, operador),
                  <code>almacen_polietileno_movimientos</code> y <code>vista_inventario_polietileno</code>
                  listas para implementar la funcionalidad completa.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
            <p className="text-yellow-800 text-sm">
              <span className="font-semibold">💡 Mientras tanto:</span>
              Puedes usar el módulo de <strong>Almacén Polietileno</strong> que ya está disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduccionPolietileno;