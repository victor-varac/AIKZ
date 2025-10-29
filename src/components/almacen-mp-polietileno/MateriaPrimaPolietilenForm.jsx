import React, { useState, useEffect } from 'react';

const MateriaPrimaPolietilenForm = ({ isOpen, materiaPrima, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'resina_virgen_natural',
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
        tipo: materiaPrima.tipo || 'resina_virgen_natural',
        unidad_medida: materiaPrima.unidad_medida || 'kg',
        requiere_procesamiento: materiaPrima.requiere_procesamiento || false,
        proceso_asociado: materiaPrima.proceso_asociado || '',
        stock_minimo: materiaPrima.stock_minimo || '',
        precio_promedio: materiaPrima.precio_promedio || ''
      });
    } else {
      // Reset form para nueva materia prima
      setFormData({
        nombre: '',
        tipo: 'resina_virgen_natural',
        unidad_medida: 'kg',
        requiere_procesamiento: false,
        proceso_asociado: '',
        stock_minimo: '',
        precio_promedio: ''
      });
    }
    setError(null);
  }, [materiaPrima, isOpen]);

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

  const tiposPolietileno = [
    { value: 'resina_virgen_natural', label: '🔹 Resina Virgen Natural' },
    { value: 'resina_virgen_color', label: '🎨 Resina Virgen Color' },
    { value: 'arana_bolsas', label: '🕷️ Araña para Bolsas' },
    { value: 'pellet_reciclado', label: '♻️ Pellet Reciclado' }
  ];

  const unidadesMedida = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'toneladas', label: 'Toneladas (t)' },
    { value: 'litros', label: 'Litros (L)' },
    { value: 'unidades', label: 'Unidades (pzs)' }
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
                {materiaPrima ? '✏️ Editar Materia Prima - Polietileno' : '➕ Nueva Materia Prima - Polietileno'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {materiaPrima ? 'Modifica los datos de la materia prima' : 'Completa la información para registrar una nueva materia prima de polietileno'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Materia Prima *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Resina Natural HDPE"
                disabled={loading}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Materia Prima *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {tiposPolietileno.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unidad de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida *
              </label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {unidadesMedida.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>
                    {unidad.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.stock_minimo}
                onChange={(e) => handleInputChange('stock_minimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            {/* Precio Promedio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Promedio (Opcional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_promedio}
                onChange={(e) => handleInputChange('precio_promedio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            {/* Requiere Procesamiento */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiere_procesamiento"
                  checked={formData.requiere_procesamiento}
                  onChange={(e) => handleInputChange('requiere_procesamiento', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="requiere_procesamiento" className="ml-2 block text-sm text-gray-700">
                  Requiere procesamiento adicional
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Marca esta opción si la materia prima necesita ser procesada antes de usarse en producción
              </p>
            </div>

            {/* Proceso Asociado */}
            {formData.requiere_procesamiento && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proceso Asociado
                </label>
                <input
                  type="text"
                  value={formData.proceso_asociado}
                  onChange={(e) => handleInputChange('proceso_asociado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Pelletizado, Secado, Mezcla"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe el proceso que requiere esta materia prima
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (materiaPrima ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MateriaPrimaPolietilenForm;