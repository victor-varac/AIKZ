import { useState, useEffect } from 'react';
import { getAllCompras, registrarPago, getHistorialPagos, subirComprobantePago } from '../../services/api/cuentasPorPagar';

const ControlPagos = () => {
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [formularioPago, setFormularioPago] = useState({
    fecha_pago: '',
    metodo_pago: '',
    referencia: '',
    notas: '',
    comprobante: null,
  });

  const metodosPago = [
    'Transferencia Bancaria',
    'Cheque',
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Depósito Bancario',
    'Otro',
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [facturasPendientesData, historialPagosData] = await Promise.all([
        getAllCompras({ pagada: false }),
        getHistorialPagos()
      ]);

      // Procesar facturas pendientes para agregar información de estado
      const facturasProcesadas = facturasPendientesData.map(factura => {
        const diasPago = factura.proveedores?.dias_pago || 30;
        const fechaVencimiento = new Date(factura.fecha);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + diasPago);

        const hoy = new Date();
        const diasVencimiento = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

        return {
          ...factura,
          nombre_proveedor: factura.proveedores?.nombre || 'Sin Proveedor',
          fecha_factura: factura.fecha,
          fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
          dias_vencimiento: diasVencimiento,
          estado: diasVencimiento < 0 ? 'VENCIDA' : 'VIGENTE'
        };
      });

      // Procesar historial de pagos
      const historialProcesado = historialPagosData.map(pago => ({
        ...pago,
        nombre_proveedor: pago.proveedores?.nombre || 'Sin Proveedor',
        monto_pagado: pago.total,
        metodo_pago: 'Por definir', // TODO: Agregar campo metodo_pago a la tabla
        referencia: 'Por definir', // TODO: Agregar campo referencia a la tabla
        usuario: 'Sistema'
      }));

      setFacturasPendientes(facturasProcesadas);
      setHistorialPagos(historialProcesado);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setFacturasPendientes([]);
      setHistorialPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const iniciarPago = (factura) => {
    setFacturaSeleccionada(factura);
    setFormularioPago({
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: '',
      referencia: '',
      notas: '',
      comprobante: null,
    });
    setMostrarFormularioPago(true);
  };

  const manejarCambioFormulario = (campo, valor) => {
    setFormularioPago(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const manejarArchivoComprobante = (event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      setFormularioPago(prev => ({
        ...prev,
        comprobante: archivo,
      }));
    }
  };

  const procesarPago = async (e) => {
    e.preventDefault();
    try {
      let urlComprobante = null;

      // Subir comprobante si existe
      if (formularioPago.comprobante) {
        const resultadoSubida = await subirComprobantePago(
          formularioPago.comprobante,
          facturaSeleccionada.id
        );
        urlComprobante = resultadoSubida.url;
      }

      // Registrar el pago
      const pagoData = {
        compra_id: facturaSeleccionada.id,
        fecha_pago: formularioPago.fecha_pago,
        monto: facturaSeleccionada.total,
        metodo_pago: formularioPago.metodo_pago,
        referencia: formularioPago.referencia,
        notas: formularioPago.notas,
        numero_factura: facturaSeleccionada.numero_factura,
        nombre_proveedor: facturaSeleccionada.nombre_proveedor,
        comprobante_url: urlComprobante
      };

      await registrarPago(pagoData);

      setMostrarFormularioPago(false);
      setFacturaSeleccionada(null);
      cargarDatos();

      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
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

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'VENCIDA':
        return 'bg-red-100 text-red-800';
      case 'VIGENTE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-900">
            {facturasPendientes.filter(f => f.estado === 'VENCIDA').length}
          </div>
          <div className="text-sm text-red-700">Facturas Vencidas</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-900">
            {facturasPendientes.filter(f => f.estado === 'VIGENTE').length}
          </div>
          <div className="text-sm text-yellow-700">Por Vencer</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">
            {formatearMoneda(facturasPendientes.reduce((sum, f) => sum + f.total, 0))}
          </div>
          <div className="text-sm text-purple-700">Total Pendiente</div>
        </div>
      </div>

      {/* Facturas Pendientes de Pago */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Facturas Pendientes de Pago
          </h3>
        </div>
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
                  Fecha Factura
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facturasPendientes.map((factura) => (
                <tr key={factura.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {factura.nombre_proveedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.numero_factura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(factura.fecha_factura)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(factura.fecha_vencimiento)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatearMoneda(factura.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(factura.estado)}`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => iniciarPago(factura)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Pagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario de Pago */}
      {mostrarFormularioPago && facturaSeleccionada && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Registrar Pago - {facturaSeleccionada.numero_factura}
              </h3>
              <button
                onClick={() => setMostrarFormularioPago(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Proveedor:</strong> {facturaSeleccionada.nombre_proveedor}
                </div>
                <div>
                  <strong>Monto:</strong> {formatearMoneda(facturaSeleccionada.total)}
                </div>
                <div>
                  <strong>Fecha Factura:</strong> {formatearFecha(facturaSeleccionada.fecha_factura)}
                </div>
                <div>
                  <strong>Vencimiento:</strong> {formatearFecha(facturaSeleccionada.fecha_vencimiento)}
                </div>
              </div>
            </div>

            <form onSubmit={procesarPago} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    value={formularioPago.fecha_pago}
                    onChange={(e) => manejarCambioFormulario('fecha_pago', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={formularioPago.metodo_pago}
                    onChange={(e) => manejarCambioFormulario('metodo_pago', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar método</option>
                    {metodosPago.map(metodo => (
                      <option key={metodo} value={metodo}>
                        {metodo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia/Folio
                  </label>
                  <input
                    type="text"
                    value={formularioPago.referencia}
                    onChange={(e) => manejarCambioFormulario('referencia', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Número de referencia o folio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comprobante
                  </label>
                  <input
                    type="file"
                    onChange={manejarArchivoComprobante}
                    accept="image/*,.pdf"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={formularioPago.notas}
                  onChange={(e) => manejarCambioFormulario('notas', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Observaciones o notas sobre el pago..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarFormularioPago(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Historial de Pagos Recientes
          </h3>
        </div>
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
                  Fecha Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historialPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pago.nombre_proveedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.numero_factura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(pago.fecha_pago)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatearMoneda(pago.monto_pagado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.metodo_pago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.referencia || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.usuario}
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

export default ControlPagos;