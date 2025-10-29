import React, { useState } from 'react';

const EntregasPolietilenoCards = ({ notasVenta, loading, onEntregarTodo, onRegistrarEntrega, onEditarEntregas }) => {
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpansion = (notaId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(notaId)) {
      newExpanded.delete(notaId);
    } else {
      newExpanded.add(notaId);
    }
    setExpandedCards(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'parcial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pendiente':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'completo':
        return 'Completo';
      case 'parcial':
        return 'Parcial';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Sin estado';
    }
  };

  const getProgressBarColor = (porcentaje) => {
    if (porcentaje >= 100) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Entregas de Productos de Polietileno</h2>
          <p className="text-sm text-gray-600 mt-1">Notas de venta con productos de polietileno pendientes de entrega (en kg)</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Entregas de Productos de Polietileno</h2>
        <p className="text-sm text-gray-600 mt-1">Notas de venta con productos de polietileno pendientes de entrega (en kg)</p>
      </div>

      <div className="p-6">
        {notasVenta.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📦</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No hay entregas pendientes</h3>
            <p className="text-gray-500 mt-2">No se encontraron notas de venta con productos de polietileno pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notasVenta.map((nota) => (
              <div key={nota.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Header de la card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Nota #{nota.numero_factura}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(nota.fecha)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(nota.estadisticas?.estadoEntrega)}`}>
                    {getEstadoTexto(nota.estadisticas?.estadoEntrega)}
                  </span>
                </div>

                {/* Información del cliente */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {nota.clientes?.empresa || 'Sin empresa'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {nota.clientes?.nombre_contacto || 'Sin contacto'}
                  </p>
                </div>

                {/* Lista de productos - Expandible */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Productos de Polietileno ({nota.pedidos?.length || 0})
                    </h4>
                    <button
                      onClick={() => toggleCardExpansion(nota.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedCards.has(nota.id) ? (
                        <>Ocultar <span className="ml-1">▲</span></>
                      ) : (
                        <>Ver Detalle <span className="ml-1">▼</span></>
                      )}
                    </button>
                  </div>

                  {expandedCards.has(nota.id) && (
                    <div className="space-y-2 transition-all duration-300">
                      {nota.pedidos?.map((pedido, index) => {
                        const entregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
                        const pendiente = (pedido.cantidad || 0) - entregado;
                        const porcentajeIndividual = pedido.cantidad > 0 ? (entregado / pedido.cantidad) * 100 : 0;

                        return (
                          <div key={pedido.id || index} className="text-xs bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                            <div className="font-medium text-gray-900 mb-2">
                              {pedido.productos?.nombre || 'Producto sin nombre'}
                            </div>

                            {/* Especificaciones del producto */}
                            <div className="text-gray-500 mb-2">
                              {pedido.productos?.ancho_cm && pedido.productos?.largo_cm && (
                                <span>{pedido.productos.ancho_cm}cm x {pedido.productos.largo_cm}cm</span>
                              )}
                              {pedido.productos?.micraje_um && (
                                <span> • {pedido.productos.micraje_um}μm</span>
                              )}
                            </div>

                            {/* Cantidades */}
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <div className="font-medium text-gray-700">{(pedido.cantidad || 0).toLocaleString()}</div>
                                <div className="text-gray-500">Pedido</div>
                              </div>
                              <div>
                                <div className="font-medium text-green-600">{entregado.toLocaleString()}</div>
                                <div className="text-gray-500">Entregado</div>
                              </div>
                              <div>
                                <div className="font-medium text-red-600">{pendiente.toLocaleString()}</div>
                                <div className="text-gray-500">Pendiente</div>
                              </div>
                            </div>

                            {/* Barra de progreso individual */}
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progreso individual</span>
                                <span>{Math.round(porcentajeIndividual)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(porcentajeIndividual)}`}
                                  style={{ width: `${porcentajeIndividual}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Precio unitario */}
                            <div className="text-gray-600">
                              Precio: ${(pedido.precio_unitario_venta || 0).toLocaleString()} por millar
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Progreso de entrega */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso de entrega</span>
                    <span>{Math.round(nota.estadisticas?.porcentajeEntregado || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(nota.estadisticas?.porcentajeEntregado || 0)}`}
                      style={{ width: `${nota.estadisticas?.porcentajeEntregado || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Resumen numérico */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(nota.estadisticas?.totalPedido || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600">
                      {(nota.estadisticas?.totalEntregado || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Entregado</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-600">
                      {(nota.estadisticas?.totalPendiente || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Pendiente</div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 space-y-2">
                  {/* Solo mostrar botones si hay productos pendientes */}
                  {(nota.estadisticas?.totalPendiente || 0) > 0 && (
                    <>
                      <button
                        onClick={() => onEntregarTodo && onEntregarTodo(nota)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors"
                      >
                        ✅ Entregar Todo ({(nota.estadisticas?.totalPendiente || 0).toLocaleString()} kg)
                      </button>
                      <button
                        onClick={() => onRegistrarEntrega && onRegistrarEntrega(nota)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors"
                      >
                        📝 Registrar Entrega Parcial
                      </button>
                    </>
                  )}

                  {/* Botón de editar entregas (siempre visible si hay entregas) */}
                  {(nota.estadisticas?.totalEntregado || 0) > 0 && (
                    <button
                      onClick={() => onEditarEntregas && onEditarEntregas(nota)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-2 rounded transition-colors"
                    >
                      ✏️ Editar Entregas ({(nota.estadisticas?.totalEntregado || 0).toLocaleString()} kg)
                    </button>
                  )}

                  {/* Mensaje si ya está completo */}
                  {(nota.estadisticas?.totalPendiente || 0) === 0 && (
                    <div className="w-full bg-green-100 text-green-800 text-xs px-3 py-2 rounded text-center">
                      ✅ Entrega Completa
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntregasPolietilenoCards;