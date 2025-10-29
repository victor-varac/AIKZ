import React, { useState, useEffect } from 'react';
import { getStockProducto } from '../../services/api/productos';

const ProductoCard = ({ producto, onClick, onEdit, onDelete }) => {
  const [stock, setStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    if (producto.id && producto.material) {
      loadStock();
    }
  }, [producto.id, producto.material]);

  const loadStock = async () => {
    try {
      setLoadingStock(true);
      const stockActual = await getStockProducto(producto.id, producto.material);
      setStock(stockActual);
    } catch (error) {
      console.error('Error al cargar stock:', error);
      setStock(0);
    } finally {
      setLoadingStock(false);
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

  const getPresentacionIcon = (presentacion) => {
    switch (presentacion) {
      case 'rollo':
        return '🔄';
      case 'bobina':
        return '🌀';
      case 'lamina':
        return '📋';
      default:
        return '📦';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'industrial':
        return 'bg-blue-100 text-blue-800';
      case 'alimentario':
        return 'bg-green-100 text-green-800';
      case 'farmaceutico':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (stockValue) => {
    if (stockValue === null || stockValue === undefined) return 'text-gray-500';
    if (stockValue <= 0) return 'text-red-600';
    if (stockValue <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatDimension = (value, unit) => {
    if (!value) return '-';
    return `${value} ${unit}`;
  };

  const getStockUnit = (material) => {
    return material === 'celofan' ? 'millares' : 'kilos';
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit(producto);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete && onDelete(producto);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(producto)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getMaterialIcon(producto.material)}</span>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {producto.nombre || 'Sin nombre'}
            </h3>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getPresentacionIcon(producto.presentacion)}</span>
            <span className="text-sm text-gray-600 capitalize">
              {producto.presentacion || 'Sin especificar'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTipoColor(producto.tipo)}`}>
              {producto.tipo || 'Sin tipo'}
            </span>
          </div>
        </div>

        {/* Stock */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Stock</div>
          {loadingStock ? (
            <div className="text-sm text-gray-400">Cargando...</div>
          ) : (
            <div className={`text-lg font-bold ${getStockColor(stock)}`}>
              {stock !== null ? `${stock} ${getStockUnit(producto.material)}` : 'N/A'}
            </div>
          )}
        </div>
      </div>

      {/* Dimensiones */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">📏 Especificaciones</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Ancho</div>
            <div className="font-medium">
              {formatDimension(producto.ancho_cm, 'cm')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Largo</div>
            <div className="font-medium">
              {formatDimension(producto.largo_cm, 'cm')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Micraje</div>
            <div className="font-medium">
              {formatDimension(producto.micraje_um, 'μm')}
            </div>
          </div>
        </div>
      </div>

      {/* Material badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            producto.material === 'celofan'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {producto.material || 'Sin material'}
          </span>
        </div>

        <div className="text-xs text-gray-400">
          ID: {producto.id}
        </div>
      </div>

      {/* Stock status indicator */}
      {stock !== null && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Estado del stock:</span>
            <span className={`font-medium ${
              stock <= 0 ? 'text-red-600' :
              stock <= 10 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {stock <= 0 ? 'Sin stock' :
               stock <= 10 ? 'Stock bajo' :
               'Stock disponible'}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
        <button
          onClick={handleEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Editar producto"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Eliminar producto"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;