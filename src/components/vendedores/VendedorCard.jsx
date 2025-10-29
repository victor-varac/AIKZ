import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendedorEstadisticas } from '../../services/api/vendedores';

const VendedorCard = ({ vendedor, onClick }) => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  useEffect(() => {
    if (vendedor.id) {
      loadEstadisticas();
    }
  }, [vendedor.id]);

  const loadEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      const stats = await getVendedorEstadisticas(vendedor.id);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setEstadisticas({
        totalClientes: 0,
        clientesActivos: 0,
        totalVentas: 0,
        montoTotalVendido: 0,
        ventasEsteMes: 0,
        montoEsteMes: 0,
        mejorCliente: null,
        ultimaVenta: null,
        promedioVentaPorCliente: 0
      });
    } finally {
      setLoadingEstadisticas(false);
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (ventasEsteMes) => {
    if (ventasEsteMes >= 10) return 'text-green-600 bg-green-50';
    if (ventasEsteMes >= 5) return 'text-yellow-600 bg-yellow-50';
    if (ventasEsteMes >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceIcon = (ventasEsteMes) => {
    if (ventasEsteMes >= 10) return '🚀';
    if (ventasEsteMes >= 5) return '📈';
    if (ventasEsteMes >= 1) return '📊';
    return '⚠️';
  };

  const getPerformanceText = (ventasEsteMes) => {
    if (ventasEsteMes >= 10) return 'Excelente';
    if (ventasEsteMes >= 5) return 'Bueno';
    if (ventasEsteMes >= 1) return 'Regular';
    return 'Bajo';
  };

  const formatClientesRatio = (activos, total) => {
    if (total === 0) return '0/0';
    return `${activos}/${total}`;
  };

  const handleCardClick = () => {
    navigate(`/vendedores/${vendedor.id}`);
    if (onClick) onClick(vendedor);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🤝</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vendedor.nombre || 'Sin nombre'}
              </h3>
              <p className="text-sm text-gray-500">Vendedor ID: {vendedor.id}</p>
            </div>
          </div>
        </div>

        {/* Performance badge */}
        {estadisticas && (
          <div className={`px-3 py-2 rounded-lg text-center ${getPerformanceColor(estadisticas.ventasEsteMes)}`}>
            <div className="text-lg">{getPerformanceIcon(estadisticas.ventasEsteMes)}</div>
            <div className="text-xs font-medium">
              {getPerformanceText(estadisticas.ventasEsteMes)}
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">👥</span>
            <div>
              <div className="text-xs text-blue-600 font-medium">Clientes</div>
              <div className="text-lg font-bold text-blue-900">
                {loadingEstadisticas ? '...' : estadisticas ? formatClientesRatio(estadisticas.clientesActivos, estadisticas.totalClientes) : '0/0'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💰</span>
            <div>
              <div className="text-xs text-green-600 font-medium">Este mes</div>
              <div className="text-sm font-bold text-green-900">
                {loadingEstadisticas ? '...' : estadisticas ? formatCurrency(estadisticas.montoEsteMes) : '$0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de ventas */}
      {loadingEstadisticas ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <span className="text-xs text-gray-500 mt-2">Cargando estadísticas...</span>
        </div>
      ) : estadisticas ? (
        <div className="space-y-4">
          {/* Resumen de ventas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Resumen de ventas</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Total vendido</div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(estadisticas.montoTotalVendido)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Total ventas</div>
                <div className="font-semibold text-gray-900">
                  {estadisticas.totalVentas}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Ventas este mes</div>
                <div className="font-semibold text-green-700">
                  {estadisticas.ventasEsteMes}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Promedio/cliente</div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(estadisticas.promedioVentaPorCliente)}
                </div>
              </div>
            </div>
          </div>

          {/* Mejor cliente */}
          {estadisticas.mejorCliente && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">⭐</span>
                <div className="text-sm font-medium text-yellow-800">Mejor cliente</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold text-yellow-900">
                  {estadisticas.mejorCliente.empresa}
                </div>
                <div className="text-yellow-700">
                  {formatCurrency(estadisticas.mejorCliente.volumen)} en total
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Última venta: {formatDate(estadisticas.ultimaVenta)}</span>
            <span>Saldo pendiente: {formatCurrency(estadisticas.saldoPendiente)}</span>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-400 py-4">
          No se pudieron cargar las estadísticas
        </div>
      )}

      {/* Footer con indicadores */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {estadisticas && estadisticas.ventasEsteMes > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Activo este mes
              </span>
            )}
            {estadisticas && estadisticas.clientesActivos > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {estadisticas.clientesActivos} clientes activos
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400">
            ID: {vendedor.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendedorCard;