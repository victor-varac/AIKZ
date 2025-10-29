import { useState, useEffect, useCallback } from 'react';
import { getEstadisticasAñoActual } from '../services/api/pedidos';

export const useEstadisticasNotasVenta = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalNotas: 0,
    pagadasCompleto: 0,
    entregadasCompleto: 0,
    creditoVencido: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEstadisticasAñoActual();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadEstadisticas();
  }, [loadEstadisticas]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadEstadisticas();
  }, [loadEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    refresh
  };
};
