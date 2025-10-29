import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClienteEstadisticas } from '../../services/api/clientes';

const ClienteCard = ({ cliente, onClick }) => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  useEffect(() => {
    if (cliente.id) {
      loadEstadisticas();
    }
  }, [cliente.id]);

  const loadEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      const stats = await getClienteEstadisticas(cliente.id);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setEstadisticas({
        totalFacturas: 0,
        montoTotal: 0,
        totalPagado: 0,
        saldoPendiente: 0,
        ultimaCompra: null
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

  const getEstadoColor = (estado) => {
    return estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCreditoColor = (diasCredito) => {
    if (diasCredito <= 0) return 'text-red-600';
    if (diasCredito <= 15) return 'text-orange-600';
    if (diasCredito <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSaldoColor = (saldo) => {
    if (saldo <= 0) return 'text-green-600';
    if (saldo <= 10000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCardClick = () => {
    navigate(`/clientes/${cliente.id}`);
    if (onClick) onClick(cliente);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {cliente.empresa || 'Sin empresa'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cliente.estado)}`}>
              {cliente.estadoTexto}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-lg mr-2">👤</span>
              <span>{cliente.nombre_contacto || 'Sin contacto'}</span>
            </div>

            {cliente.telefono && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-lg mr-2">📞</span>
                <span>{cliente.telefono}</span>
              </div>
            )}

            {cliente.correo && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-lg mr-2">📧</span>
                <span className="truncate">{cliente.correo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Crédito */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Días de crédito</div>
          <div className={`text-lg font-bold ${getCreditoColor(cliente.dias_credito)}`}>
            {cliente.dias_credito || 0} días
          </div>
        </div>
      </div>

      {/* Información del vendedor */}
      {cliente.vendedor && cliente.vendedor !== 'Sin asignar' && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🤝</span>
            <div>
              <div className="text-sm font-medium text-blue-900">Vendedor asignado</div>
              <div className="text-sm text-blue-700">{cliente.vendedor}</div>
            </div>
          </div>
        </div>
      )}

      {/* Dirección */}
      {cliente.direccion && (
        <div className="mb-4">
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <span className="text-lg mt-0.5">📍</span>
            <span className="line-clamp-2">{cliente.direccion}</span>
          </div>
        </div>
      )}

      {/* Estadísticas de ventas */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Resumen comercial</h4>

        {loadingEstadisticas ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <span className="text-xs text-gray-500 mt-2">Cargando...</span>
          </div>
        ) : estadisticas ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total facturas</div>
              <div className="font-semibold text-gray-900">
                {estadisticas.totalFacturas}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Monto total</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(estadisticas.montoTotal)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Última compra</div>
              <div className="font-semibold text-gray-900">
                {formatDate(estadisticas.ultimaCompra)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Saldo pendiente</div>
              <div className={`font-semibold ${getSaldoColor(estadisticas.saldoPendiente)}`}>
                {formatCurrency(estadisticas.saldoPendiente)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 py-2">
            No se pudieron cargar las estadísticas
          </div>
        )}
      </div>

      {/* Footer con ID */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>ID: {cliente.id}</span>
          {estadisticas && estadisticas.saldoPendiente > 0 && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
              Saldo pendiente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteCard;