import React, { useState, useEffect } from 'react';
import { createVendedor, updateVendedor } from '../../services/api/vendedores';

const VendedorForm = ({ isOpen, onClose, onVendedorCreated, vendedor }) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-llenar formulario cuando es edición
  useEffect(() => {
    if (isOpen) {
      if (vendedor) {
        // Modo edición: pre-llenar con datos del vendedor
        setFormData({
          nombre: vendedor.nombre || ''
        });
      } else {
        // Modo creación: resetear formulario
        setFormData({
          nombre: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, vendedor]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del vendedor es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const vendedorData = {
        nombre: formData.nombre.trim()
      };

      let resultado;
      if (vendedor) {
        // Modo edición: actualizar vendedor existente
        resultado = await updateVendedor(vendedor.id, vendedorData);
      } else {
        // Modo creación: crear nuevo vendedor
        resultado = await createVendedor(vendedorData);
      }

      resetForm();
      onVendedorCreated?.(resultado);
      onClose();
    } catch (error) {
      console.error('Error al procesar vendedor:', error);
      const action = vendedor ? 'actualizar' : 'crear';
      setErrors({
        submit: error.message || `Error al ${action} el vendedor`
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {vendedor ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h2>
              <p className="text-sm text-gray-500">
                {vendedor ? 'Modifica la información del vendedor' : 'Registra un nuevo vendedor en el equipo'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-800 text-sm">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Información del vendedor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">👤 Información del vendedor</h3>

            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Juan Pérez García"
                maxLength={100}
              />
              {errors.nombre && (
                <p className="text-red-600 text-xs">{errors.nombre}</p>
              )}
              <p className="text-xs text-gray-500">
                Ingresa el nombre completo del vendedor ({formData.nombre.length}/100)
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Información</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• El nombre debe ser único en el sistema</li>
              <li>• Una vez creado, podrás asignar clientes a este vendedor</li>
              <li>• El vendedor aparecerá en las listas de selección</li>
              <li>• Podrás ver estadísticas de ventas una vez asignado a clientes</li>
            </ul>
          </div>

          {/* Vista previa */}
          {formData.nombre.trim() && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">👁️ Vista previa</h4>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🤝</span>
                  <div>
                    <div className="font-medium text-gray-900">{formData.nombre.trim()}</div>
                    <div className="text-xs text-gray-500">Vendedor del equipo</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{vendedor ? 'Actualizando...' : 'Creando...'}</span>
                </div>
              ) : (
                vendedor ? 'Actualizar vendedor' : 'Crear vendedor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendedorForm;