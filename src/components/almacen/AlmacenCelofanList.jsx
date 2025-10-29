import React, { useState, useEffect } from 'react';
import { getInventarioCelofan, getNotasVentaCelofan, getEntradasCelofanPorProducto, entregarTodo, registrarEntregasParciales, createMovimientoCelofan } from '../../services/api/almacen';
import InventarioCelofanTable from './InventarioCelofanTable';
import EntregasCelofanCards from './EntregasCelofanCards';
import EntradasCelofanCards from './EntradasCelofanCards';
import EntregaParcialModal from './EntregaParcialModal';
import MovimientoCelofanForm from './MovimientoCelofanForm';
import ProductoCelofanDetail from './ProductoCelofanDetail';
import EditarEntregasModal from './EditarEntregasModal';
import AjusteInventarioModal from './AjusteInventarioModal';

const AlmacenCelofanList = () => {
  const [inventario, setInventario] = useState([]);
  const [notasVenta, setNotasVenta] = useState([]);
  const [entradasPorProducto, setEntradasPorProducto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('inventario'); // 'inventario' | 'entregas' | 'entradas'
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  const [showEntregaParcialModal, setShowEntregaParcialModal] = useState(false);
  const [showEditarEntregasModal, setShowEditarEntregasModal] = useState(false);
  const [showAjusteInventarioModal, setShowAjusteInventarioModal] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [showProductoDetail, setShowProductoDetail] = useState(false);


  useEffect(() => {
    loadData();
  }, [view]);


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (view === 'inventario') {
        const data = await getInventarioCelofan();
        setInventario(data);
      } else if (view === 'entregas') {
        const data = await getNotasVentaCelofan();
        setNotasVenta(data);
      } else if (view === 'entradas') {
        const data = await getEntradasCelofanPorProducto();
        setEntradasPorProducto(data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMovimientoCreated = (nuevoMovimiento) => {
    // Recargar datos después de crear un movimiento
    loadData();
    setShowMovimientoForm(false);
  };

  const handleNuevoMovimiento = (producto) => {
    setShowMovimientoForm(true);
  };

  const handleEntregarTodo = async (nota) => {
    try {
      const confirmacion = window.confirm(
        `¿Estás seguro de entregar TODOS los productos pendientes de la Nota #${nota.numero_factura}?\n\n` +
        `Total a entregar: ${(nota.estadisticas?.totalPendiente || 0).toLocaleString()} millares\n\n` +
        `Esta acción no se puede deshacer.`
      );

      if (!confirmacion) return;

      setLoading(true);
      await entregarTodo(nota.id);

      // Recargar datos para reflejar los cambios
      await loadData();

      alert(`✅ Entrega completa registrada para la Nota #${nota.numero_factura}`);
    } catch (error) {
      console.error('Error al entregar todo:', error);
      alert(`❌ Error al registrar entrega: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarEntrega = (nota) => {
    setNotaSeleccionada(nota);
    setShowEntregaParcialModal(true);
  };

  const handleEditarEntregas = (nota) => {
    setNotaSeleccionada(nota);
    setShowEditarEntregasModal(true);
  };

  const handleAjustarStock = (producto) => {
    setProductoSeleccionado(producto);
    setShowAjusteInventarioModal(true);
  };

  const handleAjusteCreated = async (ajusteData) => {
    try {
      // Usar la función existente para crear el movimiento de ajuste
      await createMovimientoCelofan(ajusteData);

      // Recargar los datos para mostrar el stock actualizado
      await loadData();

      // Mostrar mensaje de éxito
      const tipoAjuste = ajusteData.movimiento === 'entrada' ? 'incrementado' : 'decrementado';
      const producto = productoSeleccionado;
      alert(`✅ Ajuste de inventario completado:\n\nProducto: ${producto.producto}\nStock anterior: ${producto.stock_millares} millares\nMovimiento: ${tipoAjuste} ${ajusteData.millares} millares\n\nEl inventario ha sido actualizado.`);

      // Cerrar el modal
      setShowAjusteInventarioModal(false);
    } catch (error) {
      console.error('Error al crear ajuste:', error);
      throw error; // Re-lanzar para que el modal lo maneje
    }
  };

  const handleEntregaRegistrada = async (entregas) => {
    try {
      await registrarEntregasParciales(entregas);

      // Recargar datos para reflejar los cambios
      await loadData();

      const totalEntregado = entregas.reduce((sum, entrega) => sum + entrega.cantidad, 0);
      alert(`✅ Entrega parcial registrada: ${totalEntregado.toLocaleString()} millares`);
    } catch (error) {
      console.error('Error al registrar entrega parcial:', error);
      throw error; // Re-throw para que el modal pueda mostrar el error
    }
  };

  const handleNuevaEntrada = (producto) => {
    setProductoSeleccionado(producto);
    setShowMovimientoForm(true);
  };

  const handleVerDetalleProducto = (producto) => {
    setProductoSeleccionado(producto);
    setShowProductoDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowProductoDetail(false);
    setProductoSeleccionado(null);
    // Recargar datos para reflejar cambios
    if (view === 'entradas') {
      loadData();
    }
  };

  // Mostrar detalle del producto si está seleccionado
  if (showProductoDetail && productoSeleccionado) {
    return (
      <ProductoCelofanDetail
        producto={productoSeleccionado}
        onBack={handleBackFromDetail}
        onMovimientoCreated={() => {
          // Recargar datos después de crear movimiento
          loadData();
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar los datos</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📄 Almacén de Celofán
              </h1>
              <p className="mt-2 text-gray-600">
                Gestión de inventario y movimientos de productos de celofán
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMovimientoForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📥 Registrar Movimiento
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setView('entregas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'entregas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Entregas
              </button>
              <button
                onClick={() => setView('inventario')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'inventario'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Inventario Actual
              </button>
              <button
                onClick={() => setView('entradas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'entradas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📥 Entradas
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según vista */}
        {view === 'inventario' && (
          <InventarioCelofanTable
            inventario={inventario}
            loading={loading}
            onAjustarStock={handleAjustarStock}
          />
        )}


        {view === 'entregas' && (
          <EntregasCelofanCards
            notasVenta={notasVenta}
            loading={loading}
            onEntregarTodo={handleEntregarTodo}
            onRegistrarEntrega={handleRegistrarEntrega}
            onEditarEntregas={handleEditarEntregas}
          />
        )}

        {view === 'entradas' && (
          <EntradasCelofanCards
            entradasPorProducto={entradasPorProducto}
            loading={loading}
            onNuevaEntrada={handleNuevaEntrada}
            onVerDetalle={handleVerDetalleProducto}
          />
        )}

        {/* Modal para registrar movimiento */}
        <MovimientoCelofanForm
          isOpen={showMovimientoForm}
          onClose={() => {
            setShowMovimientoForm(false);
            setProductoSeleccionado(null);
          }}
          onMovimientoCreated={handleMovimientoCreated}
          productoPreseleccionado={productoSeleccionado}
        />

        {/* Modal para entrega parcial */}
        <EntregaParcialModal
          isOpen={showEntregaParcialModal}
          onClose={() => {
            setShowEntregaParcialModal(false);
            setNotaSeleccionada(null);
          }}
          notaVenta={notaSeleccionada}
          onEntregaRegistrada={handleEntregaRegistrada}
        />

        {/* Modal para editar entregas */}
        <EditarEntregasModal
          isOpen={showEditarEntregasModal}
          onClose={() => {
            setShowEditarEntregasModal(false);
            setNotaSeleccionada(null);
          }}
          notaVenta={notaSeleccionada}
          onEntregasActualizadas={loadData}
        />

        {/* Modal para ajustar inventario */}
        <AjusteInventarioModal
          isOpen={showAjusteInventarioModal}
          onClose={() => {
            setShowAjusteInventarioModal(false);
            setProductoSeleccionado(null);
          }}
          producto={productoSeleccionado}
          onAjusteCreated={handleAjusteCreated}
        />
      </div>
    </div>
  );
};

export default AlmacenCelofanList;