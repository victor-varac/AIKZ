import React, { useState } from 'react';
import { createProducto, updateProducto } from '../../services/api/productos';
import Modal from '../common/Modal';

const ProductoForm = ({ isOpen, onClose, onSuccess, material, producto }) => {
  const [formData, setFormData] = useState({
    material: material || 'celofan',
    presentacion: '',
    tipo: '',
    ancho_cm: '',
    largo_cm: '',
    micraje_um: '',
    nombre: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resetear o pre-llenar formulario cuando se abre
  React.useEffect(() => {
    if (isOpen) {
      if (producto) {
        // Modo edición: pre-llenar con datos del producto
        setFormData({
          material: producto.material || material || 'celofan',
          presentacion: producto.presentacion || '',
          tipo: producto.tipo || '',
          ancho_cm: producto.ancho_cm || '',
          largo_cm: producto.largo_cm || '',
          micraje_um: producto.micraje_um || '',
          nombre: producto.nombre || ''
        });
      } else {
        // Modo creación: resetear formulario
        setFormData({
          material: material || 'celofan',
          presentacion: '',
          tipo: '',
          ancho_cm: '',
          largo_cm: '',
          micraje_um: '',
          nombre: ''
        });
      }
      setError('');
    }
  }, [isOpen, material, producto]);

  const handleInputChange = (field, value) => {
    let newFormData = {
      ...formData,
      [field]: value
    };

    // Reset tipo cuando cambia la presentación
    if (field === 'presentacion') {
      newFormData.tipo = '';
    }

    setFormData(newFormData);

    // Auto-generar nombre del producto
    if (['presentacion', 'tipo', 'ancho_cm', 'largo_cm', 'micraje_um'].includes(field)) {
      generateProductName(newFormData);
    }
  };

  const generateProductName = (data) => {
    const materialName = data.material === 'celofan' ? 'Celofán' : 'Polietileno';
    const presentacion = data.presentacion ? ` ${data.presentacion}` : '';
    const ancho = data.ancho_cm ? ` ${data.ancho_cm}cm` : '';
    const largo = data.largo_cm ? `x${data.largo_cm}cm` : '';
    const micraje = data.micraje_um ? ` ${data.micraje_um}μm` : '';
    const tipo = data.tipo ? ` ${data.tipo}` : '';

    const nombre = `${materialName}${presentacion}${ancho}${largo}${micraje}${tipo}`.trim();

    setFormData(prev => ({
      ...prev,
      nombre: nombre
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.presentacion) {
      setError('Debe seleccionar una presentación');
      return;
    }

    if (!formData.tipo) {
      setError('Debe seleccionar un tipo');
      return;
    }

    if (!formData.ancho_cm || parseFloat(formData.ancho_cm) <= 0) {
      setError('El ancho debe ser mayor a 0');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar datos para envío
      const productoData = {
        ...formData,
        ancho_cm: parseFloat(formData.ancho_cm) || null,
        largo_cm: parseFloat(formData.largo_cm) || null,
        micraje_um: parseFloat(formData.micraje_um) || null,
        nombre: formData.nombre.trim()
      };

      if (producto) {
        // Modo edición: actualizar producto existente
        await updateProducto(producto.id, productoData);
      } else {
        // Modo creación: crear nuevo producto
        await createProducto(productoData);
      }

      // Resetear formulario
      setFormData({
        material: material || 'celofan',
        presentacion: '',
        tipo: '',
        ancho_cm: '',
        largo_cm: '',
        micraje_um: '',
        nombre: ''
      });

      onSuccess();
      onClose();
    } catch (err) {
      const action = producto ? 'actualizar' : 'guardar';
      setError(`Error al ${action} el producto: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Opciones de presentación basadas en el material
  const getPresentacionOptions = () => {
    if (formData.material === 'celofan') {
      return [
        { value: 'micraje', label: '📏 Micraje', description: 'Medida en micrones' },
        { value: 'gramaje', label: '⚖️ Gramaje', description: 'Medida en gramos por metro cuadrado' }
      ];
    } else if (formData.material === 'polietileno') {
      return [
        { value: 'bobina', label: '🌀 Bobina', description: 'Producto en bobina industrial' },
        { value: 'bolsa', label: '🛍️ Bolsa', description: 'Producto en formato de bolsa' }
      ];
    }
    return [];
  };

  // Opciones de tipo basadas en la presentación
  const getTipoOptions = () => {
    if (formData.material === 'celofan') {
      if (formData.presentacion === 'micraje') {
        return [
          { value: 'mordaza', label: '🔧 Mordaza', description: 'Tipo mordaza' },
          { value: 'lateral', label: '↔️ Lateral', description: 'Tipo lateral' },
          { value: 'pegol', label: '🔗 Pegol', description: 'Tipo pegol' },
          { value: 'cenefa + pegol', label: '🎀 Cenefa + Pegol', description: 'Tipo cenefa con pegol' }
        ];
      } else if (formData.presentacion === 'gramaje') {
        return [
          { value: '100gr corta', label: '📦 100gr Corta', description: '100 gramos presentación corta' },
          { value: '100gr larga', label: '📦 100gr Larga', description: '100 gramos presentación larga' },
          { value: '150gr', label: '📦 150gr', description: '150 gramos' },
          { value: '250gr', label: '📦 250gr', description: '250 gramos' },
          { value: '500gr', label: '📦 500gr', description: '500 gramos' },
          { value: '1kg', label: '📦 1kg', description: '1 kilogramo' },
          { value: '1.5kg', label: '📦 1.5kg', description: '1.5 kilogramos' },
          { value: '2kg', label: '📦 2kg', description: '2 kilogramos' },
          { value: '2.5kg', label: '📦 2.5kg', description: '2.5 kilogramos' },
          { value: '3kg', label: '📦 3kg', description: '3 kilogramos' }
        ];
      }
    } else if (formData.material === 'polietileno') {
      if (formData.presentacion === 'bobina' || formData.presentacion === 'bolsa') {
        return [
          { value: 'negra', label: '⚫ Negra', description: 'Color negro' },
          { value: 'semi natural', label: '🟫 Semi Natural', description: 'Color semi natural' },
          { value: 'virgen', label: '⚪ Virgen', description: 'Material virgen' },
          { value: 'color', label: '🌈 Color', description: 'Con color' }
        ];
      }
    }
    return [];
  };

  const getMaterialTitle = () => {
    return material === 'celofan' ? 'Celofán' : 'Polietileno';
  };

  const getMaterialIcon = () => {
    return material === 'celofan' ? '📄' : '🛢️';
  };

  const getModalTitle = () => {
    const icon = getMaterialIcon();
    const materialTitle = getMaterialTitle();
    return producto
      ? `${icon} Editar Producto de ${materialTitle}`
      : `${icon} Nuevo Producto de ${materialTitle}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Vista previa del nombre */}
        {formData.nombre && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm font-medium text-blue-800 mb-1">Vista previa del nombre:</div>
            <div className="text-lg font-semibold text-blue-900">{formData.nombre}</div>
          </div>
        )}

        {/* Material (solo lectura) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material
          </label>
          <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getMaterialIcon()}</span>
              <span className="font-medium capitalize">{getMaterialTitle()}</span>
            </div>
          </div>
        </div>

        {/* Presentación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Presentación *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {getPresentacionOptions().map(option => (
              <label
                key={option.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.presentacion === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="presentacion"
                  value={option.value}
                  checked={formData.presentacion === option.value}
                  onChange={(e) => handleInputChange('presentacion', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                {formData.presentacion === option.value && (
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {getTipoOptions().map(option => (
              <label
                key={option.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.tipo === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={option.value}
                  checked={formData.tipo === option.value}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                {formData.tipo === option.value && (
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Especificaciones técnicas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📏 Especificaciones Técnicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ancho - Siempre se muestra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.ancho_cm}
                onChange={(e) => handleInputChange('ancho_cm', e.target.value)}
                placeholder="Ej: 30.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Largo - Solo para Celofán (Micraje y Gramaje) y Polietileno Bolsa */}
            {((formData.material === 'celofan' && (formData.presentacion === 'micraje' || formData.presentacion === 'gramaje')) ||
              (formData.material === 'polietileno' && formData.presentacion === 'bolsa')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largo (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.largo_cm}
                  onChange={(e) => handleInputChange('largo_cm', e.target.value)}
                  placeholder="Ej: 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Micraje - Para Celofán (Micraje y Gramaje) y Polietileno (Bobina y Bolsa) */}
            {((formData.material === 'celofan' && (formData.presentacion === 'micraje' || formData.presentacion === 'gramaje')) ||
              (formData.material === 'polietileno' && (formData.presentacion === 'bobina' || formData.presentacion === 'bolsa'))) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Micraje (μm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.micraje_um}
                  onChange={(e) => handleInputChange('micraje_um', e.target.value)}
                  placeholder="Ej: 25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Nombre del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Se genera automáticamente o personaliza aquí"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            El nombre se genera automáticamente basado en las especificaciones, pero puedes personalizarlo.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading
              ? (producto ? 'Actualizando...' : 'Guardando...')
              : (producto ? `Actualizar Producto` : `Crear Producto de ${getMaterialTitle()}`)
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductoForm;