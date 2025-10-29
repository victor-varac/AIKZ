import React, { useState, useEffect } from 'react';
import { createCliente, updateCliente, getVendedores } from '../../services/api/clientes';

const ClienteForm = ({ isOpen, onClose, onClienteCreated, cliente }) => {
  const [formData, setFormData] = useState({
    nombre_contacto: '',
    empresa: '',
    correo: '',
    telefono: '',
    direccion: '',
    dias_credito: 30,
    estado: true,
    vendedores_id: ''
  });

  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadVendedores();

      // Pre-llenar formulario si es edición
      if (cliente) {
        setFormData({
          nombre_contacto: cliente.nombre_contacto || '',
          empresa: cliente.empresa || '',
          correo: cliente.correo || '',
          telefono: cliente.telefono || '',
          direccion: cliente.direccion || '',
          dias_credito: cliente.dias_credito || 30,
          estado: cliente.estado !== undefined ? cliente.estado : true,
          vendedores_id: cliente.vendedores_id || cliente.vendedores?.id || ''
        });
      } else {
        // Resetear para nuevo cliente
        setFormData({
          nombre_contacto: '',
          empresa: '',
          correo: '',
          telefono: '',
          direccion: '',
          dias_credito: 30,
          estado: true,
          vendedores_id: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, cliente]);

  const loadVendedores = async () => {
    try {
      setLoadingVendedores(true);
      const vendedoresData = await getVendedores();
      setVendedores(vendedoresData || []);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      setVendedores([]);
    } finally {
      setLoadingVendedores(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'El nombre de la empresa es requerido';
    }

    if (!formData.nombre_contacto.trim()) {
      newErrors.nombre_contacto = 'El nombre del contacto es requerido';
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo electrónico no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.vendedores_id) {
      newErrors.vendedores_id = 'Debe seleccionar un vendedor';
    }

    if (formData.dias_credito < 0 || formData.dias_credito > 365) {
      newErrors.dias_credito = 'Los días de crédito deben estar entre 0 y 365';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const clienteData = {
        ...formData,
        dias_credito: parseInt(formData.dias_credito),
        vendedores_id: parseInt(formData.vendedores_id)
      };

      let resultado;
      if (cliente) {
        // Modo edición: actualizar cliente existente
        resultado = await updateCliente(cliente.id, clienteData);
      } else {
        // Modo creación: crear nuevo cliente
        resultado = await createCliente(clienteData);
      }

      resetForm();
      onClienteCreated?.(resultado);
      onClose();
    } catch (error) {
      console.error('Error al procesar cliente:', error);
      const action = cliente ? 'actualizar' : 'crear';
      setErrors({
        submit: error.message || `Error al ${action} el cliente`
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_contacto: '',
      empresa: '',
      correo: '',
      telefono: '',
      direccion: '',
      dias_credito: 30,
      estado: true,
      vendedores_id: ''
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-sm text-gray-500">
                {cliente ? 'Modifica la información del cliente' : 'Registra un nuevo cliente en el sistema'}
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

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">📋 Información básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.empresa ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre de la empresa"
                />
                {errors.empresa && (
                  <p className="text-red-600 text-xs">{errors.empresa}</p>
                )}
              </div>

              {/* Nombre del contacto */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del contacto *
                </label>
                <input
                  type="text"
                  value={formData.nombre_contacto}
                  onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nombre_contacto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del contacto principal"
                />
                {errors.nombre_contacto && (
                  <p className="text-red-600 text-xs">{errors.nombre_contacto}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.correo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="correo@empresa.com"
                />
                {errors.correo && (
                  <p className="text-red-600 text-xs">{errors.correo}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.telefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="55-1234-5678"
                />
                {errors.telefono && (
                  <p className="text-red-600 text-xs">{errors.telefono}</p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa del cliente"
              />
            </div>
          </div>

          {/* Configuración comercial */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">💼 Configuración comercial</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendedor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vendedor asignado *
                </label>
                <select
                  value={formData.vendedores_id}
                  onChange={(e) => handleInputChange('vendedores_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vendedores_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loadingVendedores}
                >
                  <option value="">
                    {loadingVendedores ? 'Cargando vendedores...' : 'Seleccionar vendedor'}
                  </option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </option>
                  ))}
                </select>
                {errors.vendedores_id && (
                  <p className="text-red-600 text-xs">{errors.vendedores_id}</p>
                )}
              </div>

              {/* Días de crédito */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Días de crédito
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={formData.dias_credito}
                  onChange={(e) => handleInputChange('dias_credito', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dias_credito ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errors.dias_credito && (
                  <p className="text-red-600 text-xs">{errors.dias_credito}</p>
                )}
                <p className="text-xs text-gray-500">
                  Número de días para pago a crédito (0-365)
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado del cliente
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={true}
                    checked={formData.estado === true}
                    onChange={() => handleInputChange('estado', true)}
                    className="mr-2"
                  />
                  <span className="text-sm text-green-700">🟢 Activo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={false}
                    checked={formData.estado === false}
                    onChange={() => handleInputChange('estado', false)}
                    className="mr-2"
                  />
                  <span className="text-sm text-red-700">🔴 Inactivo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Información</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Los campos marcados con (*) son obligatorios</li>
              <li>• El cliente se creará con estado activo por defecto</li>
              <li>• Asegúrate de asignar un vendedor responsable</li>
              <li>• Los días de crédito definen el plazo de pago</li>
            </ul>
          </div>

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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? (cliente ? 'Actualizando...' : 'Creando...')
                : (cliente ? 'Actualizar cliente' : 'Crear cliente')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;