import { useState, useEffect } from 'react';
import { getCuentasPorPagar, getResumenCuentasPorPagar } from '../../services/api/cuentasPorPagar';

const EstadoCuentas = () => {
  const [cuentasPorPagar, setCuentasPorPagar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: 'todas',
    proveedor: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  useEffect(() => {
    cargarCuentasPorPagar();
  }, [filtros]);

  const cargarCuentasPorPagar = async () => {
    setLoading(true);
    try {
      const data = await getCuentasPorPagar(filtros);
      setCuentasPorPagar(data);
    } catch (error) {
      console.error('Error al cargar cuentas por pagar:', error);
      // Fallback a datos de ejemplo en caso de error
      setCuentasPorPagar([]);
    } finally {
      setLoading(false);
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'VENCIDA':
        return 'bg-red-100 text-red-800';
      case 'VIGENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAGADA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX');
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(monto);
  };

  const resumenEstados = {
    total: cuentasPorPagar.length,
    vencidas: cuentasPorPagar.filter(c => c.estado_cuenta === 'VENCIDA').length,
    vigentes: cuentasPorPagar.filter(c => c.estado_cuenta === 'VIGENTE').length,
    pagadas: cuentasPorPagar.filter(c => c.estado_cuenta === 'PAGADA').length,
    montoTotal: cuentasPorPagar.reduce((sum, c) => sum + (c.estado_cuenta !== 'PAGADA' ? c.monto_factura : 0), 0),
    montoVencido: cuentasPorPagar
      .filter(c => c.estado_cuenta === 'VENCIDA')
      .reduce((sum, c) => sum + c.monto_factura, 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{resumenEstados.total}</div>
          <div className="text-sm text-blue-700">Total Facturas</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-900">{resumenEstados.vencidas}</div>
          <div className="text-sm text-red-700">Vencidas</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-900">{resumenEstados.vigentes}</div>
          <div className="text-sm text-yellow-700">Vigentes</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">{formatearMoneda(resumenEstados.montoTotal)}</div>
          <div className="text-sm text-purple-700">Total Pendiente</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-900">{formatearMoneda(resumenEstados.montoVencido)}</div>
          <div className="text-sm text-orange-700">Monto Vencido</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="VENCIDA">Vencidas</option>
              <option value="VIGENTE">Vigentes</option>
              <option value="PAGADA">Pagadas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              value={filtros.proveedor}
              onChange={(e) => setFiltros({ ...filtros, proveedor: e.target.value })}
              placeholder="Buscar proveedor..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Cuentas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuentasPorPagar.map((cuenta) => (
                <tr key={cuenta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cuenta.nombre_proveedor}
                      </div>
                      <div className="text-sm text-gray-500">{cuenta.contacto}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cuenta.numero_factura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(cuenta.fecha_factura)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(cuenta.fecha_vencimiento)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatearMoneda(cuenta.monto_factura)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(cuenta.estado_cuenta)}`}>
                      {cuenta.estado_cuenta}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cuenta.dias_vencido ? `${cuenta.dias_vencido} días` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      Ver
                    </button>
                    {!cuenta.pagada && (
                      <button className="text-green-600 hover:text-green-900">
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstadoCuentas;