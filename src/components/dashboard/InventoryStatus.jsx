import React from 'react';
import { useNavigate } from 'react-router-dom';

const InventoryStatus = ({ data }) => {
  const navigate = useNavigate();

  const inventoryData = {
    celofan: data?.celofan || { stock: 0, productos: 0, criticos: 0 },
    polietileno: data?.polietileno || { stock: 0, productos: 0, criticos: 0 }
  };

  const entregasPendientes = data?.entregasPendientes || [];

  const getStockLevel = (stock, criticos) => {
    if (criticos > 0) return 'critical';
    if (stock < 1000) return 'low';
    return 'good';
  };

  const getStockColor = (level) => {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'low':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getStockIcon = (level) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'low':
        return '⚠️';
      default:
        return '✅';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          📦 Estado del Almacén
        </h3>
        <button
          onClick={() => navigate('/almacen/celofan')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Ver todo →
        </button>
      </div>

      {/* Resumen por tipo de producto */}
      <div className="space-y-4 mb-6">
        {/* Celofán */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📄</span>
            <div>
              <h4 className="font-medium text-gray-900">Celofán</h4>
              <p className="text-sm text-gray-600">
                {inventoryData.celofan.productos} productos
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${getStockColor(getStockLevel(inventoryData.celofan.stock, inventoryData.celofan.criticos))}`}>
              <span className="mr-1">
                {getStockIcon(getStockLevel(inventoryData.celofan.stock, inventoryData.celofan.criticos))}
              </span>
              <span className="font-medium">
                {inventoryData.celofan.stock.toLocaleString()} millares
              </span>
            </div>
            {inventoryData.celofan.criticos > 0 && (
              <p className="text-xs text-red-600">
                {inventoryData.celofan.criticos} con stock crítico
              </p>
            )}
          </div>
        </div>

        {/* Polietileno */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🛢️</span>
            <div>
              <h4 className="font-medium text-gray-900">Polietileno</h4>
              <p className="text-sm text-gray-600">
                {inventoryData.polietileno.productos} productos
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${getStockColor(getStockLevel(inventoryData.polietileno.stock, inventoryData.polietileno.criticos))}`}>
              <span className="mr-1">
                {getStockIcon(getStockLevel(inventoryData.polietileno.stock, inventoryData.polietileno.criticos))}
              </span>
              <span className="font-medium">
                {inventoryData.polietileno.stock.toLocaleString()} kg
              </span>
            </div>
            {inventoryData.polietileno.criticos > 0 && (
              <p className="text-xs text-red-600">
                {inventoryData.polietileno.criticos} con stock crítico
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Entregas pendientes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">🚚 Entregas Pendientes</h4>
          <span className="text-sm text-gray-500">
            {entregasPendientes.length} notas
          </span>
        </div>

        {entregasPendientes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <span className="text-2xl block mb-2">✅</span>
            <p className="text-sm">No hay entregas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {entregasPendientes.slice(0, 5).map((entrega, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <div>
                  <span className="font-medium">Nota #{entrega.numero_factura}</span>
                  <span className="text-gray-600 ml-2">{entrega.cliente}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-yellow-700">
                    {entrega.cantidad} {entrega.unidad}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entrega.dias_pendiente} días
                  </div>
                </div>
              </div>
            ))}

            {entregasPendientes.length > 5 && (
              <button
                onClick={() => navigate('/almacen/celofan')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
              >
                Ver {entregasPendientes.length - 5} más...
              </button>
            )}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/almacen/celofan')}
            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md transition-colors"
          >
            📄 Ver Celofán
          </button>
          <button
            onClick={() => navigate('/almacen/polietileno')}
            className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md transition-colors"
          >
            🛢️ Ver Polietileno
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatus;