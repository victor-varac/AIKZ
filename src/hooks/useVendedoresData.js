import { useState, useEffect, useCallback } from 'react';
import { getVendedores } from '../services/api/vendedores';

export const useVendedoresData = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 15;

  const loadVendedores = useCallback(async (resetData = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetData ? 0 : offset;

      const response = await getVendedores({
        offset: currentOffset,
        limit: LIMIT,
        filtros
      });

      if (resetData) {
        setVendedores(response.data);
        setOffset(LIMIT);
      } else {
        setVendedores(prev => [...prev, ...response.data]);
        setOffset(prev => prev + LIMIT);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.count || 0);

    } catch (err) {
      console.error('Error al cargar vendedores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset, filtros]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadVendedores(false);
    }
  }, [loadVendedores, loading, hasMore]);

  const applyFilters = useCallback((newFiltros) => {
    setFiltros(newFiltros);
    setOffset(0);
    setHasMore(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltros({});
    setOffset(0);
    setHasMore(true);
  }, []);

  const refresh = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    loadVendedores(true);
  }, [loadVendedores]);

  // Cargar datos iniciales
  useEffect(() => {
    loadVendedores(true);
  }, [filtros]);

  return {
    vendedores,
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