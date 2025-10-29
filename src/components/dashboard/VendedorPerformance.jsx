import React from 'react';
import { useNavigate } from 'react-router-dom';

const VendedorPerformance = ({ data }) => {
  const navigate = useNavigate();
  const vendedores = data || [];

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const getPerformanceColor = (index, total) => {
    if (total <= 1) return 'bg-blue-500';
    if (index === 0) return 'bg-green-500';
    if (index === total - 1) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const getPerformanceIcon = (index, total) => {
    if (total <= 1) return '🎯';
    if (index === 0) return '🏆';
    if (index === total - 1) return '💪';
    return '👤';
  };

  const getTotalVentas = () => {
    return vendedores.reduce((sum, vendedor) => sum + (vendedor.ventas_mes || 0), 0);
  };

  const getPromedio = () => {
    if (vendedores.length === 0) return 0;
    return getTotalVentas() / vendedores.length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          🤝 Rendimiento de Vendedores
        </h3>
        <button
          onClick={() => navigate('/vendedores')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Ver todos →
        </button>
      </div>

      {vendedores.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">🤝</span>
          <h4 className="text-gray-900 font-medium mb-2">No hay vendedores registrados</h4>
          <p className="text-sm text-gray-600 mb-4">
            Registra vendedores para ver su rendimiento aquí
          </p>
          <button
            onClick={() => navigate('/vendedores/nuevo')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Registrar Vendedor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vendedores.slice(0, 6).map((vendedor, index) => {
            const porcentaje = getTotalVentas() > 0
              ? ((vendedor.ventas_mes || 0) / getTotalVentas()) * 100
              : 0;

            return (
              <div
                key={vendedor.id || index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/vendedores/${vendedor.id}`)}
              >
                {/* Icono de rendimiento */}
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {getPerformanceIcon(index, vendedores.length)}
                  </span>
                </div>

                {/* Información del vendedor */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {vendedor.nombre || 'Vendedor sin nombre'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {vendedor.email || 'Sin email'}
                      </p>
                    </div>

                    <div className="text-right ml-2">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(vendedor.ventas_mes || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vendedor.num_ventas || 0} ventas
                      </div>
                    </div>
                  </div>

                  {/* Métricas adicionales */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {vendedor.clientes_atendidos || 0}
                      </div>
                      <div>Clientes</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(vendedor.venta_promedio || 0)}
                      </div>
                      <div>Promedio</div>
                    </div>
                    <div>
                      <div className={`font-medium ${
                        (vendedor.ventas_mes || 0) > getPromedio() ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(vendedor.ventas_mes || 0) > getPromedio() ? '↗️' : '↘️'} {porcentaje.toFixed(1)}%
                      </div>
                      <div>Del total</div>
                    </div>
                  </div>

                  {/* Barra de rendimiento */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Meta mensual</span>
                      <span className="font-medium">
                        {vendedor.meta_mensual
                          ? `${((vendedor.ventas_mes / vendedor.meta_mensual) * 100).toFixed(0)}%`
                          : 'Sin meta'
                        }
                      </span>
                    </div>
                    {vendedor.meta_mensual && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getPerformanceColor(index, vendedores.length)}`}
                          style={{
                            width: `${Math.min(((vendedor.ventas_mes / vendedor.meta_mensual) * 100), 100)}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Información de contacto */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-gray-500">
                      {vendedor.telefono && (
                        <span>📞 {vendedor.telefono}</span>
                      )}
                      {vendedor.zona && (
                        <span>📍 {vendedor.zona}</span>
                      )}
                    </div>

                    {/* Última venta */}
                    {vendedor.ultima_venta && (
                      <div className="text-gray-500">
                        Última: {new Date(vendedor.ultima_venta).toLocaleDateString('es-MX', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {vendedores.length > 6 && (
            <button
              onClick={() => navigate('/vendedores')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
            >
              Ver {vendedores.length - 6} vendedores más...
            </button>
          )}
        </div>
      )}

      {/* Resumen del equipo */}
      {vendedores.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {vendedores.length}
              </div>
              <div className="text-xs text-gray-600">Vendedores</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(getPromedio())}
              </div>
              <div className="text-xs text-gray-600">Promedio</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(getTotalVentas())}
              </div>
              <div className="text-xs text-gray-600">Total equipo</div>
            </div>
          </div>

          {/* Top performer del mes */}
          {vendedores.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🏆</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {vendedores[0]?.nombre || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-600">Vendedor del mes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-700">
                    {formatCurrency(vendedores[0]?.ventas_mes || 0)}
                  </div>
                  <div className="text-xs text-orange-600">
                    {vendedores[0]?.num_ventas || 0} ventas
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendedorPerformance;