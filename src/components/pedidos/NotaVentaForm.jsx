import React, { useState, useEffect } from 'react';
import { getClientes, createNotaVenta } from '../../services/api/pedidos';
import { getProductosPorMaterial } from '../../services/api/productos';
import Modal from '../common/Modal';

const NotaVentaForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    clientes_id: '',
    numero_factura: '',
    descuento: 0,
    subtotal: 0,
    iva: 0,
    total: 0,
    aplicar_iva: false
  });

  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para autocompletado de cliente
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estados para autocompletado de productos por pedido
  const [busquedaProductos, setBusquedaProductos] = useState({});
  const [productosFiltrados, setProductosFiltrados] = useState({});
  const [mostrarSugerenciasProducto, setMostrarSugerenciasProducto] = useState({});
  const [productosSeleccionados, setProductosSeleccionados] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      // Reset form when opening
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        clientes_id: '',
        numero_factura: '',
        descuento: 0,
        subtotal: 0,
        iva: 0,
        total: 0,
        aplicar_iva: false
      });
      setPedidos([]);
      setError('');

      // Reset estados de búsqueda de cliente
      setBusquedaCliente('');
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
      setClienteSeleccionado(null);

      // Reset estados de búsqueda de productos
      setBusquedaProductos({});
      setProductosFiltrados({});
      setMostrarSugerenciasProducto({});
      setProductosSeleccionados({});
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar clientes y productos en paralelo
      const [clientesData, celofanResponse, polietilenoResponse] = await Promise.all([
        getClientes(),
        getProductosPorMaterial('celofan', { limit: 1000 }),
        getProductosPorMaterial('polietileno', { limit: 1000 })
      ]);

      // Combinar productos de ambos materiales
      const productosData = [
        ...(celofanResponse.data || []),
        ...(polietilenoResponse.data || [])
      ];

      setClientes(clientesData || []);
      setProductos(productosData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos: ' + err.message);
      // Set empty arrays as fallback
      setClientes([]);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para autocompletado de cliente
  const filtrarClientes = (busqueda) => {
    // Si no hay búsqueda, mostrar todos los clientes (máximo 10)
    if (!busqueda || busqueda.length === 0) {
      setClientesFiltrados(clientes.slice(0, 10));
      setMostrarSugerencias(true);
      return;
    }

    const filtrados = clientes.filter(cliente =>
      `${cliente.empresa} ${cliente.nombre_contacto}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    setClientesFiltrados(filtrados.slice(0, 10)); // Máximo 10 sugerencias
    setMostrarSugerencias(filtrados.length > 0);
  };

  const handleBusquedaCliente = (valor) => {
    setBusquedaCliente(valor);
    filtrarClientes(valor);

    // Si se borra la búsqueda, limpiar selección
    if (!valor) {
      setClienteSeleccionado(null);
      setFormData(prev => ({ ...prev, clientes_id: '' }));
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.empresa} - ${cliente.nombre_contacto}`);
    setFormData(prev => ({ ...prev, clientes_id: cliente.id }));
    setMostrarSugerencias(false);
  };

  // Funciones para autocompletado de productos
  const filtrarProductos = (busqueda, pedidoId) => {
    // Si no hay búsqueda, mostrar todos los productos (máximo 10)
    if (!busqueda || busqueda.length === 0) {
      setProductosFiltrados(prev => ({
        ...prev,
        [pedidoId]: productos.slice(0, 10)
      }));
      setMostrarSugerenciasProducto(prev => ({
        ...prev,
        [pedidoId]: true
      }));
      return;
    }

    const filtrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    setProductosFiltrados(prev => ({
      ...prev,
      [pedidoId]: filtrados.slice(0, 10)
    }));
    setMostrarSugerenciasProducto(prev => ({
      ...prev,
      [pedidoId]: filtrados.length > 0
    }));
  };

  const handleBusquedaProducto = (valor, pedidoId) => {
    setBusquedaProductos(prev => ({
      ...prev,
      [pedidoId]: valor
    }));
    filtrarProductos(valor, pedidoId);

    // Si se borra la búsqueda, limpiar selección
    if (!valor) {
      setProductosSeleccionados(prev => ({
        ...prev,
        [pedidoId]: null
      }));
      // Actualizar el pedido para limpiar el producto seleccionado
      const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
      if (pedidoIndex !== -1) {
        actualizarPedido(pedidoIndex, 'productos_id', '');
      }
    }
  };

  const seleccionarProducto = (producto, pedidoId) => {
    setProductosSeleccionados(prev => ({
      ...prev,
      [pedidoId]: producto
    }));
    setBusquedaProductos(prev => ({
      ...prev,
      [pedidoId]: producto.nombre
    }));
    setMostrarSugerenciasProducto(prev => ({
      ...prev,
      [pedidoId]: false
    }));

    // Actualizar el pedido con el producto seleccionado
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex !== -1) {
      actualizarPedido(pedidoIndex, 'productos_id', producto.id);
    }
  };

  // Agregar nuevo pedido a la lista
  const agregarPedido = () => {
    const nuevoPedido = {
      id: Date.now(), // temporal ID
      productos_id: '',
      cantidad: 0,
      precio_kilo_venta: 0,
      precio_unitario_venta: 0,
      precio_iva: 0,
      importe: 0
    };
    setPedidos([...pedidos, nuevoPedido]);
  };

  // Eliminar pedido de la lista
  const eliminarPedido = (index) => {
    const pedidoAEliminar = pedidos[index];
    const nuevosPedidos = pedidos.filter((_, i) => i !== index);
    setPedidos(nuevosPedidos);
    calcularTotales(nuevosPedidos);

    // Limpiar estados de búsqueda del producto eliminado
    if (pedidoAEliminar) {
      setBusquedaProductos(prev => {
        const nuevaBusqueda = { ...prev };
        delete nuevaBusqueda[pedidoAEliminar.id];
        return nuevaBusqueda;
      });
      setProductosFiltrados(prev => {
        const nuevosFiltrados = { ...prev };
        delete nuevosFiltrados[pedidoAEliminar.id];
        return nuevosFiltrados;
      });
      setMostrarSugerenciasProducto(prev => {
        const nuevasSugerencias = { ...prev };
        delete nuevasSugerencias[pedidoAEliminar.id];
        return nuevasSugerencias;
      });
      setProductosSeleccionados(prev => {
        const nuevosSeleccionados = { ...prev };
        delete nuevosSeleccionados[pedidoAEliminar.id];
        return nuevosSeleccionados;
      });
    }
  };

  // Actualizar pedido específico
  const actualizarPedido = (index, campo, valor) => {
    const nuevosPedidos = [...pedidos];
    nuevosPedidos[index] = { ...nuevosPedidos[index], [campo]: parseFloat(valor) || 0 };

    // Calcular importe del pedido
    const pedido = nuevosPedidos[index];
    const precioBase = pedido.precio_unitario_venta || pedido.precio_kilo_venta;
    pedido.importe = (pedido.cantidad * precioBase) + (pedido.precio_iva || 0);

    setPedidos(nuevosPedidos);
    calcularTotales(nuevosPedidos);
  };

  // Calcular totales de la nota de venta
  const calcularTotales = (pedidosList = pedidos) => {
    const subtotal = pedidosList.reduce((sum, pedido) => sum + (pedido.importe || 0), 0);
    const descuentoAplicado = (subtotal * (formData.descuento || 0)) / 100;
    const subtotalConDescuento = subtotal - descuentoAplicado;
    const iva = formData.aplicar_iva ? subtotalConDescuento * 0.16 : 0; // 16% IVA solo si está activado
    const total = subtotalConDescuento + iva;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }));
  };

  // Manejar cambio en descuento
  const handleDescuentoChange = (valor) => {
    setFormData(prev => ({ ...prev, descuento: parseFloat(valor) || 0 }));
    calcularTotales();
  };

  // Manejar cambio en aplicar IVA
  const handleIvaChange = (aplicar) => {
    setFormData(prev => ({ ...prev, aplicar_iva: aplicar }));
    calcularTotales();
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientes_id || !clienteSeleccionado) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (pedidos.length === 0) {
      setError('Debe agregar al menos un pedido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pedidosLimpios = pedidos.map(({ id, ...pedido }) => pedido);

      // Remover aplicar_iva del formData ya que no existe en la base de datos
      const { aplicar_iva, ...notaVentaData } = formData;

      await createNotaVenta({
        ...notaVentaData,
        pedidos: pedidosLimpios
      });

      // Resetear formulario
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        clientes_id: '',
        numero_factura: '',
        descuento: 0,
        subtotal: 0,
        iva: 0,
        total: 0,
        aplicar_iva: false
      });
      setPedidos([]);

      // Resetear estados de búsqueda de cliente
      setBusquedaCliente('');
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
      setClienteSeleccionado(null);

      onSuccess();
      onClose();
    } catch (err) {
      setError('Error al guardar la nota de venta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Nueva Nota de Venta" size="xl">
      {loading && clientes.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Botón temporal para datos de prueba */}
          {clientes.length === 0 && productos.length === 0 && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 mb-2">No hay datos en la base de datos. Puedes:</p>
              <button
                type="button"
                onClick={() => {
                  setClientes([
                    { id: 1, empresa: 'Empresa Demo', nombre_contacto: 'Juan Pérez', dias_credito: 30 }
                  ]);
                  setProductos([
                    { id: 1, nombre: 'Producto Demo - Celofán 30cm' },
                    { id: 2, nombre: 'Producto Demo - Polietileno 50cm' }
                  ]);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Usar datos de prueba
              </button>
            </div>
          )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => handleBusquedaCliente(e.target.value)}
              onFocus={() => {
                // Al hacer foco, mostrar todos los clientes si no hay búsqueda
                if (!busquedaCliente && clientes.length > 0) {
                  setClientesFiltrados(clientes.slice(0, 10));
                  setMostrarSugerencias(true);
                } else if (clientesFiltrados.length > 0) {
                  setMostrarSugerencias(true);
                }
              }}
              onBlur={(e) => {
                // Retrasar el cierre para permitir clics en las sugerencias
                setTimeout(() => {
                  setMostrarSugerencias(false);
                }, 150);
              }}
              placeholder="Buscar cliente por empresa o nombre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />


            {/* Mensaje si no hay sugerencias */}
            {mostrarSugerencias && clientesFiltrados.length === 0 && busquedaCliente.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                <div className="text-gray-500 text-sm">No se encontraron clientes que coincidan con "{busquedaCliente}"</div>
              </div>
            )}

            {/* Encabezado cuando muestra todos los clientes */}
            {mostrarSugerencias && clientesFiltrados.length > 0 && !busquedaCliente && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 font-medium">
                  Selecciona un cliente o escribe para buscar
                </div>
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{cliente.empresa}</div>
                    <div className="text-sm text-gray-600">{cliente.nombre_contacto}</div>
                    {cliente.dias_credito && (
                      <div className="text-xs text-blue-600">Crédito: {cliente.dias_credito} días</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sugerencias filtradas cuando hay búsqueda */}
            {mostrarSugerencias && clientesFiltrados.length > 0 && busquedaCliente && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{cliente.empresa}</div>
                    <div className="text-sm text-gray-600">{cliente.nombre_contacto}</div>
                    {cliente.dias_credito && (
                      <div className="text-xs text-blue-600">Crédito: {cliente.dias_credito} días</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Factura
            </label>
            <input
              type="text"
              value={formData.numero_factura}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_factura: e.target.value }))}
              placeholder="Ej: FAC-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pedidos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Pedidos</h3>
            <button
              type="button"
              onClick={agregarPedido}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Agregar Pedido
            </button>
          </div>

          <div className="space-y-3">
            {pedidos.map((pedido, index) => (
              <div key={pedido.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Producto *
                    </label>
                    <input
                      type="text"
                      value={busquedaProductos[pedido.id] || ''}
                      onChange={(e) => handleBusquedaProducto(e.target.value, pedido.id)}
                      onFocus={() => {
                        // Al hacer foco, mostrar todos los productos si no hay búsqueda
                        if (!busquedaProductos[pedido.id] && productos.length > 0) {
                          setProductosFiltrados(prev => ({
                            ...prev,
                            [pedido.id]: productos.slice(0, 10)
                          }));
                          setMostrarSugerenciasProducto(prev => ({
                            ...prev,
                            [pedido.id]: true
                          }));
                        } else if (productosFiltrados[pedido.id]?.length > 0) {
                          setMostrarSugerenciasProducto(prev => ({
                            ...prev,
                            [pedido.id]: true
                          }));
                        }
                      }}
                      onBlur={() => {
                        // Retrasar el cierre para permitir clics en las sugerencias
                        setTimeout(() => {
                          setMostrarSugerenciasProducto(prev => ({
                            ...prev,
                            [pedido.id]: false
                          }));
                        }, 150);
                      }}
                      placeholder="Buscar producto..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />

                    {/* Encabezado cuando muestra todos los productos */}
                    {mostrarSugerenciasProducto[pedido.id] && productosFiltrados[pedido.id]?.length > 0 && !busquedaProductos[pedido.id] && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium">
                          Selecciona un producto o escribe para buscar
                        </div>
                        {productosFiltrados[pedido.id].map(producto => (
                          <div
                            key={producto.id}
                            onClick={() => seleccionarProducto(producto, pedido.id)}
                            className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="text-xs font-medium text-gray-900">{producto.nombre}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sugerencias filtradas cuando hay búsqueda */}
                    {mostrarSugerenciasProducto[pedido.id] && productosFiltrados[pedido.id]?.length > 0 && busquedaProductos[pedido.id] && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {productosFiltrados[pedido.id].map(producto => (
                          <div
                            key={producto.id}
                            onClick={() => seleccionarProducto(producto, pedido.id)}
                            className="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="text-xs font-medium text-gray-900">{producto.nombre}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mensaje si no hay sugerencias */}
                    {mostrarSugerenciasProducto[pedido.id] && productosFiltrados[pedido.id]?.length === 0 && busquedaProductos[pedido.id]?.length >= 2 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2">
                        <div className="text-gray-500 text-xs">No se encontraron productos que coincidan con "{busquedaProductos[pedido.id]}"</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pedido.cantidad}
                      onChange={(e) => actualizarPedido(index, 'cantidad', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Precio/Kilo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pedido.precio_kilo_venta}
                      onChange={(e) => actualizarPedido(index, 'precio_kilo_venta', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pedido.precio_unitario_venta}
                      onChange={(e) => actualizarPedido(index, 'precio_unitario_venta', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Importe
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(pedido.importe)}
                      readOnly
                      className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => eliminarPedido(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuento (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.descuento}
                onChange={(e) => handleDescuentoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Con Factura
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={formData.aplicar_iva}
                  onChange={(e) => handleIvaChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Aplicar IVA (16%)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(formData.subtotal)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IVA (16%)
              </label>
              <div className={`text-lg font-semibold ${formData.aplicar_iva ? 'text-gray-900' : 'text-gray-400'}`}>
                {formData.aplicar_iva ? formatCurrency(formData.iva) : 'Sin IVA'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(formData.total)}
              </div>
            </div>
          </div>
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
            disabled={loading || pedidos.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Nota de Venta'}
          </button>
        </div>
      </form>
      )}
    </Modal>
  );
};

export default NotaVentaForm;