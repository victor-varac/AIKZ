import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductos } from '../../hooks/useProductos';
import { deleteProducto } from '../../services/api/productos';
import ProductoCard from './ProductoCard';
import FiltrosProductos from './FiltrosProductos';
import ProductoForm from './ProductoForm';

const ProductosList = () => {
  const { material } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    productos,
    loading,
    hasMore,
    error,
    totalCount,
    filtros,
    loadMore,
    applyFilters,
    resetFilters,
    refresh
  } = useProductos(material);

  const handleCardClick = (producto) => {
    console.log('Clicked producto:', producto);
    // Aquí puedes agregar navegación al detalle o abrir un modal
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  const handleProductoSuccess = () => {
    refresh(); // Recargar la lista después de crear un nuevo producto
    setEditingProduct(null); // Limpiar producto en edición
  };

  const handleEditProduct = (producto) => {
    setEditingProduct(producto);
    setShowModal(true);
  };

  const handleDeleteProduct = async (producto) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      try {
        await deleteProducto(producto.id);
        refresh(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const getMaterialTitle = (material) => {
    switch (material) {
      case 'celofan':
        return '📄 Productos de Celofán';
      case 'polietileno':
        return '🛢️ Productos de Polietileno';
      default:
        return '📦 Productos';
    }
  };

  const getMaterialIcon = (material) => {
    switch (material) {
      case 'celofan':
        return '📄';
      case 'polietileno':
        return '🛢️';
      default:
        return '📦';
    }
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📦 Productos</h1>
            <p className="text-gray-600 mb-8">
              Selecciona un tipo de material desde el menú lateral para ver los productos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-semibold mb-2">Celofán</h3>
                <p className="text-gray-600 text-sm">
                  Productos de celofán para diversas aplicaciones industriales y comerciales.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
                <div className="text-4xl mb-4">🛢️</div>
                <h3 className="text-lg font-semibold mb-2">Polietileno</h3>
                <p className="text-gray-600 text-sm">
                  Productos de polietileno con diferentes presentaciones y especificaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar los productos
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={refresh}
                    className="bg-red-100 px-2 py-1 text-sm text-red-800 rounded hover:bg-red-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getMaterialTitle(material)}
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona el catálogo de productos de {material === 'celofan' ? 'celofán' : 'polietileno'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalCount > 0 ? `${productos.length} de ${totalCount} productos` : 'Sin productos'}
              </span>
              <button
                onClick={() => setShowModal(true)}
                disabled={!material}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Nuevo Producto
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosProductos
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          loading={loading}
          material={material}
        />

        {/* Estadísticas rápidas */}
        {productos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Total Productos</div>
              <div className="text-2xl font-bold text-gray-900">{productos.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Tipo Industrial</div>
              <div className="text-2xl font-bold text-blue-600">
                {productos.filter(p => p.tipo === 'industrial').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Tipo Alimentario</div>
              <div className="text-2xl font-bold text-green-600">
                {productos.filter(p => p.tipo === 'alimentario').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Tipo Farmacéutico</div>
              <div className="text-2xl font-bold text-purple-600">
                {productos.filter(p => p.tipo === 'farmaceutico').length}
              </div>
            </div>
          </div>
        )}

        {/* Lista de cards */}
        {productos.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{getMaterialIcon(material)}</div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay productos de {material === 'celofan' ? 'celofán' : 'polietileno'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.keys(filtros).length > 0
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Comienza agregando un nuevo producto.'}
            </p>
            {Object.keys(filtros).length > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onClick={handleCardClick}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && productos.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón Cargar más */}
        {hasMore && productos.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </div>
              ) : (
                'Cargar más (15 productos)'
              )}
            </button>
          </div>
        )}

        {/* Indicador de fin de resultados */}
        {!hasMore && productos.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Has visto todos los productos de {material === 'celofan' ? 'celofán' : 'polietileno'} disponibles
            </p>
          </div>
        )}

        {/* Modal para nuevo/editar producto */}
        {material && (
          <ProductoForm
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSuccess={handleProductoSuccess}
            material={material}
            producto={editingProduct}
          />
        )}
      </div>
    </div>
  );
};

export default ProductosList;