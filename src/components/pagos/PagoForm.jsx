import React, { useState } from 'react';

const PagoForm = ({ isOpen, onClose, onSave, notaVenta }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    importe: '',
    metodo_pago: 'efectivo',
    foto_comprobante: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const metodoPagoOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    if (!formData.importe || formData.importe <= 0) {
      newErrors.importe = 'El importe debe ser mayor a 0';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'El método de pago es obligatorio';
    }

    // Validar que el importe no exceda el saldo pendiente
    const saldoPendiente = notaVenta?.estadisticas?.saldoPendiente || 0;
    if (parseFloat(formData.importe) > saldoPendiente) {
      newErrors.importe = `El importe no puede exceder el saldo pendiente (${formatCurrency(saldoPendiente)})`;
    }

    return newErrors;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        notas_venta_id: notaVenta.id,
        importe: parseFloat(formData.importe)
      });

      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        importe: '',
        metodo_pago: 'efectivo',
        foto_comprobante: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error al guardar pago:', error);
      setErrors({ submit: error.message || 'Error al guardar el pago' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        importe: '',
        metodo_pago: 'efectivo',
        foto_comprobante: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  const saldoPendiente = notaVenta?.estadisticas?.saldoPendiente || 0;
  const totalFactura = notaVenta?.total || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              💰 Registrar Pago
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Factura #:</span>
                <span className="font-medium">{notaVenta?.numero_factura}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Factura:</span>
                <span className="font-medium">{formatCurrency(totalFactura)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo Pendiente:</span>
                <span className={`font-bold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del Pago *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.fecha ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="importe"
                value={formData.importe}
                onChange={handleInputChange}
                disabled={loading}
                step="0.01"
                min="0.01"
                max={saldoPendiente}
                placeholder="0.00"
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.importe ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.importe && (
              <p className="mt-1 text-sm text-red-600">{errors.importe}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Máximo: {formatCurrency(saldoPendiente)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              name="metodo_pago"
              value={formData.metodo_pago}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.metodo_pago ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {metodoPagoOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.metodo_pago && (
              <p className="mt-1 text-sm text-red-600">{errors.metodo_pago}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Comprobante (URL)
            </label>
            <input
              type="url"
              name="foto_comprobante"
              value={formData.foto_comprobante}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="https://ejemplo.com/comprobante.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Opcional: URL de la imagen del comprobante de pago
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || saldoPendiente <= 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Registrar Pago'
              )}
            </button>
          </div>

          {saldoPendiente <= 0 && (
            <p className="text-sm text-green-600 text-center">
              ✅ Esta factura ya está completamente pagada
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PagoForm;