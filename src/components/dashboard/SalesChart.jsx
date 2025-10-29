import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getSalesChartData } from '../../services/api/dashboard';

const SalesChart = ({ data, onTemporalidadChange }) => {
  const [temporalidad, setTemporalidad] = useState('mensual');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Función para cargar datos de la API
  const loadChartData = async (periodo) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Cargando datos de ventas para: ${periodo}`);
      const apiData = await getSalesChartData(periodo);

      if (apiData && apiData.length > 0) {
        // Transformar datos para Recharts
        const transformedData = apiData.map(item => ({
          name: item.label || item.periodo,
          ventas: item.ventas || 0,
          // Formatear para tooltip
          ventasFormateado: formatCurrency(item.ventas || 0)
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error al cargar datos del gráfico:', err);
      setError(err.message || 'Error al cargar los datos de ventas');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para actualizar datos cuando cambia la temporalidad
  useEffect(() => {
    loadChartData(temporalidad);

    // Notificar al componente padre sobre el cambio de temporalidad
    if (onTemporalidadChange) {
      onTemporalidadChange(temporalidad);
    }
  }, [temporalidad, onTemporalidadChange]);

  // Inicializar datos al montar el componente
  useEffect(() => {
    loadChartData('mensual');
  }, []);

  // Calcular estadísticas
  const totalVentas = chartData.reduce((sum, item) => sum + item.ventas, 0);
  const promedioVentas = chartData.length > 0 ? totalVentas / chartData.length : 0;
  const maxVentas = chartData.length > 0 ? Math.max(...chartData.map(item => item.ventas)) : 0;
  const minVentasPositivas = chartData.length > 0
    ? Math.min(...chartData.filter(d => d.ventas > 0).map(d => d.ventas))
    : 0;
  const maxVentasIndex = chartData.findIndex(item => item.ventas === maxVentas);

  // Función para formatear valores monetarios
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else if (value === 0) {
      return '-';
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  // Función para formatear el eje Y
  const formatYAxis = (tickItem) => {
    return formatCurrency(tickItem);
  };

  // Tooltip personalizado mejorado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const isMax = data.value === maxVentas;
      const isMin = data.value === minVentasPositivas && data.value > 0;
      const isEmpty = data.value === 0;

      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 transform transition-all">
          <p className="font-semibold text-sm text-gray-700 mb-2">{label}</p>
          <p className={`text-2xl font-bold ${
            isEmpty ? 'text-gray-400' : isMax ? 'text-green-500' : isMin ? 'text-red-500' : 'text-blue-500'
          }`}>
            {formatCurrency(data.value)}
          </p>
          {isEmpty && (
            <p className="text-xs text-gray-500 mt-1">Sin ventas registradas</p>
          )}
          {isMax && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              🏆 Mejor mes
            </span>
          )}
          {isMin && !isEmpty && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
              ⚠️ Menor venta
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Función mejorada para obtener el color de cada barra con gradientes
  const getBarColor = (value, index) => {
    if (value === 0) return 'url(#colorEmpty)'; // Gradiente gris para valores 0
    if (index === maxVentasIndex) return 'url(#colorMax)'; // Gradiente verde para el máximo
    if (value === minVentasPositivas) return 'url(#colorMin)'; // Gradiente rojo para el mínimo
    return 'url(#colorDefault)'; // Gradiente azul por defecto
  };

  // Custom label para mostrar valores en las barras
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;

    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#666"
        textAnchor="middle"
        className="text-xs font-medium"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  // Componente de estado vacío mejorado
  const EmptyState = () => (
    <div className="relative h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
      <div className="text-6xl mb-4 animate-pulse">📊</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Sin datos de ventas</h3>
      <p className="text-gray-600 text-center max-w-sm">
        No hay datos de ventas disponibles para el período <strong>{temporalidad}</strong>.
        Los datos aparecerán aquí cuando haya ventas registradas.
      </p>
    </div>
  );

  // Componente de estado de error mejorado
  const ErrorState = () => (
    <div className="relative h-96 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
      <div className="text-6xl mb-4 animate-bounce">⚠️</div>
      <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar datos</h3>
      <p className="text-red-600 text-center max-w-sm mb-4">{error}</p>
      <button
        onClick={() => loadChartData(temporalidad)}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
      >
        🔄 Reintentar
      </button>
    </div>
  );

  // Calcular tendencia
  const tendencia = chartData.length > 1
    ? (chartData[chartData.length - 1].ventas > chartData[0].ventas ? 'creciente' : 'decreciente')
    : 'estable';

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-6">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">📈</span>
            <h3 className="text-2xl font-bold text-gray-900">
              Ventas {temporalidad === 'diaria' ? 'Diarias' : temporalidad === 'semanal' ? 'Semanales' : temporalidad === 'mensual' ? 'Mensuales' : temporalidad === 'trimestral' ? 'Trimestrales' : 'Anuales'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 ml-11">
            {temporalidad === 'diaria' ? 'Últimos 7 días' : temporalidad === 'semanal' ? 'Últimas 8 semanas' : temporalidad === 'mensual' ? 'Enero - Diciembre' : temporalidad === 'trimestral' ? 'Últimos 4 trimestres' : 'Últimos 5 años'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Selector de temporalidad mejorado */}
          <div className="flex bg-white rounded-xl shadow-md p-1 border border-gray-200">
            {['diaria', 'semanal', 'mensual', 'trimestral', 'anual'].map((periodo) => (
              <button
                key={periodo}
                onClick={() => setTemporalidad(periodo)}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${
                  temporalidad === periodo
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {periodo === 'diaria' ? '📅 Diaria' : periodo === 'semanal' ? '📊 Semanal' : periodo === 'mensual' ? '📈 Mensual' : periodo === 'trimestral' ? '📉 Trimestral' : '📆 Anual'}
              </button>
            ))}
          </div>

          {/* Total con diseño mejorado */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
            <div className="text-xs opacity-90">Total</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVentas)}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras con Recharts mejorado */}
      <div className="bg-white rounded-xl shadow-inner p-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="absolute top-0 animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <span className="mt-4 text-gray-600 font-medium">Cargando datos...</span>
            </div>
          </div>
        ) : error ? (
          <ErrorState />
        ) : chartData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Definir gradientes */}
              <defs>
                <linearGradient id="colorDefault" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="colorEmpty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E5E7EB" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="#D1D5DB" stopOpacity={0.5}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                angle={0}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                width={80}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar
                dataKey="ventas"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
                animationDuration={800}
                onMouseEnter={(_, index) => setHoveredBar(index)}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.ventas, index)}
                    style={{
                      filter: hoveredBar === index ? 'brightness(1.1)' : 'brightness(1)',
                      cursor: 'pointer',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Estadísticas adicionales mejoradas */}
      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card de Promedio */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    📊 Promedio {temporalidad === 'mensual' ? 'Mensual' : temporalidad === 'diaria' ? 'Diario' : temporalidad === 'semanal' ? 'Semanal' : temporalidad === 'trimestral' ? 'Trimestral' : 'Anual'}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(promedioVentas)}
                  </div>
                </div>
                <div className="text-3xl opacity-20">💰</div>
              </div>
            </div>

            {/* Card de Mejor Período */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">
                    🏆 Mejor {temporalidad === 'mensual' ? 'Mes' : temporalidad === 'diaria' ? 'Día' : temporalidad === 'semanal' ? 'Semana' : temporalidad === 'trimestral' ? 'Trimestre' : 'Año'}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(maxVentas)}
                  </div>
                  {maxVentasIndex !== -1 && (
                    <div className="text-xs text-green-600 mt-1">
                      {chartData[maxVentasIndex].name}
                    </div>
                  )}
                </div>
                <div className="text-3xl opacity-20">🎯</div>
              </div>
            </div>

            {/* Card de Tendencia */}
            <div className={`bg-gradient-to-br ${
              tendencia === 'creciente'
                ? 'from-emerald-50 to-emerald-100 border-emerald-200'
                : 'from-red-50 to-red-100 border-red-200'
            } rounded-xl p-4 border`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-medium mb-1 ${
                    tendencia === 'creciente' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {tendencia === 'creciente' ? '📈 Tendencia' : '📉 Tendencia'}
                  </div>
                  <div className={`text-2xl font-bold ${
                    tendencia === 'creciente' ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {tendencia === 'creciente' ? 'Creciente' : 'Decreciente'}
                  </div>
                  <div className={`text-xs mt-1 ${
                    tendencia === 'creciente' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {chartData.length > 1 && chartData[chartData.length - 2]?.ventas > 0
                      ? `${((chartData[chartData.length - 1].ventas - chartData[chartData.length - 2].ventas) / chartData[chartData.length - 2].ventas * 100).toFixed(1)}% vs período anterior`
                      : 'Sin datos anteriores'
                    }
                  </div>
                </div>
                <div className="text-3xl opacity-20">
                  {tendencia === 'creciente' ? '🚀' : '⚠️'}
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de rendimiento */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="text-sm font-medium text-gray-700">Análisis de Rendimiento</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {maxVentas > promedioVentas * 1.5
                      ? `El mejor período supera el promedio en ${((maxVentas / promedioVentas - 1) * 100).toFixed(0)}%`
                      : minVentasPositivas < promedioVentas * 0.5
                      ? `El período más bajo está ${((1 - minVentasPositivas / promedioVentas) * 100).toFixed(0)}% por debajo del promedio`
                      : 'Las ventas se mantienen relativamente estables'
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => loadChartData(temporalidad)}
                className="text-blue-500 hover:text-blue-600 transition-colors"
                title="Actualizar datos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesChart;