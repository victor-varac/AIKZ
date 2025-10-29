import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotaVentaCard = ({ nota, onClick, totalNotasLoaded }) => {
  const navigate = useNavigate();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentColor = (porcentaje) => {
    if (porcentaje >= 100) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDeliveryColor = (porcentaje) => {
    if (porcentaje >= 100) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getCreditColor = (diasRestantes, porcentaje) => {
    if (diasRestantes <= 0) return 'bg-red-500';
    if (porcentaje <= 25) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPaymentStatus = (porcentaje) => {
    if (porcentaje >= 100) return 'Pagado';
    if (porcentaje > 0) return 'Parcial';
    return 'Pendiente';
  };

  const getDeliveryStatus = (porcentaje) => {
    if (porcentaje >= 100) return 'Completo';
    if (porcentaje > 0) return 'Parcial';
    return 'Pendiente';
  };

  const getCreditStatus = (diasRestantes) => {
    if (diasRestantes <= 0) return 'Vencido';
    if (diasRestantes <= 7) return 'Por vencer';
    return 'Vigente';
  };

  const handleCardClick = () => {
    // Guardar posición de scroll y cantidad de items cargados antes de navegar
    sessionStorage.setItem('notasVentaScrollPosition', window.scrollY.toString());
    sessionStorage.setItem('notasVentaItemCount', totalNotasLoaded.toString());

    navigate(`/pedidos/${nota.id}`);
    if (onClick) onClick(nota);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            #{nota.numero_factura || 'Sin número'}
          </h3>
          <p className="text-gray-700 font-medium">{nota.clientes?.empresa}</p>
          <p className="text-sm text-gray-500">{nota.clientes?.nombre_contacto}</p>
          <p className="text-xs text-gray-400">{formatDate(nota.fecha)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(nota.total)}</p>
          <p className="text-sm text-gray-500">{nota.totalPedidos} pedidos</p>
          {nota.vendedor && (
            <p className="text-xs text-gray-400">Vendedor: {nota.vendedor}</p>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* 1. Estado de Pagos */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">💰 Pagado</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                nota.porcentajePagado >= 100 ? 'bg-green-100 text-green-800' :
                nota.porcentajePagado > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getPaymentStatus(nota.porcentajePagado)}
              </span>
            </div>
            <span className="text-gray-600">
              {formatCurrency(nota.totalPagado)} / {formatCurrency(nota.total)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getPaymentColor(nota.porcentajePagado)}`}
              style={{ width: `${Math.min(100, nota.porcentajePagado)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {nota.porcentajePagado.toFixed(1)}% pagado
          </div>
        </div>

        {/* 2. Estado de Entregas */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">📦 Entregado</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                nota.porcentajeEntregado >= 100 ? 'bg-green-100 text-green-800' :
                nota.porcentajeEntregado > 0 ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {getDeliveryStatus(nota.porcentajeEntregado)}
              </span>
            </div>
            <span className="text-gray-600">
              {nota.pedidosEntregados} / {nota.totalPedidos}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getDeliveryColor(nota.porcentajeEntregado)}`}
              style={{ width: `${Math.min(100, nota.porcentajeEntregado)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {nota.porcentajeEntregado.toFixed(1)}% entregado
          </div>
        </div>

        {/* 3. Estado de Crédito */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">⏰ Crédito</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                nota.diasRestantesCredito <= 0 ? 'bg-red-100 text-red-800' :
                nota.diasRestantesCredito <= 7 ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getCreditStatus(nota.diasRestantesCredito)}
              </span>
            </div>
            <span className="text-gray-600">
              {nota.diasRestantesCredito} días restantes
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getCreditColor(nota.diasRestantesCredito, nota.porcentajeCreditoRestante)}`}
              style={{ width: `${Math.min(100, nota.porcentajeCreditoRestante)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Vence: {formatDate(nota.fechaLimite)}
          </div>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Saldo: {formatCurrency(nota.saldoPendiente)}</span>
          <span>Pendientes: {nota.pedidosPendientes}</span>
        </div>
      </div>
    </div>
  );
};

export default NotaVentaCard;