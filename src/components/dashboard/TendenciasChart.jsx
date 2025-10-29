import { useState } from 'react';

const TendenciasChart = ({ datos = [], titulo = "Tendencias Financieras" }) => {
  const [metricaSeleccionada, setMetricaSeleccionada] = useState('ingresos');

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const formatearMes = (periodo) => {
    const [año, mes] = periodo.split('-');
    const fecha = new Date(año, mes - 1);
    return fecha.toLocaleDateString('es-MX', {
      month: 'short',
      year: '2-digit'
    });
  };

  const obtenerColorMetrica = (metrica) => {
    const colores = {
      ingresos: 'text-green-600',
      egresos: 'text-red-600',
      gastos: 'text-orange-600',
      utilidad: 'text-blue-600'
    };
    return colores[metrica] || 'text-gray-600';
  };

  const obtenerMaximo = () => {
    if (!datos.length) return 0;
    return Math.max(...datos.map(item =>
      Math.max(item.ingresos, item.egresos, item.gastos, Math.abs(item.utilidad))
    ));
  };

  const maximo = obtenerMaximo();

  const calcularAltura = (valor) => {
    if (maximo === 0) return 0;
    return Math.abs(valor / maximo) * 100;
  };

  const metricas = [
    { key: 'ingresos', label: 'Ingresos', color: 'bg-green-500' },
    { key: 'egresos', label: 'Egresos', color: 'bg-red-500' },
    { key: 'gastos', label: 'Gastos', color: 'bg-orange-500' },
    { key: 'utilidad', label: 'Utilidad', color: 'bg-blue-500' }
  ];

  if (!datos.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{titulo}</h3>
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{titulo}</h3>

        {/* Selector de métrica */}
        <div className="flex space-x-2">
          {metricas.map(metrica => (
            <button
              key={metrica.key}
              onClick={() => setMetricaSeleccionada(metrica.key)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                metricaSeleccionada === metrica.key
                  ? `${metrica.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metrica.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de barras simple */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-500 px-2">
          <span>$0</span>
          <span>{formatearMoneda(maximo)}</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {datos.map((item, index) => {
            const valor = item[metricaSeleccionada];
            const altura = calcularAltura(valor);
            const metrica = metricas.find(m => m.key === metricaSeleccionada);

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-600 text-right">
                  {formatearMes(item.periodo)}
                </div>

                <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                  <div
                    className={`${metrica.color} h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2`}
                    style={{ width: `${altura}%` }}
                  >
                    {altura > 20 && (
                      <span className="text-xs text-white font-medium">
                        {formatearMoneda(valor)}
                      </span>
                    )}
                  </div>
                </div>

                {altura <= 20 && (
                  <div className="w-24 text-xs text-gray-600">
                    {formatearMoneda(valor)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de la métrica seleccionada */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Promedio</p>
            <p className={`font-medium ${obtenerColorMetrica(metricaSeleccionada)}`}>
              {formatearMoneda(
                datos.reduce((sum, item) => sum + item[metricaSeleccionada], 0) / datos.length
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Máximo</p>
            <p className={`font-medium ${obtenerColorMetrica(metricaSeleccionada)}`}>
              {formatearMoneda(
                Math.max(...datos.map(item => item[metricaSeleccionada]))
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Último Mes</p>
            <p className={`font-medium ${obtenerColorMetrica(metricaSeleccionada)}`}>
              {formatearMoneda(datos[datos.length - 1]?.[metricaSeleccionada] || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TendenciasChart;