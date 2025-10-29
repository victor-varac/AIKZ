import { useState } from 'react';

const ResumenEjecutivo = ({ resumen }) => {
  const [vistaDetalle, setVistaDetalle] = useState(false);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const formatearPorcentaje = (porcentaje) => {
    return `${porcentaje >= 0 ? '+' : ''}${porcentaje.toFixed(1)}%`;
  };

  const obtenerIndicadorSalud = (margen) => {
    if (margen >= 20) return { color: 'text-green-600', icono: '🟢', estado: 'Excelente' };
    if (margen >= 10) return { color: 'text-yellow-600', icono: '🟡', estado: 'Bueno' };
    if (margen >= 0) return { color: 'text-orange-600', icono: '🟠', estado: 'Regular' };
    return { color: 'text-red-600', icono: '🔴', estado: 'Crítico' };
  };

  const { kpis = {}, crecimientoIngresos = 0, estadoCuentas = {} } = resumen || {};
  const indicadorSalud = obtenerIndicadorSalud(kpis.margenUtilidad || 0);

  // Calcular ratios financieros avanzados
  const ratioLiquidez = kpis.cuentasPorCobrar > 0 ?
    (kpis.cuentasPorCobrar / (kpis.cuentasPorPagar || 1)).toFixed(2) : '0.00';

  const roiMensual = kpis.ingresos > 0 ?
    ((kpis.utilidadBruta / kpis.ingresos) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 border border-blue-200">
      {/* Header Premium */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Resumen Ejecutivo
          </h2>
          <p className="text-gray-600">
            Análisis integral del rendimiento financiero
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${indicadorSalud.color} mb-1`}>
            {indicadorSalud.icono}
          </div>
          <div className={`text-sm font-medium ${indicadorSalud.color}`}>
            {indicadorSalud.estado}
          </div>
        </div>
      </div>

      {/* Métricas Principales en Grid Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Rendimiento General */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Rendimiento General
            </h3>
            <div className="text-2xl">💼</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Margen de Utilidad</span>
              <span className={`font-bold ${indicadorSalud.color}`}>
                {(kpis.margenUtilidad || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ROI Mensual</span>
              <span className="font-bold text-blue-600">{roiMensual}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crecimiento</span>
              <span className={`font-bold ${crecimientoIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatearPorcentaje(crecimientoIngresos)}
              </span>
            </div>
          </div>
        </div>

        {/* Liquidez y Flujo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Liquidez y Flujo
            </h3>
            <div className="text-2xl">💧</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ratio de Liquidez</span>
              <span className={`font-bold ${parseFloat(ratioLiquidez) >= 1.2 ? 'text-green-600' : 'text-orange-600'}`}>
                {ratioLiquidez}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Flujo Neto</span>
              <span className={`font-bold ${kpis.flujoEfectivo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatearMoneda(kpis.flujoEfectivo || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Por Cobrar/Pagar</span>
              <span className="font-bold text-blue-600">
                {((kpis.cuentasPorCobrar / (kpis.cuentasPorPagar || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Volumen de Operaciones */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Volumen de Negocio
            </h3>
            <div className="text-2xl">📈</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos Totales</span>
              <span className="font-bold text-green-600">
                {formatearMoneda(kpis.ingresos || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Costos Totales</span>
              <span className="font-bold text-red-600">
                {formatearMoneda(kpis.egresos || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Utilidad Neta</span>
              <span className={`font-bold ${kpis.utilidadBruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatearMoneda(kpis.utilidadBruta || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights y Recomendaciones */}
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🔍 Insights Automáticos
          </h3>
          <button
            onClick={() => setVistaDetalle(!vistaDetalle)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {vistaDetalle ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight Principal */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Oportunidad Detectada</h4>
                <p className="text-sm text-blue-800">
                  {kpis.margenUtilidad > 15
                    ? "Excelente rentabilidad. Considera expandir operaciones o invertir en nueva maquinaria."
                    : kpis.margenUtilidad > 5
                    ? "Rentabilidad moderada. Revisa costos operativos y optimiza procesos de producción."
                    : "Margen bajo. Urgente revisar estructura de costos y precios de venta."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Recomendación de Flujo */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">🎯</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Acción Recomendada</h4>
                <p className="text-sm text-green-800">
                  {parseFloat(ratioLiquidez) < 1.0
                    ? "Mejorar cobranza: acelerar recuperación de cuentas por cobrar."
                    : parseFloat(ratioLiquidez) > 2.0
                    ? "Optimizar efectivo: considera inversiones en inventario o expansión."
                    : "Flujo equilibrado: mantener el control actual de cobranza y pagos."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles Expandidos */}
        {vistaDetalle && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">📊 Análisis de Tendencia</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Crecimiento mensual: {formatearPorcentaje(crecimientoIngresos)}</li>
                  <li>• Eficiencia operativa: {(100 - ((kpis.egresos / kpis.ingresos) * 100)).toFixed(1)}%</li>
                  <li>• Velocidad de rotación: Pendiente de análisis</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">⚠️ Alertas Preventivas</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {kpis.margenUtilidad < 10 ? '🔴' : '🟢'} Margen de utilidad</li>
                  <li>• {parseFloat(ratioLiquidez) < 1.0 ? '🔴' : '🟢'} Liquidez corriente</li>
                  <li>• {kpis.flujoEfectivo < 0 ? '🔴' : '🟢'} Flujo de efectivo</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">🎯 Próximos Pasos</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Optimizar proceso de producción</li>
                  <li>• Revisar precios de productos</li>
                  <li>• Acelerar ciclo de cobranza</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con timestamp */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-medium">Análisis basado en datos reales</span>
            <span className="ml-2">• Sistema Industrial AIKZ</span>
          </div>
          <div>
            Actualizado: {new Date().toLocaleString('es-MX')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenEjecutivo;