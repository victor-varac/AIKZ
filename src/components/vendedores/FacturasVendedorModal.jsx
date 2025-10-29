import React, { useState, useEffect } from 'react';
import { getFacturasByVendedor } from '../../services/api/pedidos';

const FacturasVendedorModal = ({ isOpen, onClose, vendedorId, vendedorNombre }) => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isOpen && vendedorId) {
      loadFacturas();
    }
  }, [isOpen, vendedorId]);

  const loadFacturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFacturasByVendedor(vendedorId);
      setFacturas(data);
    } catch (error) {
      console.error('Error al cargar facturas del vendedor:', error);
      setError('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'parcial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const facturasFiltradas = facturas.filter(factura => {
    // Filtro por estado
    if (filtro !== 'todas') {
      if (filtro === 'pagadas' && factura.estadoPago?.toLowerCase() !== 'pagada') return false;
      if (filtro === 'pendientes' && factura.estadoPago?.toLowerCase() !== 'pendiente') return false;
      if (filtro === 'vencidas' && factura.estadoPago?.toLowerCase() !== 'vencida') return false;
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      return (
        factura.numeroFactura?.toLowerCase().includes(searchTerm) ||
        factura.cliente?.empresa?.toLowerCase().includes(searchTerm) ||
        factura.cliente?.nombreContacto?.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  // Calcular totales
  const totales = {
    total: facturasFiltradas.reduce((sum, f) => sum + (f.total || 0), 0),
    pagado: facturasFiltradas.reduce((sum, f) => sum + (f.montoPagado || 0), 0),
    pendiente: facturasFiltradas.reduce((sum, f) => sum + (f.saldoPendiente || 0), 0),
    cantidad: facturasFiltradas.length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              📊 Facturas de {vendedorNombre}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Historial completo de facturas y notas de venta
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número de factura o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'todas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({facturas.length})
            </button>
            <button
              onClick={() => setFiltro('pagadas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'pagadas'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pagadas
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'pendientes'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltro('vencidas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'vencidas'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vencidas
            </button>
          </div>
        </div>

        {/* Resumen de totales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600">Total Facturas</p>
            <p className="text-xl font-bold text-blue-900">{totales.cantidad}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600">Monto Total</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totales.total)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600">Total Pagado</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(totales.pagado)}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-yellow-600">Pendiente</p>
            <p className="text-xl font-bold text-yellow-900">{formatCurrency(totales.pendiente)}</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadFacturas}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {busqueda || filtro !== 'todas'
                  ? 'No se encontraron facturas con los filtros aplicados'
                  : 'No hay facturas registradas para este vendedor'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factura
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendiente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturasFiltradas.map((factura) => (
                    <tr key={factura.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {factura.numeroFactura || `#${factura.id}`}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(factura.fecha)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {factura.cliente?.empresa || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {factura.cliente?.nombreContacto}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(factura.total)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(factura.montoPagado || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-yellow-600">
                          {formatCurrency(factura.saldoPendiente || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(factura.estadoPago)}`}>
                          {factura.estadoPago || 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturasVendedorModal;