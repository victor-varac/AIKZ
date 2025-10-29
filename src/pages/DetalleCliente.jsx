import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClienteDetalle, deleteCliente } from '../services/api/clientes';
import ClienteForm from '../components/clientes/ClienteForm';

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadClienteDetalle();
    }
  }, [id]);

  const loadClienteDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClienteDetalle(parseInt(id));
      setCliente(data);
    } catch (err) {
      console.error('Error al cargar detalle de cliente:', err);
      setError(err.message || 'Error al cargar los detalles');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiesgoBadge = (riesgo) => {
    const badges = {
      bajo: 'bg-green-100 text-green-800',
      medio: 'bg-yellow-100 text-yellow-800',
      alto: 'bg-red-100 text-red-800'
    };

    const textos = {
      bajo: 'Riesgo Bajo',
      medio: 'Riesgo Medio',
      alto: 'Riesgo Alto'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[riesgo] || 'bg-gray-100 text-gray-800'}`}>
        {textos[riesgo] || riesgo}
      </span>
    );
  };

  const getEstadoPagoBadge = (estado) => {
    const badges = {
      al_corriente: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      vencido: 'bg-red-100 text-red-800'
    };

    const textos = {
      al_corriente: 'Al Corriente',
      pendiente: 'Pagos Pendientes',
      vencido: 'Facturas Vencidas'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[estado] || 'bg-gray-100 text-gray-800'}`}>
        {textos[estado] || estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar los detalles</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={loadClienteDetalle}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={() => navigate('/clientes')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Volver a Clientes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl">👤</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Cliente no encontrado</h3>
            <p className="text-gray-500 mt-2">No se pudo encontrar el cliente solicitado</p>
            <button
              onClick={() => navigate('/clientes')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Volver a Clientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEditCliente = () => {
    setShowEditModal(true);
  };

  const handleClienteUpdated = (clienteActualizado) => {
    setCliente(clienteActualizado);
    setShowEditModal(false);
    // Recargar los detalles para obtener estadísticas actualizadas
    loadClienteDetalle();
  };

  const handleDeleteCliente = async () => {
    try {
      setDeleting(true);
      await deleteCliente(parseInt(id));
      navigate('/clientes', {
        state: {
          message: `Cliente ${cliente.empresa} eliminado exitosamente`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar el cliente: ' + (error.message || 'Error desconocido'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const { estadisticas } = cliente;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/clientes')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Clientes</span>
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-3xl font-bold text-gray-900">
                🏢 {cliente.empresa}
              </h1>
              <p className="text-gray-600 mt-1">
                Perfil completo del cliente
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getEstadoPagoBadge(estadisticas.estadoPago)}
            {getRiesgoBadge(estadisticas.riesgoCredito)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              cliente.estado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {cliente.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Facturas</div>
                    <div className="text-2xl font-bold text-gray-900">{estadisticas.totalFacturas}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Facturado</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(estadisticas.montoTotalFacturado)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Pagado</div>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(estadisticas.totalPagado)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Saldo Pendiente</div>
                    <div className={`text-lg font-bold ${estadisticas.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(estadisticas.saldoPendiente)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información comercial */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">💼 Información Comercial</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Productos Pedidos</label>
                    <p className="text-2xl font-bold text-blue-600">{estadisticas.totalProductosPedidos.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Productos Entregados</label>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.totalProductosEntregados.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">% Cumplimiento Entregas</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${Math.min(estadisticas.porcentajeEntrega, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{estadisticas.porcentajeEntrega.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Total Pedidos</label>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalPedidos}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos más comprados */}
            {estadisticas.productosMasComprados.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">📦 Productos Más Comprados</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {estadisticas.productosMasComprados.map((item, index) => (
                      <div key={item.producto.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.producto.nombre}</p>
                            <p className="text-xs text-gray-500">{item.producto.material}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{item.cantidadTotal.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{item.vecesComprado} compras</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Historial de facturas recientes */}
            {cliente.notas_venta && cliente.notas_venta.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">📋 Facturas Recientes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Factura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pagado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cliente.notas_venta
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                        .slice(0, 10)
                        .map((nota) => {
                          const totalPagado = nota.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
                          const saldo = parseFloat(nota.total || 0) - totalPagado;
                          const pagadoCompleto = saldo <= 0;

                          return (
                            <tr key={nota.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/pedidos/${nota.id}`)}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                #{nota.numero_factura || nota.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(nota.fecha)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(nota.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(totalPagado)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  pagadoCompleto ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {pagadoCompleto ? 'Pagada' : 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">📞 Contacto</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                  <p className="text-gray-900 font-medium">{cliente.empresa}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contacto</label>
                  <p className="text-gray-900">{cliente.nombre_contacto}</p>
                </div>
                {cliente.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                    <p className="text-gray-900">{cliente.telefono}</p>
                  </div>
                )}
                {cliente.correo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Correo</label>
                    <p className="text-gray-900">{cliente.correo}</p>
                  </div>
                )}
                {cliente.direccion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                    <p className="text-gray-900 text-sm">{cliente.direccion}</p>
                  </div>
                )}
                {cliente.vendedores && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vendedor Asignado</label>
                    <p className="text-gray-900">{cliente.vendedores.nombre}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información crediticia */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">💳 Información Crediticia</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Días de Crédito</label>
                  <p className="text-2xl font-bold text-blue-600">{cliente.dias_credito} días</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Facturas Pendientes</label>
                  <p className="text-xl font-bold text-yellow-600">{estadisticas.facturasPendientesCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Facturas Vencidas</label>
                  <p className="text-xl font-bold text-red-600">{estadisticas.facturasVencidasCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nivel de Riesgo</label>
                  {getRiesgoBadge(estadisticas.riesgoCredito)}
                </div>
              </div>
            </div>

            {/* Última actividad */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">🕒 Última Actividad</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Última Factura</label>
                  <p className="text-gray-900">{formatDate(estadisticas.ultimaFactura)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Último Pago</label>
                  <p className="text-gray-900">{formatDate(estadisticas.ultimoPago)}</p>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">⚡ Acciones</h2>
              </div>
              <div className="p-6 space-y-3">

                <button
                  onClick={handleEditCliente}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ✏️ Editar Cliente
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  🗑️ Eliminar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        <ClienteForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onClienteCreated={handleClienteUpdated}
          cliente={cliente}
        />

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Eliminar Cliente
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar al cliente <strong>{cliente.empresa}</strong>?
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Esta acción no se puede deshacer y se eliminarán todos los datos asociados.
                    </p>
                  </div>
                  <div className="items-center px-4 py-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        disabled={deleting}
                        className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteCliente}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                      >
                        {deleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleCliente;