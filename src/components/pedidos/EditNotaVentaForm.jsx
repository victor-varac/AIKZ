import React, { useState, useEffect } from 'react';
import { getClientes } from '../../services/api/clientes';

const EditNotaVentaForm = ({ isOpen, onClose, onSave, notaVenta }) => {
  const [formData, setFormData] = useState({
    numero_factura: '',
    fecha: '',
    clientes_id: '',
    descuento: 0,
    subtotal: 0,
    iva: 0,
    total: 0,
    aplicar_iva: false
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClientes();
      if (notaVenta) {
        // Acceder al clientes_id desde la relación clientes o directamente
        const clienteId = notaVenta.clientes_id || (notaVenta.clientes?.id) || '';

        const newFormData = {
          numero_factura: notaVenta.numero_factura || '',
          fecha: notaVenta.fecha || '',
          clientes_id: String(clienteId), // Convertir a string para el select
          descuento: notaVenta.descuento || 0,
          subtotal: notaVenta.subtotal || 0,
          iva: notaVenta.iva || 0,
          total: notaVenta.total || 0,
          aplicar_iva: (notaVenta.iva || 0) > 0 // Si hay IVA, entonces estaba aplicado
        };

        setFormData(newFormData);

        console.log('Datos de la nota de venta para editar:', {
          original: notaVenta,
          formData: newFormData,
          clienteId,
          clientes_id: notaVenta.clientes_id,
          clientes: notaVenta.clientes
        });
      }
    }
  }, [isOpen, notaVenta]);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await getClientes({ limit: 1000 });
      setClientes(response.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Calcular totales basados en subtotal original
  const calcularTotales = (descuento = formData.descuento, aplicarIva = formData.aplicar_iva) => {
    const subtotalOriginal = notaVenta?.subtotal || 0;
    const descuentoAplicado = (subtotalOriginal * descuento) / 100;
    const subtotalConDescuento = subtotalOriginal - descuentoAplicado;
    const iva = aplicarIva ? subtotalConDescuento * 0.16 : 0;
    const total = subtotalConDescuento + iva;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotalOriginal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Recalcular totales si cambió el descuento
    if (name === 'descuento') {
      setTimeout(() => calcularTotales(newValue, formData.aplicar_iva), 0);
    }
  };

  const handleIvaChange = (aplicar) => {
    setFormData(prev => ({ ...prev, aplicar_iva: aplicar }));
    setTimeout(() => calcularTotales(formData.descuento, aplicar), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.numero_factura.trim()) {
      alert('El número de factura es requerido');
      return;
    }

    if (!formData.fecha) {
      alert('La fecha es requerida');
      return;
    }

    if (!formData.clientes_id) {
      alert('Debe seleccionar un cliente');
      return;
    }

    try {
      setLoading(true);
      // Remover aplicar_iva del formData ya que no existe en la base de datos
      const { aplicar_iva, ...notaVentaData } = formData;
      await onSave(notaVentaData);
      onClose();
    } catch (error) {
      console.error('Error al guardar nota de venta:', error);
      alert('Error al guardar la nota de venta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Solo resetear el formulario si se desea
    // setFormData({
    //   numero_factura: '',
    //   fecha: '',
    //   clientes_id: '',
    //   descuento: 0
    // });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ✏️ Editar Nota de Venta
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Debug info temporal */}
        {process.env.NODE_ENV === 'development' && notaVenta && (
          <div className="p-4 bg-gray-100 border-b text-xs text-gray-600">
            <p><strong>Debug:</strong></p>
            <p>clientes_id: {notaVenta.clientes_id}</p>
            <p>clientes.id: {notaVenta.clientes?.id}</p>
            <p>formData.clientes_id: {formData.clientes_id}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Número de factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Factura <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero_factura"
              value={formData.numero_factura}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: FAC-001"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            {loadingClientes ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">Cargando clientes...</span>
                </div>
              </div>
            ) : (
              <select
                name="clientes_id"
                value={formData.clientes_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.empresa} - {cliente.nombre_contacto}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="descuento"
                value={formData.descuento}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje de descuento aplicado al subtotal (0-100%)
            </p>
          </div>

          {/* Con Factura (IVA) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Con Factura
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={formData.aplicar_iva}
                onChange={(e) => handleIvaChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-600">
                Aplicar IVA (16%)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Marcar si la venta requiere factura con IVA
            </p>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Totales Recalculados</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subtotal
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  ${(formData.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  IVA (16%)
                </label>
                <div className={`text-lg font-semibold ${formData.aplicar_iva ? 'text-gray-900' : 'text-gray-400'}`}>
                  {formData.aplicar_iva
                    ? `$${(formData.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                    : 'Sin IVA'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total
                </label>
                <div className="text-xl font-bold text-blue-600">
                  ${(formData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 text-lg mt-0.5">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Los totales se recalcularán automáticamente según los productos</li>
                  <li>El cambio de cliente puede afectar los días de crédito</li>
                  <li>El descuento en porcentaje se aplicará al subtotal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotaVentaForm;