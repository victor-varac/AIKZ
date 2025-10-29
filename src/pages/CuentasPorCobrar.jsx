import React, { useState, useEffect } from 'react';
import { getCuentasPorCobrar, getResumenCuentasPorCobrar, registrarPagoRapido } from '../services/api/finanzas';
import ResumenCuentasPorCobrar from '../components/finanzas/ResumenCuentasPorCobrar';
import FiltrosCuentasPorCobrar from '../components/finanzas/FiltrosCuentasPorCobrar';
import TablaCuentasPorCobrar from '../components/finanzas/TablaCuentasPorCobrar';
import PagoRapidoForm from '../components/finanzas/PagoRapidoForm';

const CuentasPorCobrar = () => {
  const [cuentas, setCuentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    cliente: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    montoMinimo: '',
    montoMaximo: '',
    soloConSaldo: true
  });

  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: true
  });

  const [showPagoRapido, setShowPagoRapido] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);

  useEffect(() => {
    loadData();
  }, [filtros, pagination.offset]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cuentasData, resumenData] = await Promise.all([
        getCuentasPorCobrar({
          offset: pagination.offset,
          limit: pagination.limit,
          filtros
        }),
        getResumenCuentasPorCobrar()
      ]);

      setCuentas(pagination.offset === 0 ? cuentasData.data : [...cuentas, ...cuentasData.data]);
      setResumen(resumenData);
      setPagination(prev => ({
        ...prev,
        hasMore: cuentasData.hasMore
      }));

    } catch (err) {
      console.error('Error al cargar cuentas por cobrar:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination({ offset: 0, limit: 20, hasMore: true });
  };

  const clearFilters = () => {
    setFiltros({
      cliente: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      montoMinimo: '',
      montoMaximo: '',
      soloConSaldo: true
    });
    setPagination({ offset: 0, limit: 20, hasMore: true });
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado, diasVencido = 0) => {
    const configs = {
      'VIGENTE': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Vigente'
      },
      'VENCIDA': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: `Vencida ${diasVencido > 0 ? `(${diasVencido} días)` : ''}`
      },
      'PAGADA': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Pagada'
      }
    };

    const config = configs[estado] || configs['VIGENTE'];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handlePagoRapido = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setShowPagoRapido(true);
  };

  const handleSavePagoRapido = async (pagoData) => {
    try {
      await registrarPagoRapido(pagoData);

      // Recargar datos después del pago
      await loadData();

      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  };

  if (loading && cuentas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar datos</h3>
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
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            💰 Cuentas por Cobrar
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión y seguimiento de pagos pendientes
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <ResumenCuentasPorCobrar
          resumen={resumen}
          formatCurrency={formatCurrency}
        />

        {/* Filtros */}
        <FiltrosCuentasPorCobrar
          filtros={filtros}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Tabla de cuentas */}
        <TablaCuentasPorCobrar
          cuentas={cuentas}
          loading={loading}
          pagination={pagination}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getEstadoBadge={getEstadoBadge}
          onPagoRapido={handlePagoRapido}
          onLoadMore={loadMore}
        />
      </div>

      {/* Modal de pago rápido */}
      <PagoRapidoForm
        isOpen={showPagoRapido}
        onClose={() => setShowPagoRapido(false)}
        onSave={handleSavePagoRapido}
        cuenta={cuentaSeleccionada}
      />
    </div>
  );
};

export default CuentasPorCobrar;