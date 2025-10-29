import React, { useState, useEffect } from 'react';
import { getMateriasPrimasCelofan, createMovimientoMateriaPrima } from '../../services/api/almacenMp';

const EntradaMpForm = ({ isOpen, onCancel, onMovimientoCreated, materiaPrimaPreseleccionada }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materia_prima_id: '',
    cantidad: '',
    costo_unitario: '',
    estado_material: 'crudo',
    observaciones: ''
  });

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMateriasPrimas, setLoadingMateriasPrimas] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMateriasPrimas();
  }, []);

  // Recargar materias primas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadMateriasPrimas();
    }
  }, [isOpen]);

  // Pre-seleccionar materia prima si viene preseleccionada o resetear cuando se cierre
  useEffect(() => {
    if (isOpen && materiaPrimaPreseleccionada) {
      setFormData(prev => ({
        ...prev,
        materia_prima_id: materiaPrimaPreseleccionada.materia_prima_id?.toString() || ''
      }));
    } else if (!isOpen) {
      // Resetear formulario cuando se cierre
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        materia_prima_id: '',
        cantidad: '',
        costo_unitario: '',
        estado_material: 'crudo',
        observaciones: ''
      });
      setError(null);
    }
  }, [materiaPrimaPreseleccionada, isOpen]);

  const loadMateriasPrimas = async () => {
    try {
      setLoadingMateriasPrimas(true);
      const data = await getMateriasPrimasCelofan();
      console.log('Materias primas cargadas en EntradaMpForm:', data);
      console.log('Cantidad de materias primas:', data?.length || 0);
      setMateriasPrimas(data || []);
    } catch (err) {
      console.error('Error al cargar materias primas:', err);
      setError('Error al cargar la lista de materias primas');
    } finally {
      setLoadingMateriasPrimas(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error al hacer cambios
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.materia_prima_id || !formData.cantidad || !formData.fecha) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (parseFloat(formData.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const movimientoData = {
        fecha: formData.fecha,
        materia_prima_id: parseInt(formData.materia_prima_id),
        cantidad: parseFloat(formData.cantidad),
        movimiento: 'entrada',
        estado_material: formData.estado_material,
        costo_unitario: formData.costo_unitario ? parseFloat(formData.costo_unitario) : null,
        observaciones: formData.observaciones || null
      };

      await createMovimientoMateriaPrima(movimientoData);

      // Notificar éxito
      const materiaPrimaSeleccionada = materiasPrimas.find(mp => mp.id === parseInt(formData.materia_prima_id));
      alert(`✅ Entrada registrada exitosamente:\n\nMaterial: ${materiaPrimaSeleccionada?.nombre}\nCantidad: ${formData.cantidad} ${materiaPrimaSeleccionada?.unidad_medida}\nFecha: ${formData.fecha}`);

      onMovimientoCreated();
    } catch (err) {
      console.error('Error al registrar entrada:', err);
      setError(err.message || 'Error al registrar la entrada');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loadingMateriasPrimas) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">📥 Nueva Entrada de Materia Prima</h2>
              <p className="text-gray-600 mt-1">
                Registra una nueva entrada de materia prima al almacén
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400 mr-3">⚠️</div>
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materia Prima <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.materia_prima_id}
            onChange={(e) => handleInputChange('materia_prima_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">
              {materiasPrimas.length === 0 ? 'No hay materias primas disponibles' : 'Seleccionar material...'}
            </option>
            {materiasPrimas.map((mp) => (
              <option key={mp.id} value={mp.id}>
                {mp.nombre} ({mp.unidad_medida})
              </option>
            ))}
          </select>
          {materiasPrimas.length === 0 && !loadingMateriasPrimas && (
            <p className="mt-1 text-sm text-orange-600">
              ⚠️ No hay materias primas registradas. Ve al tab "Materia Prima" para crear una primera.
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Costo unitario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Costo Unitario
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.costo_unitario}
            onChange={(e) => handleInputChange('costo_unitario', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        {/* Estado del material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado del Material
          </label>
          <select
            value={formData.estado_material}
            onChange={(e) => handleInputChange('estado_material', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="crudo">Crudo</option>
            <option value="procesado">Procesado</option>
            <option value="listo_produccion">Listo para Producción</option>
          </select>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows="3"
          placeholder="Notas adicionales sobre la entrada..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : '📥 Registrar Entrada'}
        </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntradaMpForm;