import React, { useState, useEffect } from 'react';
import { procesarCambiosEntregas } from '../../services/api/almacen';

const EditarEntregasModal = ({ isOpen, onClose, notaVenta, onEntregasActualizadas }) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entregasModificadas, setEntregasModificadas] = useState({});

  useEffect(() => {
    if (isOpen && notaVenta) {
      cargarEntregas();
    }
  }, [isOpen, notaVenta]);

  const cargarEntregas = () => {
    if (!notaVenta?.pedidos) return;

    // Extraer todas las entregas de todos los pedidos
    const todasLasEntregas = [];
    notaVenta.pedidos.forEach(pedido => {
      if (pedido.entregas) {
        pedido.entregas.forEach(entrega => {
          todasLasEntregas.push({
            ...entrega,
            pedido_id: pedido.id,
            producto_nombre: pedido.productos?.nombre || 'Producto sin nombre',
            producto_material: pedido.productos?.material || 'Sin material',
            cantidad_pedido: pedido.cantidad || 0
          });
        });
      }
    });

    // Ordenar por fecha de entrega (más reciente primero)
    todasLasEntregas.sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega));

    setEntregas(todasLasEntregas);
    setEntregasModificadas({});
    setError(null);
  };

  const handleCantidadChange = (entregaId, nuevaCantidad) => {
    setEntregasModificadas(prev => ({
      ...prev,
      [entregaId]: {
        ...prev[entregaId],
        cantidad: parseFloat(nuevaCantidad) || 0
      }
    }));
  };

  const handleFechaChange = (entregaId, nuevaFecha) => {
    setEntregasModificadas(prev => ({
      ...prev,
      [entregaId]: {
        ...prev[entregaId],
        fecha_entrega: nuevaFecha
      }
    }));
  };

  const marcarParaEliminar = (entregaId) => {
    setEntregasModificadas(prev => ({
      ...prev,
      [entregaId]: {
        ...prev[entregaId],
        eliminar: !prev[entregaId]?.eliminar
      }
    }));
  };

  const getValorActual = (entrega, campo) => {
    return entregasModificadas[entrega.id]?.[campo] ?? entrega[campo];
  };

  const estaParaEliminar = (entregaId) => {
    return entregasModificadas[entregaId]?.eliminar || false;
  };

  const handleGuardarCambios = async () => {
    try {
      setLoading(true);
      setError(null);

      const cambiosParaAplicar = Object.entries(entregasModificadas).filter(
        ([_, cambios]) => Object.keys(cambios).length > 0
      );

      if (cambiosParaAplicar.length === 0) {
        onClose();
        return;
      }

      // Procesar los cambios usando la API real
      await procesarCambiosEntregas(entregasModificadas);

      // Notificar al componente padre que las entregas fueron actualizadas
      if (onEntregasActualizadas) {
        await onEntregasActualizadas();
      }

      onClose();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const getUnidadMaterial = (material) => {
    return material === 'celofan' ? 'millares' : 'kg';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hayModificaciones = () => {
    return Object.keys(entregasModificadas).length > 0 &&
           Object.values(entregasModificadas).some(cambios => Object.keys(cambios).length > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ✏️ Editar Entregas - Nota #{notaVenta?.numero_factura}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Cliente: {notaVenta?.clientes?.empresa || 'Sin empresa'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <span className="text-red-400 mr-3">⚠️</span>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="mb-6">
          {entregas.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📦</span>
              <h3 className="text-lg font-medium text-gray-900 mt-4">No hay entregas registradas</h3>
              <p className="text-gray-500 mt-2">Esta nota de venta no tiene entregas para editar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entregas.map((entrega) => {
                const paraEliminar = estaParaEliminar(entrega.id);
                const unidad = getUnidadMaterial(entrega.producto_material);

                return (
                  <div
                    key={entrega.id}
                    className={`border rounded-lg p-4 transition-all ${
                      paraEliminar ? 'bg-red-50 border-red-200 opacity-60' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {entrega.producto_nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {entrega.producto_material === 'celofan' ? '📄 Celofán' : '🛢️ Polietileno'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Entrega #{entrega.id}</div>
                        <div className="text-sm text-gray-500">
                          Original: {formatDate(entrega.fecha_entrega)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad ({unidad})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={getValorActual(entrega, 'cantidad')}
                          onChange={(e) => handleCantidadChange(entrega.id, e.target.value)}
                          disabled={paraEliminar || loading}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            paraEliminar ? 'bg-gray-100 text-gray-400' : 'bg-white'
                          }`}
                        />
                      </div>

                      {/* Fecha */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de entrega
                        </label>
                        <input
                          type="date"
                          value={getValorActual(entrega, 'fecha_entrega')}
                          onChange={(e) => handleFechaChange(entrega.id, e.target.value)}
                          disabled={paraEliminar || loading}
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            paraEliminar ? 'bg-gray-100 text-gray-400' : 'bg-white'
                          }`}
                        />
                      </div>

                      {/* Acciones */}
                      <div className="flex items-end">
                        <button
                          onClick={() => marcarParaEliminar(entrega.id)}
                          disabled={loading}
                          className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            paraEliminar
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } disabled:opacity-50`}
                        >
                          {paraEliminar ? '↩️ Restaurar' : '🗑️ Eliminar'}
                        </button>
                      </div>
                    </div>

                    {/* Indicador de cambios */}
                    {entregasModificadas[entrega.id] && !paraEliminar && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="text-blue-700 font-medium">📝 Modificado</span>
                      </div>
                    )}

                    {paraEliminar && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="text-red-700 font-medium">🗑️ Marcado para eliminar</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumen de cambios */}
        {hayModificaciones() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Resumen de cambios:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(entregasModificadas).map(([entregaId, cambios]) => {
                const entrega = entregas.find(e => e.id.toString() === entregaId);
                if (!entrega || Object.keys(cambios).length === 0) return null;

                return (
                  <li key={entregaId}>
                    <strong>Entrega #{entregaId}</strong>: {
                      cambios.eliminar ? 'Será eliminada' :
                      Object.keys(cambios).map(campo => {
                        if (campo === 'cantidad') return `cantidad → ${cambios[campo]}`;
                        if (campo === 'fecha_entrega') return `fecha → ${cambios[campo]}`;
                        return null;
                      }).filter(Boolean).join(', ')
                    }
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarCambios}
            disabled={loading || !hayModificaciones()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarEntregasModal;