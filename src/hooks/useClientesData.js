import { useState, useEffect, useCallback } from 'react';
import { getClientes } from '../services/api/clientes';

export const useClientesData = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 15;

  const loadClientes = useCallback(async (resetData = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetData ? 0 : offset;

      const response = await getClientes({
        offset: currentOffset,
        limit: LIMIT,
        filtros
      });

      if (resetData) {
        setClientes(response.data);
        setOffset(LIMIT);
      } else {
        setClientes(prev => [...prev, ...response.data]);
        setOffset(prev => prev + LIMIT);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.count || 0);

    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset, filtros]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadClientes(false);
    }
  }, [loadClientes, loading, hasMore]);

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
    loadClientes(true);
  }, [loadClientes]);

  // Cargar datos iniciales
  useEffect(() => {
    loadClientes(true);
  }, [filtros]);

  return {
    clientes,
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