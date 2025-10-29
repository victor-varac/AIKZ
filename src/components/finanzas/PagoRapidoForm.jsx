import React, { useState, useEffect } from 'react';

const PagoRapidoForm = ({ isOpen, onClose, onSave, cuenta }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    importe: '',
    metodo_pago: 'efectivo',
    foto_comprobante: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cuenta) {
      setFormData(prev => ({
        ...prev,
        importe: cuenta.saldo_pendiente?.toString() || ''
      }));
    }
    setErrors({});
  }, [isOpen, cuenta]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.importe || parseFloat(formData.importe) <= 0) {
      newErrors.importe = 'El importe debe ser mayor a 0';
    } else if (parseFloat(formData.importe) > (cuenta?.saldo_pendiente || 0)) {
      newErrors.importe = 'El importe no puede ser mayor al saldo pendiente';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'El método de pago es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Cuenta seleccionada:', cuenta);

      if (!cuenta || !cuenta.numero_factura) {
        throw new Error('No se puede procesar el pago: información de cuenta incompleta');
      }

      const pagoData = {
        numero_factura: cuenta.numero_factura,
        fecha: formData.fecha,
        importe: parseFloat(formData.importe),
        metodo_pago: formData.metodo_pago,
        foto_comprobante: formData.foto_comprobante || null,
        notas: formData.notas || null
      };

      console.log('Datos a enviar:', pagoData);

      await onSave(pagoData);
      onClose();

      // Resetear formulario
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        importe: '',
        metodo_pago: 'efectivo',
        foto_comprobante: '',
        notas: ''
      });

    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              💰 Registrar Pago
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información de la cuenta */}
          {cuenta && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Información de la Cuenta</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Cliente:</span> {cuenta.nombre_cliente}</p>
                <p><span className="font-medium">Factura:</span> #{cuenta.numero_factura}</p>
                <p><span className="font-medium">Saldo pendiente:</span> {formatCurrency(cuenta.saldo_pendiente)}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fecha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.importe}
                  onChange={(e) => handleInputChange('importe', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.importe ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.importe && <p className="text-red-500 text-xs mt-1">{errors.importe}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={formData.metodo_pago}
                onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.metodo_pago ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar método</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="cheque">Cheque</option>
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
                <option value="tarjeta_debito">Tarjeta de Débito</option>
                <option value="deposito">Depósito Bancario</option>
              </select>
              {errors.metodo_pago && <p className="text-red-500 text-xs mt-1">{errors.metodo_pago}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante (URL)
              </label>
              <input
                type="url"
                value={formData.foto_comprobante}
                onChange={(e) => handleInputChange('foto_comprobante', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/comprobante.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">URL de la imagen del comprobante (opcional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas adicionales sobre el pago..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PagoRapidoForm;