import { useState, useEffect } from 'react';
import {
  getReporteResumenMensual,
  getGastosPorCategoria,
  getGastosPorProveedor,
  getProyeccionPagos,
  exportarReporte
} from '../../services/api/cuentasPorPagar';

const ReportesCuentasPagar = () => {
  const [reportes, setReportes] = useState({
    resumenMensual: [],
    gastosPorCategoria: [],
    gastosPorProveedor: [],
    proyeccionPagos: [],
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    periodo: 'mes_actual',
    fechaInicio: '',
    fechaFin: '',
    proveedor: '',
  });
  const [vistaActiva, setVistaActiva] = useState('resumen');

  useEffect(() => {
    cargarReportes();
  }, [filtros]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const periodo = {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      };

      const [
        resumenMensual,
        gastosPorCategoria,
        gastosPorProveedor,
        proyeccionPagos
      ] = await Promise.all([
        getReporteResumenMensual(periodo),
        getGastosPorCategoria(periodo),
        getGastosPorProveedor(periodo),
        getProyeccionPagos(30)
      ]);

      setReportes({
        resumenMensual,
        gastosPorCategoria,
        gastosPorProveedor,
        proyeccionPagos
      });
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      // Mantener datos vacíos en caso de error
      setReportes({
        resumenMensual: [],
        gastosPorCategoria: [],
        gastosPorProveedor: [],
        proyeccionPagos: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX');
  };

  const manejarExportacion = async (tipo) => {
    try {
      const datos = reportes[vistaActiva] || reportes.resumenMensual;
      const nombreArchivo = `cuentas-por-pagar-${vistaActiva}-${new Date().toISOString().split('T')[0]}`;

      const resultado = await exportarReporte(tipo, datos, nombreArchivo);

      if (resultado.success) {
        alert(`Reporte ${tipo} generado exitosamente`);
      }
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    }
  };

  const vistas = [
    { id: 'resumen', label: 'Resumen Mensual', icon: '📊' },
    { id: 'categorias', label: 'Por Categoría', icon: '🏷️' },
    { id: 'proveedores', label: 'Por Proveedor', icon: '🏢' },
    { id: 'proyeccion', label: 'Proyección', icon: '📅' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="mes_actual">Mes Actual</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="semestre">Último Semestre</option>
              <option value="anio">Año Actual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {filtros.periodo === 'personalizado' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acciones
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => manejarExportacion('excel')}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                📊 Excel
              </button>
              <button
                onClick={() => manejarExportacion('pdf')}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de Vistas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {vistas.map((vista) => (
            <button
              key={vista.id}
              onClick={() => setVistaActiva(vista.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                vistaActiva === vista.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{vista.icon}</span>
              <span>{vista.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido según vista activa */}
      {vistaActiva === 'resumen' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Resumen Mensual</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Facturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Pagado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.resumenMensual.map((mes, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mes.mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mes.total_facturas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearMoneda(mes.monto_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {mes.facturas_pagadas} ({formatearMoneda(mes.monto_pagado)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {mes.facturas_pendientes} ({formatearMoneda(mes.monto_pendiente)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((mes.monto_pagado / mes.monto_total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vistaActiva === 'categorias' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Gastos por Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Distribución</h4>
              <div className="space-y-3">
                {reportes.gastosPorCategoria.map((categoria, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `hsl(${index * 360 / reportes.gastosPorCategoria.length}, 70%, 50%)` }}
                      ></div>
                      <span className="text-sm text-gray-900">{categoria.categoria}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatearMoneda(categoria.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {categoria.porcentaje}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportes.gastosPorCategoria.map((categoria, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearMoneda(categoria.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {categoria.porcentaje}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {vistaActiva === 'proveedores' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Gastos por Proveedor</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Facturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.gastosPorProveedor.map((proveedor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proveedor.proveedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proveedor.total_facturas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearMoneda(proveedor.monto_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearMoneda(proveedor.promedio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vistaActiva === 'proyeccion' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Proyección de Pagos</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.proyeccionPagos.map((pago, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(pago.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pago.proveedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearMoneda(pago.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pago.dias_restantes} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pago.dias_restantes <= 5
                          ? 'bg-red-100 text-red-800'
                          : pago.dias_restantes <= 15
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {pago.dias_restantes <= 5 ? 'Urgente' : pago.dias_restantes <= 15 ? 'Próximo' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesCuentasPagar;