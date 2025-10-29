import React, { useState, useEffect } from 'react';

const MateriaPrimaForm = ({ isOpen, materiaPrima, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'celofan_rollo',
    unidad_medida: 'kg',
    requiere_procesamiento: false,
    proceso_asociado: '',
    stock_minimo: '',
    precio_promedio: ''
  });

  const [error, setError] = useState(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (materiaPrima) {
      setFormData({
        nombre: materiaPrima.nombre || '',
        tipo: materiaPrima.tipo || 'celofan_rollo',
        unidad_medida: materiaPrima.unidad_medida || 'kg',
        requiere_procesamiento: materiaPrima.requiere_procesamiento || false,
        proceso_asociado: materiaPrima.proceso_asociado || '',
        stock_minimo: materiaPrima.stock_minimo || '',
        precio_promedio: materiaPrima.precio_promedio || ''
      });
    }
  }, [materiaPrima]);

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
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.stock_minimo || parseFloat(formData.stock_minimo) < 0) {
      setError('El stock mínimo debe ser mayor o igual a cero');
      return;
    }

    if (formData.precio_promedio && parseFloat(formData.precio_promedio) < 0) {
      setError('El precio promedio debe ser mayor o igual a cero');
      return;
    }

    try {
      setError(null);

      const submitData = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        unidad_medida: formData.unidad_medida,
        requiere_procesamiento: formData.requiere_procesamiento,
        proceso_asociado: formData.requiere_procesamiento && formData.proceso_asociado
          ? formData.proceso_asociado.trim()
          : null,
        stock_minimo: parseFloat(formData.stock_minimo),
        precio_promedio: formData.precio_promedio ? parseFloat(formData.precio_promedio) : null
      };

      await onSubmit(submitData);
    } catch (err) {
      console.error('Error al guardar materia prima:', err);
      setError(err.message || 'Error al guardar la materia prima');
    }
  };

  const unidadesMedida = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'metros', label: 'Metros (m)' },
    { value: 'toneladas', label: 'Toneladas (t)' },
    { value: 'litros', label: 'Litros (L)' },
    { value: 'unidades', label: 'Unidades (pzs)' },
    { value: 'millares', label: 'Millares' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {materiaPrima ? '✏️ Editar Materia Prima' : '➕ Nueva Materia Prima'}
              </h2>
              <p className="text-gray-600 mt-1">
                {materiaPrima
                  ? 'Modifica los datos de la materia prima'
                  : 'Completa la información para registrar una nueva materia prima de celofán'
                }
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
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Materia Prima <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Rollo de celofán transparente 30cm"
              required
            />
          </div>

          {/* Unidad de medida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Medida <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.unidad_medida}
              onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              {unidadesMedida.map((unidad) => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stock mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.stock_minimo}
              onChange={(e) => handleInputChange('stock_minimo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Precio promedio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Promedio (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_promedio}
              onChange={(e) => handleInputChange('precio_promedio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0.00"
            />
          </div>

          {/* Requiere procesamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Requiere Procesamiento?
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requiere_procesamiento"
                  checked={!formData.requiere_procesamiento}
                  onChange={() => handleInputChange('requiere_procesamiento', false)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requiere_procesamiento"
                  checked={formData.requiere_procesamiento}
                  onChange={() => handleInputChange('requiere_procesamiento', true)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                Sí
              </label>
            </div>
          </div>
        </div>

        {/* Proceso asociado (solo si requiere procesamiento) */}
        {formData.requiere_procesamiento && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proceso Asociado
            </label>
            <textarea
              value={formData.proceso_asociado}
              onChange={(e) => handleInputChange('proceso_asociado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Describe el proceso que requiere esta materia prima..."
            />
          </div>
        )}

        {/* Tipo (oculto, siempre celofan_rollo) */}
        <input
          type="hidden"
          value={formData.tipo}
        />

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (materiaPrima ? '✏️ Actualizar' : '➕ Crear Materia Prima')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MateriaPrimaForm;