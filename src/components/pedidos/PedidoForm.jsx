import React, { useState, useEffect } from 'react';
import { getProductosPorMaterial } from '../../services/api/productos';

const PedidoForm = ({ isOpen, onClose, onSave, pedido = null, notaVentaId }) => {
  const [formData, setFormData] = useState({
    productos_id: '',
    cantidad: '',
    precio_unitario_venta: '',
    notas_venta_id: notaVentaId
  });

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadProductos();
      if (pedido) {
        // Modo edición
        setFormData({
          productos_id: pedido.productos?.id || '',
          cantidad: pedido.cantidad || '',
          precio_unitario_venta: pedido.precio_unitario_venta || '',
          notas_venta_id: notaVentaId
        });
        setSearchQuery(pedido.productos?.nombre || '');
      } else {
        // Modo creación
        resetForm();
      }
    }
  }, [isOpen, pedido, notaVentaId]);

  // Detectar clicks fuera del componente de sugerencias
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const loadProductos = async () => {
    try {
      setLoadingProductos(true);

      // Cargar productos de ambos materiales
      const [celofanResponse, polietilenoResponse] = await Promise.all([
        getProductosPorMaterial('celofan', { limit: 50 }),
        getProductosPorMaterial('polietileno', { limit: 50 })
      ]);

      const todosLosProductos = [
        ...(celofanResponse.data || []),
        ...(polietilenoResponse.data || [])
      ];

      setProductos(todosLosProductos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoadingProductos(false);
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

    // No auto-completar precio ya que los productos no tienen precio en catálogo
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productos_id) {
      newErrors.productos_id = 'Debe seleccionar un producto';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.precio_unitario_venta || formData.precio_unitario_venta <= 0) {
      newErrors.precio_unitario_venta = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const pedidoData = {
        ...formData,
        productos_id: parseInt(formData.productos_id),
        cantidad: parseFloat(formData.cantidad),
        precio_unitario_venta: parseFloat(formData.precio_unitario_venta)
      };

      await onSave(pedidoData, pedido?.id);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      setErrors({
        submit: error.message || 'Error al guardar el pedido'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productos_id: '',
      cantidad: '',
      precio_unitario_venta: '',
      notas_venta_id: notaVentaId
    });
    setErrors({});
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const filteredProductos = productos.filter(producto => {
    const query = searchQuery.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(query) ||
      producto.material.toLowerCase().includes(query) ||
      `${producto.ancho_cm}x${producto.largo_cm}`.includes(query)
    );
  });

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSelectProducto = (producto) => {
    setFormData(prev => ({
      ...prev,
      productos_id: producto.id
    }));
    setSearchQuery(producto.nombre);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (errors.productos_id) {
      setErrors(prev => ({
        ...prev,
        productos_id: ''
      }));
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredProductos.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredProductos.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectProducto(filteredProductos[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calcularTotal = () => {
    const cantidad = parseFloat(formData.cantidad) || 0;
    const precio = parseFloat(formData.precio_unitario_venta) || 0;
    return cantidad * precio;
  };

  const getProductoSeleccionado = () => {
    return productos.find(p => p.id === parseInt(formData.productos_id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {pedido ? 'Editar Producto' : 'Agregar Producto'}
              </h2>
              <p className="text-sm text-gray-500">
                {pedido ? 'Modifica los datos del producto' : 'Agrega un nuevo producto a la nota de venta'}
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

          {/* Búsqueda inteligente de producto */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Producto *
            </label>
            <div ref={suggestionsRef} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                disabled={loadingProductos || (pedido && true)}
                placeholder={loadingProductos ? 'Cargando productos...' : 'Buscar por nombre, material o dimensiones...'}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.productos_id ? 'border-red-300' : 'border-gray-300'
                }`}
              />

              {/* Dropdown de sugerencias */}
              {showSuggestions && !loadingProductos && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
                  {filteredProductos.length > 0 ? (
                    filteredProductos.map((producto, index) => (
                      <div
                        key={producto.id}
                        onClick={() => handleSelectProducto(producto)}
                        className={`px-3 py-2 cursor-pointer transition-colors ${
                          index === selectedIndex
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-xs opacity-75">
                          {producto.material} • {producto.ancho_cm}x{producto.largo_cm}cm
                          {producto.micraje_um && ` • ${producto.micraje_um}μm`}
                        </div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No se encontraron productos que coincidan con "{searchQuery}"
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      Empieza a escribir para buscar productos
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.productos_id && (
              <p className="text-red-600 text-xs">{errors.productos_id}</p>
            )}
          </div>

          {/* Vista previa del producto */}
          {getProductoSeleccionado() && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Producto seleccionado</h4>
              <div className="text-sm text-blue-800">
                <p><span className="font-medium">Material:</span> {getProductoSeleccionado().material}</p>
                <p><span className="font-medium">Dimensiones:</span> {getProductoSeleccionado().ancho_cm}x{getProductoSeleccionado().largo_cm}cm</p>
                {getProductoSeleccionado().micraje_um && (
                  <p><span className="font-medium">Micraje:</span> {getProductoSeleccionado().micraje_um}μm</p>
                )}
                <p><span className="font-medium">Tipo:</span> {getProductoSeleccionado().tipo}</p>
                <p><span className="font-medium">Presentación:</span> {getProductoSeleccionado().presentacion}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cantidad */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cantidad *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cantidad ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.cantidad && (
                <p className="text-red-600 text-xs">{errors.cantidad}</p>
              )}
            </div>

            {/* Precio unitario */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Precio unitario *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_unitario_venta}
                onChange={(e) => handleInputChange('precio_unitario_venta', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.precio_unitario_venta ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.precio_unitario_venta && (
                <p className="text-red-600 text-xs">{errors.precio_unitario_venta}</p>
              )}
            </div>
          </div>

          {/* Cálculo total */}
          {formData.cantidad && formData.precio_unitario_venta && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">💰 Total calculado</h4>
              <div className="text-green-800">
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(calcularTotal())}
                </p>
                <p className="text-sm">
                  {formData.cantidad} × {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(formData.precio_unitario_venta)}
                </p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Información</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Los campos marcados con (*) son obligatorios</li>
              <li>• El precio se puede modificar independientemente del catálogo</li>
              <li>• Los totales de la nota se recalcularán automáticamente</li>
              {pedido && <li>• Al modificar este producto se actualizarán todas las estadísticas</li>}
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
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{pedido ? 'Actualizando...' : 'Agregando...'}</span>
                </div>
              ) : (
                pedido ? 'Actualizar producto' : 'Agregar producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PedidoForm;