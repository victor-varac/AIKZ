import { useState } from 'react';

const ProduccionVsVentas = ({ datosProduccion = [], datosVentas = [] }) => {
  const [materialSeleccionado, setMaterialSeleccionado] = useState('todos');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  const formatearUnidades = (valor, tipo, material) => {
    if (material === 'celofan') {
      return `${valor.toLocaleString()} millares`;
    }
    if (material === 'polietileno') {
      return `${valor.toLocaleString()} kg`;
    }
    return valor.toLocaleString();
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  // Datos de ejemplo basados en la estructura de BD
  const metricas = {
    celofan: {
      producido: 2500, // millares
      vendido: 2200, // millares
      ingresoTotal: 156780,
      costoProduccion: 89500,
      eficiencia: 88, // % vendido vs producido
      margen: 43.0,
    },
    polietileno: {
      producido: 15600, // kg
      vendido: 14200, // kg
      ingresoTotal: 298450,
      costoProduccion: 187200,
      eficiencia: 91,
      margen: 37.3,
    }
  };

  const obtenerColorEficiencia = (eficiencia) => {
    if (eficiencia >= 90) return 'text-green-600';
    if (eficiencia >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calcularTendencia = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">🏭 Control de Producción vs Ventas</h2>
            <p className="text-purple-100">Monitoreo en tiempo real de la operación industrial</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {((metricas.celofan.eficiencia + metricas.polietileno.eficiencia) / 2).toFixed(0)}%
            </div>
            <div className="text-sm text-purple-100">Eficiencia Global</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Material:</label>
            <select
              value={materialSeleccionado}
              onChange={(e) => setMaterialSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="todos">Todos los materiales</option>
              <option value="celofan">Celofán</option>
              <option value="polietileno">Polietileno</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="dia">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Trimestre</option>
            </select>
          </div>
          <div className="ml-auto flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Datos en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Métricas por Material */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Celofán */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                📜 Producción de Celofán
              </h3>
              <div className="text-blue-600 text-sm font-medium">
                Industrial • Alimentario • Farmacéutico
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatearUnidades(metricas.celofan.producido, 'produccion', 'celofan')}
                </div>
                <div className="text-sm text-gray-600">Producido</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  +12% vs mes anterior
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatearUnidades(metricas.celofan.vendido, 'ventas', 'celofan')}
                </div>
                <div className="text-sm text-gray-600">Vendido</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  +8% vs mes anterior
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiencia de Venta</span>
                <span className={`font-bold ${obtenerColorEficiencia(metricas.celofan.eficiencia)}`}>
                  {metricas.celofan.eficiencia}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ingresos Generados</span>
                <span className="font-bold text-green-600">
                  {formatearMoneda(metricas.celofan.ingresoTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margen de Contribución</span>
                <span className="font-bold text-blue-600">
                  {metricas.celofan.margen}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inventario Disponible</span>
                <span className="font-bold text-orange-600">
                  {formatearUnidades(metricas.celofan.producido - metricas.celofan.vendido, 'inventario', 'celofan')}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Vendido vs Producido</span>
                <span>{metricas.celofan.eficiencia}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metricas.celofan.eficiencia}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Polietileno */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-900">
                🔬 Producción de Polietileno
              </h3>
              <div className="text-green-600 text-sm font-medium">
                Rollos • Bobinas • Láminas
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatearUnidades(metricas.polietileno.producido, 'produccion', 'polietileno')}
                </div>
                <div className="text-sm text-gray-600">Producido</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  +18% vs mes anterior
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatearUnidades(metricas.polietileno.vendido, 'ventas', 'polietileno')}
                </div>
                <div className="text-sm text-gray-600">Vendido</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  +22% vs mes anterior
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiencia de Venta</span>
                <span className={`font-bold ${obtenerColorEficiencia(metricas.polietileno.eficiencia)}`}>
                  {metricas.polietileno.eficiencia}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ingresos Generados</span>
                <span className="font-bold text-green-600">
                  {formatearMoneda(metricas.polietileno.ingresoTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margen de Contribución</span>
                <span className="font-bold text-green-600">
                  {metricas.polietileno.margen}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inventario Disponible</span>
                <span className="font-bold text-orange-600">
                  {formatearUnidades(metricas.polietileno.producido - metricas.polietileno.vendido, 'inventario', 'polietileno')}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Vendido vs Producido</span>
                <span>{metricas.polietileno.eficiencia}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metricas.polietileno.eficiencia}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Consolidado */}
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Consolidado de Operaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatearMoneda(metricas.celofan.ingresoTotal + metricas.polietileno.ingresoTotal)}
              </div>
              <div className="text-sm text-gray-600">Ingresos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((metricas.celofan.eficiencia + metricas.polietileno.eficiencia) / 2).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Eficiencia Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((metricas.celofan.margen + metricas.polietileno.margen) / 2).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Margen Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">Líneas Activas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduccionVsVentas;