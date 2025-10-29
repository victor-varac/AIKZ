import { useState, useEffect, useCallback } from 'react';
import { getProductosPorMaterial } from '../services/api/productos';

export const useProductos = (material) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 15;

  // Función interna para cargar productos
  const loadProductosInternal = async (resetData = false, offsetValue = 0, filtrosValue = {}) => {
    if (!material) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getProductosPorMaterial(material, {
        offset: offsetValue,
        limit: LIMIT,
        filtros: filtrosValue
      });

      if (resetData) {
        setProductos(response.data);
        setOffset(LIMIT);
      } else {
        setProductos(prev => [...prev, ...response.data]);
        setOffset(prev => prev + LIMIT);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.count || 0);

    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = useCallback((resetData = false, currentFiltros = filtros) => {
    loadProductosInternal(resetData, resetData ? 0 : offset, currentFiltros);
  }, [material, offset, filtros]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProductos(false);
    }
  }, [loadProductos, loading, hasMore]);

  const applyFilters = useCallback((newFiltros) => {
    setProductos([]);
    setOffset(0);
    setHasMore(true);
    setFiltros(newFiltros);
    // Cargar datos con los nuevos filtros
    loadProductosInternal(true, 0, newFiltros);
  }, [material]);

  const resetFilters = useCallback(() => {
    setProductos([]);
    setOffset(0);
    setHasMore(true);
    setFiltros({});
    // Cargar datos sin filtros
    loadProductosInternal(true, 0, {});
  }, [material]);

  const refresh = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    loadProductosInternal(true, 0, filtros);
  }, [material, filtros]);

  // Cargar datos iniciales cuando cambia el material
  useEffect(() => {
    if (material) {
      setProductos([]);
      setOffset(0);
      setHasMore(true);
      setFiltros({});
      loadProductosInternal(true, 0, {});
    }
  }, [material]);

  return {
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
  };
};