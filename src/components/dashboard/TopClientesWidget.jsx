const TopClientesWidget = ({ clientes = [], titulo = "Top Clientes" }) => {
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const obtenerPorcentaje = (total, maximo) => {
    return maximo > 0 ? (total / maximo) * 100 : 0;
  };

  const maximoTotal = clientes.length > 0 ? clientes[0].total : 0;

  if (!clientes.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{titulo}</h3>
        <div className="text-center py-8 text-gray-500">
          No hay datos de clientes disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{titulo}</h3>
        <span className="text-sm text-gray-500">
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {clientes.map((cliente, index) => {
          const porcentaje = obtenerPorcentaje(cliente.total, maximoTotal);

          return (
            <div key={index} className="flex items-center space-x-4">
              {/* Posición */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800">
                  {index + 1}
                </span>
              </div>

              {/* Información del cliente */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {cliente.nombre}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatearMoneda(cliente.total)}
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total Ventas</p>
            <p className="font-medium text-gray-900">
              {formatearMoneda(
                clientes.reduce((sum, cliente) => sum + cliente.total, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Promedio</p>
            <p className="font-medium text-gray-900">
              {formatearMoneda(
                clientes.reduce((sum, cliente) => sum + cliente.total, 0) / clientes.length
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopClientesWidget;