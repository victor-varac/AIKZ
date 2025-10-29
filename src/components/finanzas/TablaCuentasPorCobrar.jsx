import React from 'react';

const TablaCuentasPorCobrar = ({
  cuentas,
  loading,
  pagination,
  formatCurrency,
  formatDate,
  getEstadoBadge,
  onPagoRapido,
  onLoadMore
}) => {

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">📋 Lista de Cuentas</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cuentas.map((cuenta) => (
              <FilaCuenta
                key={`${cuenta.cliente_id}-${cuenta.numero_factura}`}
                cuenta={cuenta}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getEstadoBadge={getEstadoBadge}
                onPagoRapido={onPagoRapido}
              />
            ))}
          </tbody>
        </table>

        {/* Estado vacío */}
        {cuentas.length === 0 && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl">💰</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No se encontraron cuentas</h3>
            <p className="text-gray-500 mt-2">
              No hay cuentas por cobrar con los filtros seleccionados
            </p>
          </div>
        )}
      </div>

      {/* Cargar más */}
      {pagination.hasMore && cuentas.length > 0 && (
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
};

const FilaCuenta = ({ cuenta, formatCurrency, formatDate, getEstadoBadge, onPagoRapido }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {cuenta.nombre_cliente}
          </div>
          <div className="text-sm text-gray-500">
            {cuenta.nombre_contacto}
          </div>
          {cuenta.telefono && (
            <div className="text-xs text-gray-400">
              📞 {cuenta.telefono}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{cuenta.numero_factura}
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(cuenta.fecha_factura)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(cuenta.monto_factura)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${cuenta.saldo_pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(cuenta.saldo_pendiente)}
        </div>
        {cuenta.total_pagado > 0 && (
          <div className="text-xs text-gray-500">
            Pagado: {formatCurrency(cuenta.total_pagado)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(cuenta.fecha_vencimiento)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getEstadoBadge(cuenta.estado_cuenta, cuenta.dias_vencido)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {cuenta.saldo_pendiente > 0 && (
          <button
            onClick={() => onPagoRapido(cuenta)}
            className="text-blue-600 hover:text-blue-800 mr-3"
            title="Registrar pago"
          >
            💰 Pagar
          </button>
        )}
      </td>
    </tr>
  );
};

export default TablaCuentasPorCobrar;