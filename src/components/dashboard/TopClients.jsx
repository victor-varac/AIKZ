import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopClients = ({ data }) => {
  const navigate = useNavigate();
  const clients = data || [];

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const getClientRank = (index) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || `${index + 1}°`;
  };

  const getTotalCompras = () => {
    return clients.reduce((sum, client) => sum + (client.total_compras || 0), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          👥 Mejores Clientes
        </h3>
        <button
          onClick={() => navigate('/clientes')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Ver todos →
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">👤</span>
          <h4 className="text-gray-900 font-medium mb-2">No hay clientes registrados</h4>
          <p className="text-sm text-gray-600 mb-4">
            Los clientes aparecerán aquí una vez que realicen compras
          </p>
          <button
            onClick={() => navigate('/clientes/nuevo')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Registrar Cliente
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.slice(0, 8).map((client, index) => (
            <div
              key={client.id || index}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
              } hover:shadow-sm transition-all cursor-pointer`}
              onClick={() => navigate(`/clientes/${client.id}`)}
            >
              {/* Ranking */}
              <div className="flex-shrink-0">
                <span className="text-lg">
                  {getClientRank(index)}
                </span>
              </div>

              {/* Información del cliente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {client.empresa || 'Empresa no especificada'}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {client.nombre_contacto || 'Sin contacto'}
                    </p>
                  </div>

                  <div className="text-right ml-2">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(client.total_compras || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {client.num_pedidos || 0} pedidos
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-gray-600">
                    {client.telefono && (
                      <span>📞 {client.telefono}</span>
                    )}
                    {client.ciudad && (
                      <span>📍 {client.ciudad}</span>
                    )}
                  </div>

                  {/* Última compra */}
                  {client.ultima_compra && (
                    <div className="text-gray-500">
                      Última: {new Date(client.ultima_compra).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {/* Barra de contribución */}
                {getTotalCompras() > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Contribución</span>
                      <span className="font-medium">
                        {((client.total_compras / getTotalCompras()) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          index < 3 ? 'bg-orange-400' : 'bg-blue-400'
                        }`}
                        style={{
                          width: `${Math.min(((client.total_compras / getTotalCompras()) * 100), 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {clients.length > 8 && (
            <button
              onClick={() => navigate('/clientes')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
            >
              Ver {clients.length - 8} clientes más...
            </button>
          )}
        </div>
      )}

      {/* Resumen */}
      {clients.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {clients.length}
              </div>
              <div className="text-xs text-gray-600">Clientes activos</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(getTotalCompras())}
              </div>
              <div className="text-xs text-gray-600">Ventas totales</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopClients;