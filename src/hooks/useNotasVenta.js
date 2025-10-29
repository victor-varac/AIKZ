import { useState, useEffect, useCallback } from 'react';
import { getNotasVentaPaginadas } from '../services/api/pedidos';

export const useNotasVenta = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 15;

  const loadNotas = useCallback(async (resetData = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetData ? 0 : offset;

      const response = await getNotasVentaPaginadas({
        offset: currentOffset,
        limit: LIMIT,
        filtros
      });

      if (resetData) {
        setNotas(response.data);
        setOffset(LIMIT);
      } else {
        setNotas(prev => [...prev, ...response.data]);
        setOffset(prev => prev + LIMIT);
      }

      setHasMore(response.hasMore);
      setTotalCount(response.count || 0);

    } catch (err) {
      console.error('Error al cargar notas de venta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset, filtros]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotas(false);
    }
  }, [loadNotas, loading, hasMore]);

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
    loadNotas(true);
  }, [loadNotas]);

  // Función especial para cargar una cantidad específica de items (para restaurar estado)
  const loadNotasWithCount = useCallback(async (targetCount) => {
    try {
      setLoading(true);
      setError(null);

      // Calcular cuántas páginas necesitamos cargar
      const pagesToLoad = Math.ceil(targetCount / LIMIT);
      let allNotas = [];

      for (let page = 0; page < pagesToLoad; page++) {
        const currentOffset = page * LIMIT;
        const response = await getNotasVentaPaginadas({
          offset: currentOffset,
          limit: LIMIT,
          filtros
        });

        allNotas = [...allNotas, ...response.data];

        if (!response.hasMore) {
          setHasMore(false);
          break;
        }
      }

      // Limitar a la cantidad exacta solicitada
      const limitedNotas = allNotas.slice(0, targetCount);
      setNotas(limitedNotas);
      setOffset(limitedNotas.length);
      setTotalCount(allNotas.length);

      // Determinar si hay más items después de los cargados
      if (allNotas.length > targetCount) {
        setHasMore(true);
      }

    } catch (err) {
      console.error('Error al cargar notas de venta con count:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Cargar datos iniciales
  useEffect(() => {
    loadNotas(true);
  }, [filtros]);

  return {
    notas,
    loading,
    hasMore,
    error,
    totalCount,
    filtros,
    loadMore,
    applyFilters,
    resetFilters,
    refresh,
    loadNotasWithCount
  };
};