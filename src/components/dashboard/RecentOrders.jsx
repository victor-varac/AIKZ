import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentOrders = ({ data }) => {
  const navigate = useNavigate();
  const orders = data || [];

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Sin Estado';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          📝 Pedidos Recientes
        </h3>
        <button
          onClick={() => navigate('/pedidos')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Ver todos →
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">📋</span>
          <h4 className="text-gray-900 font-medium mb-2">No hay pedidos recientes</h4>
          <p className="text-sm text-gray-600 mb-4">
            Los nuevos pedidos aparecerán aquí
          </p>
          <button
            onClick={() => navigate('/pedidos/nuevo')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Crear Primer Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 6).map((order, index) => (
            <div key={order.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      Nota #{order.numero_factura}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.estado)}`}>
                      {getStatusText(order.estado)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.cliente || 'Cliente no especificado'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(order.total || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(order.fecha)}
                  </div>
                </div>
              </div>

              {/* Productos en el pedido */}
              {order.productos && order.productos.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                    <span>📦</span>
                    <span>{order.productos.length} producto(s)</span>
                  </div>
                  <div className="text-sm text-gray-800">
                    {order.productos.slice(0, 2).map((producto, idx) => (
                      <span key={idx}>
                        {producto.nombre}
                        {idx < order.productos.length - 1 && order.productos.length <= 2 ? ', ' : ''}
                      </span>
                    ))}
                    {order.productos.length > 2 && (
                      <span className="text-gray-500">
                        {' '}y {order.productos.length - 2} más...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Progreso de entrega si existe */}
              {order.progreso_entrega && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progreso de entrega</span>
                    <span className="font-medium">{order.progreso_entrega}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        order.progreso_entrega >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${order.progreso_entrega}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Vendedor */}
              {order.vendedor && (
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">🤝</span>
                  <span>{order.vendedor}</span>
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/pedidos/${order.id}`)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                    >
                      Ver Detalle
                    </button>
                    {order.estado === 'pendiente' && (
                      <button
                        onClick={() => navigate(`/pedidos/${order.id}/editar`)}
                        className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-1 rounded transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    hace {order.dias_desde_creacion || 0} días
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length > 6 && (
            <button
              onClick={() => navigate('/pedidos')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
            >
              Ver {orders.length - 6} pedidos más...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;