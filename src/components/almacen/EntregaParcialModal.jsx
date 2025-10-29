import React, { useState, useEffect } from 'react';

const EntregaParcialModal = ({ isOpen, onClose, notaVenta, onEntregaRegistrada }) => {
  const [cantidades, setCantidades] = useState({});
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && notaVenta) {
      // Inicializar cantidades con valores vacíos
      const initialCantidades = {};
      notaVenta.pedidos?.forEach(pedido => {
        const entregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
        const pendiente = (pedido.cantidad || 0) - entregado;
        initialCantidades[pedido.id] = {
          max: pendiente,
          value: 0
        };
      });
      setCantidades(initialCantidades);
      setError(null);
    }
  }, [isOpen, notaVenta]);

  const handleCantidadChange = (pedidoId, valor) => {
    const numValue = Math.max(0, parseInt(valor) || 0);
    const maxValue = cantidades[pedidoId]?.max || 0;

    setCantidades(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        value: Math.min(numValue, maxValue)
      }
    }));
  };

  const setMaxCantidad = (pedidoId) => {
    setCantidades(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        value: prev[pedidoId]?.max || 0
      }
    }));
  };

  const getTotalEntrega = () => {
    return Object.values(cantidades).reduce((sum, item) => sum + (item.value || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Preparar entregas solo para productos con cantidad > 0
      const entregas = [];
      Object.entries(cantidades).forEach(([pedidoId, data]) => {
        if (data.value > 0) {
          entregas.push({
            pedidos_id: parseInt(pedidoId),
            cantidad: data.value,
            fecha_entrega: fechaEntrega
          });
        }
      });

      if (entregas.length === 0) {
        throw new Error('Debe especificar al menos una cantidad mayor a 0');
      }

      // Llamar a la función proporcionada por el padre
      await onEntregaRegistrada(entregas);

      // Cerrar modal
      onClose();
    } catch (err) {
      console.error('Error al registrar entrega:', err);
      setError(err.message || 'Error al registrar la entrega');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📝 Registrar Entrega Parcial
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Información de la nota */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900">
            Nota #{notaVenta?.numero_factura}
          </h3>
          <p className="text-sm text-gray-600">
            Cliente: {notaVenta?.clientes?.empresa}
          </p>
          <p className="text-sm text-gray-600">
            Total pendiente: {(notaVenta?.estadisticas?.totalPendiente || 0).toLocaleString()} millares
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <span className="text-red-400 mr-3">⚠️</span>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha de entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Entrega *
            </label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lista de productos */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Cantidades a Entregar
            </h4>
            <div className="space-y-4">
              {notaVenta?.pedidos?.map((pedido) => {
                const entregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
                const pendiente = (pedido.cantidad || 0) - entregado;

                if (pendiente <= 0) return null;

                return (
                  <div key={pedido.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {pedido.productos?.nombre || 'Producto sin nombre'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {pedido.productos?.ancho_cm}cm x {pedido.productos?.largo_cm}cm
                          {pedido.productos?.micraje_um && ` • ${pedido.productos.micraje_um}μm`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaxCantidad(pedido.id)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                      >
                        Máximo
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Pedido</div>
                        <div className="font-medium">{(pedido.cantidad || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Entregado</div>
                        <div className="font-medium text-green-600">{entregado.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Pendiente</div>
                        <div className="font-medium text-red-600">{pendiente.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad a entregar (máximo: {pendiente.toLocaleString()})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={pendiente}
                        value={cantidades[pedido.id]?.value || ''}
                        onChange={(e) => handleCantidadChange(pedido.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">
                Total a entregar:
              </span>
              <span className="text-xl font-bold text-blue-900">
                {getTotalEntrega().toLocaleString()} millares
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || getTotalEntrega() === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Registrando...' : `Registrar Entrega (${getTotalEntrega().toLocaleString()} millares)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntregaParcialModal;