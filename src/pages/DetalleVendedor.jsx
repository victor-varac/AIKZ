import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVendedorDetalle, deleteVendedor } from '../services/api/vendedores';
import VendedorForm from '../components/vendedores/VendedorForm';
import ClientesVendedorModal from '../components/vendedores/ClientesVendedorModal';
import FacturasVendedorModal from '../components/vendedores/FacturasVendedorModal';

const DetalleVendedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClientesModal, setShowClientesModal] = useState(false);
  const [showFacturasModal, setShowFacturasModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadVendedorDetalle();
    }
  }, [id]);

  const loadVendedorDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVendedorDetalle(id);
      setVendedor(data);
    } catch (error) {
      console.error('Error al cargar detalle del vendedor:', error);
      setError(error.message || 'Error al cargar los datos del vendedor');
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (nivel) => {
    switch (nivel) {
      case 'excelente': return 'text-green-600 bg-green-50 border-green-200';
      case 'bueno': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'regular': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'bajo': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceText = (nivel) => {
    switch (nivel) {
      case 'excelente': return '🏆 Excelente';
      case 'bueno': return '👍 Bueno';
      case 'regular': return '⚠️ Regular';
      case 'bajo': return '📉 Bajo';
      default: return '❓ N/A';
    }
  };

  const handleEditVendedor = () => {
    setShowEditModal(true);
  };

  const handleVendedorUpdated = (vendedorActualizado) => {
    setVendedor(vendedorActualizado);
    setShowEditModal(false);
  };

  const handleDeleteVendedor = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al vendedor "${vendedor.nombre}"?\n\nEsta acción no se puede deshacer y eliminará todos los datos relacionados.`)) {
      try {
        await deleteVendedor(id);
        alert('Vendedor eliminado exitosamente');
        navigate('/vendedores');
      } catch (error) {
        console.error('Error al eliminar vendedor:', error);
        alert('Error al eliminar el vendedor. Por favor, inténtalo de nuevo.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error al cargar los datos</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/vendedores')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver a Vendedores
            </button>
            <button
              onClick={loadVendedorDetalle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vendedor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Vendedor no encontrado</h2>
          <p className="text-yellow-600 mb-4">No se pudo encontrar el vendedor solicitado</p>
          <button
            onClick={() => navigate('/vendedores')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Volver a Vendedores
          </button>
        </div>
      </div>
    );
  }

  const stats = vendedor.estadisticas;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/vendedores')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              ← Volver a Vendedores
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👤 {vendedor.nombre}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>ID: {vendedor.id}</span>
              <span>•</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(stats.nivelPerformance)}`}>
                {getPerformanceText(stats.nivelPerformance)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEditVendedor}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Editar vendedor"
            >
              ✏️ <span className="ml-2">Editar</span>
            </button>
            <button
              onClick={handleDeleteVendedor}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Eliminar vendedor"
            >
              🗑️ <span className="ml-2">Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowClientesModal(true)}
          title="Click para ver todos los clientes"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
              <p className="text-xs text-gray-500">{stats.clientesActivos} activos</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowFacturasModal(true)}
          title="Click para ver todas las facturas"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.montoTotalVendido)}</p>
              <p className="text-xs text-gray-500">{stats.totalFacturas} facturas</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.montoEsteMes)}</p>
              <p className="text-xs text-gray-500">{stats.ventasEsteMes} ventas</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.saldoPendiente)}</p>
              <p className="text-xs text-gray-500">Por cobrar</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Análisis de Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Análisis de Performance
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio por cliente</span>
              <span className="font-semibold">{formatCurrency(stats.promedioVentaPorCliente)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio por factura</span>
              <span className="font-semibold">{formatCurrency(stats.promedioVentaPorFactura)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de cobranza</span>
              <span className="font-semibold">{stats.tasaCobranza.toFixed(1)}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de entrega</span>
              <span className="font-semibold">{stats.tasaEntrega.toFixed(1)}%</span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Productos vendidos</span>
                <span className="font-semibold">{stats.totalProductosVendidos}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Productos entregados</span>
                <span className="font-semibold">{stats.totalProductosEntregados}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🕒</span>
            Actividad Reciente
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Última venta</p>
              <p className="font-semibold">{formatDate(stats.ultimaVenta)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Último pago recibido</p>
              <p className="font-semibold">{formatDate(stats.ultimoPago)}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Ventas este año</p>
              <div className="flex justify-between">
                <span>{stats.ventasEsteAño} facturas</span>
                <span className="font-semibold">{formatCurrency(stats.montoEsteAño)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mejores Clientes */}
      {stats.mejoresClientes && stats.mejoresClientes.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            Mejores Clientes
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.mejoresClientes.slice(0, 5).map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/clientes/${item.cliente.id}`)}
                    title={`Ver detalles de ${item.cliente.empresa}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                        </span>
                        <span className="font-medium hover:text-blue-600 hover:underline">{item.cliente.empresa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.facturas}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(item.volumenTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Productos Más Vendidos */}
      {stats.productosMasVendidos && stats.productosMasVendidos.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📦</span>
            Productos Más Vendidos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.productosMasVendidos.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.producto.nombre}</h4>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.producto.material}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Cantidad vendida:</span>
                    <span className="font-medium">{item.cantidadTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Veces vendido:</span>
                    <span className="font-medium">{item.vecesVendido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingresos:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(item.ingresoTotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial Mensual */}
      {stats.historialMensual && stats.historialMensual.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📅</span>
            Historial Mensual (Últimos 12 meses)
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.historialMensual.map((mes, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{mes.mes}</td>
                    <td className="px-6 py-4">{mes.facturas}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(mes.montoVendido)}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{formatCurrency(mes.pagosRecibidos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      <VendedorForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onVendedorCreated={handleVendedorUpdated}
        vendedor={vendedor}
      />

      {/* Modal de clientes */}
      <ClientesVendedorModal
        isOpen={showClientesModal}
        onClose={() => setShowClientesModal(false)}
        vendedorId={id}
        vendedorNombre={vendedor?.nombre}
      />

      {/* Modal de facturas */}
      <FacturasVendedorModal
        isOpen={showFacturasModal}
        onClose={() => setShowFacturasModal(false)}
        vendedorId={id}
        vendedorNombre={vendedor?.nombre}
      />
    </div>
  );
};

export default DetalleVendedor;