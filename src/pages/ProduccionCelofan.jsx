import React from 'react';

const ProduccionCelofan = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📄 Producción Celofán
          </h1>
          <p className="text-gray-600 mt-1">
            Control de producción, extrusión y transformación de celofán
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
            El módulo de Producción de Celofán permitirá gestionar todo el proceso
            productivo desde materia prima hasta producto terminado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🏭 Control de Producción</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Planificación de órdenes de producción</li>
                <li>• Seguimiento en tiempo real</li>
                <li>• Control de calidad integrado</li>
                <li>• Registro de tiempos y eficiencia</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🔄 Gestión de Materia Prima</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Consumo de celofan_rollo automático</li>
                <li>• Integración con almacen_materia_prima_movimientos</li>
                <li>• Control con vista_inventario_materia_prima</li>
                <li>• Alertas de stock_minimo por materia prima</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">📏 Especificaciones Técnicas</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Control de ancho_cm y largo_cm</li>
                <li>• Gestión de micraje_um (micrones)</li>
                <li>• Registro por millares producidos</li>
                <li>• Configuración por turno (matutino/vespertino/nocturno)</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">📊 Reportes Productivos</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Rendimiento por turno</li>
                <li>• Análisis de eficiencia</li>
                <li>• Costos de producción</li>
                <li>• KPIs de productividad</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">⚙️ Gestión de Maquinaria</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Programación de mantenimiento</li>
                <li>• Control de paros de máquina</li>
                <li>• Registro de incidencias</li>
                <li>• Historial de reparaciones</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">📦 Producto Terminado</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Registro automático en almacén</li>
                <li>• Etiquetado y codificación</li>
                <li>• Control de peso y medidas</li>
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
                  Ya tienes <code>produccion_celofan</code> (fecha, turno, maquina, productos_id, millares, operador),
                  <code>almacen_celofan_movimientos</code> y <code>vista_inventario_celofan</code>
                  listas para implementar la funcionalidad completa.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
            <p className="text-yellow-800 text-sm">
              <span className="font-semibold">💡 Mientras tanto:</span>
              Puedes usar el módulo de <strong>Almacén Celofán</strong> que ya está disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduccionCelofan;