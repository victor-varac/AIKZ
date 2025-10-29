import { useState } from 'react';

const IndicadoresSalud = ({ kpis = {}, alertas = [] }) => {
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState('general');

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  // Calcular indicadores de salud financiera
  const indicadores = {
    liquidez: {
      valor: kpis.cuentasPorCobrar > 0 ? (kpis.cuentasPorCobrar / (kpis.cuentasPorPagar || 1)).toFixed(2) : 0,
      estado: function() {
        if (this.valor >= 1.5) return { color: 'green', nivel: 'Excelente', icono: '🟢' };
        if (this.valor >= 1.0) return { color: 'yellow', nivel: 'Bueno', icono: '🟡' };
        return { color: 'red', nivel: 'Crítico', icono: '🔴' };
      }
    },
    rentabilidad: {
      valor: kpis.margenUtilidad || 0,
      estado: function() {
        if (this.valor >= 20) return { color: 'green', nivel: 'Excelente', icono: '🟢' };
        if (this.valor >= 10) return { color: 'yellow', nivel: 'Bueno', icono: '🟡' };
        if (this.valor >= 0) return { color: 'orange', nivel: 'Regular', icono: '🟠' };
        return { color: 'red', nivel: 'Crítico', icono: '🔴' };
      }
    },
    eficiencia: {
      valor: kpis.ingresos > 0 ? (((kpis.ingresos - kpis.egresos) / kpis.ingresos) * 100).toFixed(1) : 0,
      estado: function() {
        if (this.valor >= 25) return { color: 'green', nivel: 'Excelente', icono: '🟢' };
        if (this.valor >= 15) return { color: 'yellow', nivel: 'Bueno', icono: '🟡' };
        if (this.valor >= 5) return { color: 'orange', nivel: 'Regular', icono: '🟠' };
        return { color: 'red', nivel: 'Crítico', icono: '🔴' };
      }
    },
    crecimiento: {
      valor: 12.5, // Este vendría de cálculos históricos
      estado: function() {
        if (this.valor >= 15) return { color: 'green', nivel: 'Excelente', icono: '🟢' };
        if (this.valor >= 5) return { color: 'yellow', nivel: 'Bueno', icono: '🟡' };
        if (this.valor >= 0) return { color: 'orange', nivel: 'Regular', icono: '🟠' };
        return { color: 'red', nivel: 'Crítico', icono: '🔴' };
      }
    }
  };

  // Calcular score general de salud
  const calcularScoreGeneral = () => {
    let score = 0;
    let maxScore = 0;

    Object.values(indicadores).forEach(indicador => {
      const estado = indicador.estado();
      maxScore += 100;
      if (estado.color === 'green') score += 100;
      else if (estado.color === 'yellow') score += 75;
      else if (estado.color === 'orange') score += 50;
      else score += 25;
    });

    return Math.round((score / maxScore) * 100);
  };

  const scoreGeneral = calcularScoreGeneral();

  const obtenerColorScore = (score) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    if (score >= 40) return { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
    return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
  };

  const colorScore = obtenerColorScore(scoreGeneral);

  const categorias = [
    { id: 'general', label: 'Vista General', icono: '📊' },
    { id: 'liquidez', label: 'Liquidez', icono: '💧' },
    { id: 'rentabilidad', label: 'Rentabilidad', icono: '📈' },
    { id: 'eficiencia', label: 'Eficiencia', icono: '⚡' },
    { id: 'crecimiento', label: 'Crecimiento', icono: '🚀' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header con Score General */}
      <div className={`${colorScore.bg} ${colorScore.border} border-b p-6 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              🏥 Salud Financiera Empresarial
            </h2>
            <p className="text-gray-600">
              Diagnóstico integral basado en indicadores clave
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${colorScore.color} mb-1`}>
              {scoreGeneral}
            </div>
            <div className="text-sm font-medium text-gray-600">Score General</div>
            <div className={`text-xs font-semibold ${colorScore.color} mt-1`}>
              {scoreGeneral >= 80 ? 'SALUDABLE' :
               scoreGeneral >= 60 ? 'ESTABLE' :
               scoreGeneral >= 40 ? 'EN RIESGO' : 'CRÍTICO'}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de Categorías */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-1 p-2">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setIndicadorSeleccionado(categoria.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                indicadorSeleccionado === categoria.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{categoria.icono}</span>
              <span>{categoria.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido según categoría seleccionada */}
      <div className="p-6">
        {indicadorSeleccionado === 'general' && (
          <div className="space-y-6">
            {/* Grid de Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(indicadores).map(([key, indicador]) => {
                const estado = indicador.estado();
                const colorClasses = {
                  green: 'bg-green-50 border-green-200 text-green-800',
                  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  orange: 'bg-orange-50 border-orange-200 text-orange-800',
                  red: 'bg-red-50 border-red-200 text-red-800'
                };

                return (
                  <div key={key} className={`${colorClasses[estado.color]} border rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-lg">{estado.icono}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {key === 'liquidez' ? indicador.valor :
                       key === 'rentabilidad' || key === 'eficiencia' || key === 'crecimiento' ?
                       `${indicador.valor}%` : indicador.valor}
                    </div>
                    <div className="text-xs font-semibold">
                      {estado.nivel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Análisis Comparativo */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                📈 Análisis Comparativo Industrial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">vs Industria Plástica</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Margen promedio:</span>
                      <span className="font-medium">15-20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tu margen:</span>
                      <span className={`font-bold ${kpis.margenUtilidad >= 15 ? 'text-green-600' : 'text-orange-600'}`}>
                        {(kpis.margenUtilidad || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Eficiencia Operativa</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Benchmark:</span>
                      <span className="font-medium">20-25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tu eficiencia:</span>
                      <span className={`font-bold ${indicadores.eficiencia.valor >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                        {indicadores.eficiencia.valor}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Posición Competitiva</h4>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${scoreGeneral >= 75 ? 'text-green-600' : scoreGeneral >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {scoreGeneral >= 75 ? 'LÍDER' : scoreGeneral >= 50 ? 'COMPETITIVO' : 'EN DESARROLLO'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Top {scoreGeneral >= 75 ? '25%' : scoreGeneral >= 50 ? '50%' : '75%'} del sector
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista detallada por indicador */}
        {indicadorSeleccionado !== 'general' && (
          <div className="space-y-6">
            {(() => {
              const indicador = indicadores[indicadorSeleccionado];
              const estado = indicador.estado();

              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      Análisis de {indicadorSeleccionado}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{estado.icono}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {indicadorSeleccionado === 'liquidez' ? indicador.valor : `${indicador.valor}%`}
                        </div>
                        <div className="text-sm text-gray-600">{estado.nivel}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido específico por indicador */}
                  {indicadorSeleccionado === 'liquidez' && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-4">Análisis de Liquidez</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Componentes</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Cuentas por Cobrar:</span>
                              <span className="font-medium">{formatearMoneda(kpis.cuentasPorCobrar || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cuentas por Pagar:</span>
                              <span className="font-medium">{formatearMoneda(kpis.cuentasPorPagar || 0)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                              <span>Ratio de Liquidez:</span>
                              <span>{indicador.valor}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Interpretación</h5>
                          <div className="text-sm text-gray-700">
                            {indicador.valor >= 1.5 ?
                              "Excelente capacidad para cubrir obligaciones. Considera optimizar el efectivo excedente." :
                            indicador.valor >= 1.0 ?
                              "Buena capacidad de pago. Mantén el control de cobranza." :
                              "Liquidez limitada. Acelera la cobranza y gestiona mejor los pagos."
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {indicadorSeleccionado === 'rentabilidad' && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-4">Análisis de Rentabilidad</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Métricas</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Ingresos Totales:</span>
                              <span className="font-medium">{formatearMoneda(kpis.ingresos || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilidad Bruta:</span>
                              <span className="font-medium">{formatearMoneda(kpis.utilidadBruta || 0)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                              <span>Margen de Utilidad:</span>
                              <span>{indicador.valor}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Recomendaciones</h5>
                          <div className="text-sm text-gray-700">
                            {indicador.valor >= 20 ?
                              "Excelente rentabilidad. Considera expansion o inversión en I+D." :
                            indicador.valor >= 10 ?
                              "Rentabilidad saludable. Optimiza procesos para mejorar márgenes." :
                              "Rentabilidad baja. Revisa estructura de costos y precios de venta."
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicadoresSalud;