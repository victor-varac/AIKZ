const GastosCategoriaWidget = ({ gastos = [], titulo = "Gastos por Categoría" }) => {
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const colores = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500'
  ];

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  if (!gastos.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{titulo}</h3>
        <div className="text-center py-8 text-gray-500">
          No hay datos de gastos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{titulo}</h3>
        <span className="text-sm text-gray-500">
          Total: {formatearMoneda(totalGastos)}
        </span>
      </div>

      {/* Gráfico de dona simple */}
      <div className="relative mb-6">
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            {/* Círculo base */}
            <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

            {/* Segmentos del gráfico */}
            {gastos.map((gasto, index) => {
              const porcentaje = (gasto.monto / totalGastos) * 100;
              const color = colores[index % colores.length];

              return (
                <div
                  key={index}
                  className={`absolute inset-0 rounded-full border-8 ${color.replace('bg-', 'border-')} transition-all duration-300`}
                  style={{
                    transform: `rotate(${gastos.slice(0, index).reduce((sum, g) =>
                      sum + (g.monto / totalGastos) * 360, 0)}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin((porcentaje / 100) * 2 * Math.PI) * 50}% ${50 - Math.cos((porcentaje / 100) * 2 * Math.PI) * 50}%)`
                  }}
                ></div>
              );
            })}

            {/* Centro del gráfico */}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatearMoneda(totalGastos)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-3">
        {gastos.map((gasto, index) => {
          const color = colores[index % colores.length];

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-gray-700">{gasto.categoria}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatearMoneda(gasto.monto)}
                </p>
                <p className="text-xs text-gray-500">
                  {gasto.porcentaje}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Categorías</p>
            <p className="font-medium text-gray-900">{gastos.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mayor Gasto</p>
            <p className="font-medium text-gray-900">
              {gastos.length > 0 ? formatearMoneda(gastos[0].monto) : '$0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastosCategoriaWidget;