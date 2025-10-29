import React, { useState, useEffect } from 'react';

const AjusteInventarioPolietilenoModal = ({ isOpen, onClose, producto, onAjusteCreated }) => {
  const [formData, setFormData] = useState({
    conteoFisico: ''
  });
  const [loading, setLoading] = useState(false);
  const [diferencia, setDiferencia] = useState(0);

  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        conteoFisico: ''
      });
      setDiferencia(0);
    }
  }, [isOpen, producto]);

  useEffect(() => {
    if (formData.conteoFisico !== '') {
      const conteo = parseFloat(formData.conteoFisico) || 0;
      const stockActual = producto?.stock_kilos || 0;
      setDiferencia(conteo - stockActual);
    } else {
      setDiferencia(0);
    }
  }, [formData.conteoFisico, producto]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.conteoFisico || formData.conteoFisico === '') {
      alert('Ingresa el conteo físico real');
      return;
    }

    if (diferencia === 0) {
      alert('No hay diferencia que ajustar. El conteo físico coincide con el stock del sistema.');
      return;
    }

    setLoading(true);
    try {
      const ajusteData = {
        fecha: new Date().toISOString().split('T')[0],
        producto_id: producto.producto_id,
        kilos: Math.abs(diferencia),
        movimiento: diferencia > 0 ? 'entrada' : 'salida',
        produccion_id: null,
        entrega_id: null
      };

      await onAjusteCreated(ajusteData);
      onClose();
    } catch (error) {
      console.error('Error al crear ajuste:', error);
      alert('Error al registrar el ajuste: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stockActual = producto?.stock_kilos || 0;
  const conteoFisico = parseFloat(formData.conteoFisico) || 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              📝 Ajustar Inventario Polietileno
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Información del producto */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Producto</div>
              <div className="text-lg font-semibold text-gray-900">
                {producto?.producto || 'Producto sin nombre'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ID: {producto?.producto_id}
              </div>
            </div>

            {/* Comparación de stocks */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Stock Sistema</div>
                <div className="text-xl font-bold text-blue-900">
                  {stockActual.toLocaleString()} kg
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-700">Conteo Físico</div>
                <div className="text-xl font-bold text-green-900">
                  {conteoFisico.toLocaleString()} kg
                </div>
              </div>
            </div>

            {/* Diferencia */}
            {diferencia !== 0 && (
              <div className={`p-3 rounded-lg mb-4 ${
                diferencia > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium ${
                  diferencia > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  Diferencia Encontrada
                </div>
                <div className={`text-lg font-bold ${
                  diferencia > 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()} kg
                </div>
                <div className={`text-xs ${
                  diferencia > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {diferencia > 0 ? 'Se registrará ENTRADA' : 'Se registrará SALIDA'}
                </div>
              </div>
            )}

            {/* Conteo físico */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteo Físico Real *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.conteoFisico}
                onChange={(e) => handleInputChange('conteoFisico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa los kilogramos contados físicamente"
                disabled={loading}
              />
            </div>

            {/* Información del ajuste */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-700 mb-2">
                📝 Información del Ajuste
              </div>
              <div className="text-xs text-blue-600">
                • Se registrará un movimiento de {diferencia > 0 ? 'entrada' : 'salida'} en el almacén<br/>
                • El ajuste será por {Math.abs(diferencia)} kg<br/>
                • La fecha de registro será {new Date().toLocaleDateString('es-MX')}
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || diferencia === 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrar Ajuste'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjusteInventarioPolietilenoModal;