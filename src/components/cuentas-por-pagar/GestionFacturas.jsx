import { useState, useEffect } from 'react';
import { getAllCompras, createCompra, updateCompra, deleteCompra } from '../../services/api/cuentasPorPagar';
import { getAllProveedores } from '../../services/api/proveedores';

const GestionFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [formulario, setFormulario] = useState({
    proveedor_id: '',
    numero_factura: '',
    fecha: '',
    subtotal: '',
    iva: '',
    total: '',
    dias_pago: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [facturasData, proveedoresData] = await Promise.all([
        getAllCompras(),
        getAllProveedores({ activo: true })
      ]);

      // Procesar facturas para agregar nombre del proveedor
      const facturasConProveedor = facturasData.map(factura => ({
        ...factura,
        nombre_proveedor: factura.proveedores?.nombre || 'Sin Proveedor'
      }));

      setFacturas(facturasConProveedor);
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setFacturas([]);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => {
      const nuevo = { ...prev, [campo]: valor };

      // Calcular total automáticamente
      if (campo === 'subtotal' || campo === 'iva') {
        const subtotal = parseFloat(nuevo.subtotal || 0);
        const iva = parseFloat(nuevo.iva || 0);
        nuevo.total = (subtotal + iva).toFixed(2);
      }

      // Calcular IVA automáticamente si se modifica subtotal
      if (campo === 'subtotal' && !nuevo.iva) {
        const subtotal = parseFloat(valor || 0);
        nuevo.iva = (subtotal * 0.16).toFixed(2);
        nuevo.total = (subtotal * 1.16).toFixed(2);
      }

      return nuevo;
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      if (facturaSeleccionada) {
        // Actualizar factura existente
        await updateCompra(facturaSeleccionada.id, formulario);
      } else {
        // Crear nueva factura
        await createCompra(formulario);
      }

      limpiarFormulario();
      setMostrarFormulario(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar factura:', error);
      alert('Error al guardar la factura. Por favor intente nuevamente.');
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      proveedor_id: '',
      numero_factura: '',
      fecha: '',
      subtotal: '',
      iva: '',
      total: '',
      dias_pago: '',
    });
    setFacturaSeleccionada(null);
  };

  const editarFactura = (factura) => {
    setFacturaSeleccionada(factura);
    setFormulario({
      proveedor_id: factura.proveedor_id,
      numero_factura: factura.numero_factura,
      fecha: factura.fecha,
      subtotal: factura.subtotal,
      iva: factura.iva,
      total: factura.total,
      dias_pago: factura.dias_pago || '',
    });
    setMostrarFormulario(true);
  };

  const eliminarFactura = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await deleteCompra(id);
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar factura:', error);
        alert('Error al eliminar la factura. Por favor intente nuevamente.');
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de nueva factura */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestión de Facturas de Proveedores
        </h2>
        <button
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {facturaSeleccionada ? 'Editar Factura' : 'Nueva Factura'}
            </h3>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={manejarSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor *
                </label>
                <select
                  value={formulario.proveedor_id}
                  onChange={(e) => manejarCambioFormulario('proveedor_id', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre} - {proveedor.contacto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  value={formulario.numero_factura}
                  onChange={(e) => manejarCambioFormulario('numero_factura', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ej: FAC-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Factura *
                </label>
                <input
                  type="date"
                  value={formulario.fecha}
                  onChange={(e) => manejarCambioFormulario('fecha', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.subtotal}
                  onChange={(e) => manejarCambioFormulario('subtotal', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IVA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.iva}
                  onChange={(e) => manejarCambioFormulario('iva', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.total}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {facturaSeleccionada ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Facturas */}
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
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IVA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              {facturas.map((factura) => (
                <tr key={factura.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {factura.nombre_proveedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.numero_factura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(factura.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearMoneda(factura.subtotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearMoneda(factura.iva)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatearMoneda(factura.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      factura.pagada
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {factura.pagada ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => editarFactura(factura)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarFactura(factura.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
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

export default GestionFacturas;