const KPICard = ({
  titulo,
  valor,
  icono,
  tendencia,
  colorFondo = 'bg-white',
  colorTexto = 'text-gray-900',
  colorIcono = 'text-blue-600',
  formatearValor = true
}) => {
  const formatearMoneda = (monto) => {
    if (!formatearValor) return monto;
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

  const obtenerColorTendencia = (tendencia) => {
    if (tendencia > 0) return 'text-green-600';
    if (tendencia < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 truncate">
          {titulo}
        </h3>
        <div className="text-2xl">
          {icono}
        </div>
      </div>

      <div className="space-y-2">
        <div className={`text-2xl font-bold ${colorTexto}`}>
          {formatearValor ? formatearMoneda(valor) : valor}
        </div>

        {tendencia !== undefined && (
          <div className="flex items-center text-sm">
            <span className={`${obtenerColorTendencia(tendencia)} font-medium`}>
              {formatearPorcentaje(tendencia)}
            </span>
            <span className="text-gray-500 ml-2">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;