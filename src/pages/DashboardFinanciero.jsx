import { useState, useEffect } from 'react';
import KPICard from '../components/dashboard/KPICard';
import AlertCard from '../components/dashboard/AlertCard';
import TendenciasChart from '../components/dashboard/TendenciasChart';
import TopClientesWidget from '../components/dashboard/TopClientesWidget';
import GastosCategoriaWidget from '../components/dashboard/GastosCategoriaWidget';
import ResumenEjecutivo from '../components/dashboard/ResumenEjecutivo';
import ProduccionVsVentas from '../components/dashboard/ProduccionVsVentas';
import IndicadoresSalud from '../components/dashboard/IndicadoresSalud';
import {
  getResumenEjecutivo,
  getTendenciasMensuales,
  getTopClientes,
  getGastosPorCategoria,
  exportarDashboard,
  getDatosProduccion,
  getIndicadoresSalud,
  getDatosEnTiempoReal
} from '../services/api/dashboardFinanciero';
import FiltrosAvanzados from '../components/dashboard/FiltrosAvanzados';

const DashboardFinanciero = () => {
  const [loading, setLoading] = useState(true);
  const [resumenEjecutivo, setResumenEjecutivo] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [datosProduccion, setDatosProduccion] = useState(null);
  const [indicadoresSalud, setIndicadoresSalud] = useState(null);
  const [datosEnTiempoReal, setDatosEnTiempoReal] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('ejecutivo');
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    fechaInicio: '',
    fechaFin: '',
    tipoProducto: 'todos',
    cliente: '',
    montoMinimo: '',
    montoMaximo: ''
  });

  useEffect(() => {
    cargarDashboard();
  }, [filtros]);

  useEffect(() => {
    // Actualizar datos en tiempo real cada 30 segundos
    const interval = setInterval(() => {
      cargarDatosEnTiempoReal();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarDashboard = async () => {
    setLoading(true);
    try {
      const periodo = {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      };

      const [
        resumenData,
        tendenciasData,
        clientesData,
        gastosData,
        produccionData,
        saludData,
        tiempoRealData
      ] = await Promise.all([
        getResumenEjecutivo(periodo),
        getTendenciasMensuales(12),
        getTopClientes(10, periodo),
        getGastosPorCategoria(periodo),
        getDatosProduccion(periodo),
        getIndicadoresSalud(),
        getDatosEnTiempoReal()
      ]);

      setResumenEjecutivo(resumenData);
      setTendencias(tendenciasData);
      setTopClientes(clientesData);
      setGastosPorCategoria(gastosData);
      setDatosProduccion(produccionData);
      setIndicadoresSalud(saludData);
      setDatosEnTiempoReal(tiempoRealData);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      // Datos de fallback
      setResumenEjecutivo({
        kpis: {
          ingresos: 0,
          egresos: 0,
          utilidadBruta: 0,
          margenUtilidad: 0,
          cuentasPorCobrar: 0,
          cuentasPorPagar: 0,
          flujoEfectivo: 0,
          liquidez: 0
        },
        crecimientoIngresos: 0,
        alertas: []
      });
      setTendencias([]);
      setTopClientes([]);
      setGastosPorCategoria([]);
      setDatosProduccion(null);
      setIndicadoresSalud(null);
      setDatosEnTiempoReal(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosEnTiempoReal = async () => {
    try {
      const tiempoRealData = await getDatosEnTiempoReal();
      setDatosEnTiempoReal(tiempoRealData);
    } catch (error) {
      console.error('Error al cargar datos en tiempo real:', error);
    }
  };

  const manejarExportar = async (formato) => {
    try {
      const datos = {
        resumenEjecutivo,
        tendencias,
        topClientes,
        gastosPorCategoria,
        fechaGeneracion: new Date().toISOString()
      };

      const resultado = await exportarDashboard(datos, formato);
      if (resultado.success) {
        alert(`Dashboard exportado exitosamente en formato ${formato}`);
      }
    } catch (error) {
      console.error('Error al exportar dashboard:', error);
      alert('Error al exportar el dashboard. Por favor intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, crecimientoIngresos, alertas } = resumenEjecutivo || { kpis: {}, alertas: [] };

  const vistas = [
    { id: 'ejecutivo', label: 'Vista Ejecutiva', icono: '👔', descripcion: 'Análisis estratégico integral' },
    { id: 'operativo', label: 'Vista Operativa', icono: '⚙️', descripcion: 'Métricas de producción y ventas' },
    { id: 'financiero', label: 'Vista Financiera', icono: '💰', descripcion: 'Indicadores y tendencias' },
    { id: 'salud', label: 'Salud Empresarial', icono: '🏥', descripcion: 'Diagnóstico y recomendaciones' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard Financiero Empresarial
                  </h1>
                  <p className="text-gray-600">
                    Sistema de Gestión Industrial • Análisis en Tiempo Real
                  </p>
                </div>
              </div>

              {/* Indicador de estado del sistema */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 text-sm font-medium">Sistema Activo</span>
                </div>
                <div className="text-sm text-gray-600">
                  Última actualización: {new Date().toLocaleTimeString('es-MX')}
                </div>
              </div>
            </div>

            {/* Controles Premium */}
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-3">
                {/* Controles de fecha movidos a FiltrosAvanzados */}

                <div className="flex space-x-2">
                  <button
                    onClick={() => manejarExportar('excel')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
                  >
                    📊 Excel
                  </button>
                  <button
                    onClick={() => manejarExportar('pdf')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm"
                  >
                    📄 PDF
                  </button>
                </div>
              </div>

              {/* Navegación de Vistas */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {vistas.map((vista) => (
                  <button
                    key={vista.id}
                    onClick={() => setVistaActiva(vista.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      vistaActiva === vista.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                    title={vista.descripcion}
                  >
                    <span>{vista.icono}</span>
                    <span className="hidden lg:block">{vista.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Filtros Avanzados */}
        <FiltrosAvanzados
          filtros={filtros}
          onFiltrosChange={setFiltros}
          mostrarFiltroProducto={true}
          mostrarFiltroCliente={true}
          mostrarFiltroProveedor={false}
        />
        {/* Vista Ejecutiva */}
        {vistaActiva === 'ejecutivo' && (
          <div className="space-y-8">
            {/* Resumen Ejecutivo Premium */}
            <ResumenEjecutivo resumen={resumenEjecutivo} />

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                titulo="Ingresos Totales"
                valor={kpis.ingresos || 0}
                icono="💰"
                tendencia={crecimientoIngresos}
                colorTexto="text-green-600"
              />
              <KPICard
                titulo="Egresos Totales"
                valor={kpis.egresos || 0}
                icono="💸"
                colorTexto="text-red-600"
              />
              <KPICard
                titulo="Utilidad Bruta"
                valor={kpis.utilidadBruta || 0}
                icono="📈"
                colorTexto="text-blue-600"
              />
              <KPICard
                titulo="Margen de Utilidad"
                valor={`${(kpis.margenUtilidad || 0).toFixed(1)}%`}
                icono="📊"
                formatearValor={false}
                colorTexto="text-purple-600"
              />
            </div>

            {/* Alertas Ejecutivas */}
            {alertas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertas.map((alerta, index) => (
                  <AlertCard key={index} alerta={alerta} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista Operativa */}
        {vistaActiva === 'operativo' && (
          <div className="space-y-8">
            {/* Panel de Producción vs Ventas */}
            <ProduccionVsVentas />

            {/* Métricas Operativas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                titulo="Eficiencia Productiva"
                valor="89.5%"
                icono="⚡"
                formatearValor={false}
                colorTexto="text-green-600"
              />
              <KPICard
                titulo="Rotación de Inventario"
                valor="12.3"
                icono="🔄"
                formatearValor={false}
                colorTexto="text-blue-600"
              />
              <KPICard
                titulo="Cumplimiento de Entrega"
                valor="94.2%"
                icono="🎯"
                formatearValor={false}
                colorTexto="text-purple-600"
              />
            </div>

            {/* Análisis de Clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopClientesWidget
                clientes={topClientes}
                titulo="Top Clientes por Volumen"
              />
              <GastosCategoriaWidget
                gastos={gastosPorCategoria}
                titulo="Distribución de Costos Operativos"
              />
            </div>
          </div>
        )}

        {/* Vista Financiera */}
        {vistaActiva === 'financiero' && (
          <div className="space-y-8">
            {/* KPIs Financieros Detallados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                titulo="Cuentas por Cobrar"
                valor={kpis.cuentasPorCobrar || 0}
                icono="📋"
                colorTexto="text-yellow-600"
              />
              <KPICard
                titulo="Cuentas por Pagar"
                valor={kpis.cuentasPorPagar || 0}
                icono="📝"
                colorTexto="text-orange-600"
              />
              <KPICard
                titulo="Flujo de Efectivo"
                valor={kpis.flujoEfectivo || 0}
                icono="💹"
                colorTexto={kpis.flujoEfectivo >= 0 ? "text-green-600" : "text-red-600"}
              />
              <KPICard
                titulo="Ratio de Liquidez"
                valor={kpis.cuentasPorCobrar > 0 ? (kpis.cuentasPorCobrar / (kpis.cuentasPorPagar || 1)).toFixed(2) : '0.00'}
                icono="💧"
                formatearValor={false}
                colorTexto="text-blue-600"
              />
            </div>

            {/* Tendencias Financieras */}
            <TendenciasChart
              datos={tendencias}
              titulo="Tendencias Financieras (Últimos 12 meses)"
            />

            {/* Análisis Detallado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopClientesWidget
                clientes={topClientes}
                titulo="Análisis de Cartera de Clientes"
              />
              <GastosCategoriaWidget
                gastos={gastosPorCategoria}
                titulo="Estructura de Gastos"
              />
            </div>
          </div>
        )}

        {/* Vista de Salud Empresarial */}
        {vistaActiva === 'salud' && (
          <div className="space-y-8">
            {/* Indicadores de Salud */}
            <IndicadoresSalud kpis={kpis} alertas={alertas} />

            {/* Métricas de Diagnóstico */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                titulo="Score de Salud"
                valor="85"
                icono="🏥"
                formatearValor={false}
                colorTexto="text-green-600"
              />
              <KPICard
                titulo="Riesgo Financiero"
                valor="Bajo"
                icono="⚠️"
                formatearValor={false}
                colorTexto="text-green-600"
              />
              <KPICard
                titulo="Sostenibilidad"
                valor="Alta"
                icono="🌱"
                formatearValor={false}
                colorTexto="text-green-600"
              />
              <KPICard
                titulo="Capacidad de Crecimiento"
                valor="Excelente"
                icono="🚀"
                formatearValor={false}
                colorTexto="text-blue-600"
              />
            </div>
          </div>
        )}

        {/* Footer Premium */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Sistema Operativo</span>
              </div>
              <div className="text-sm text-gray-500">
                AIKZ Industrial Management System v2.0
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Última sincronización: {new Date().toLocaleString('es-MX')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanciero;