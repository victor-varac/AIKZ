import { supabase } from '../supabase';

// =====================================================
// KPIS FINANCIEROS PRINCIPALES
// =====================================================

export const getKPIsFinancieros = async (periodo = {}) => {
  try {
    const { fechaInicio, fechaFin } = periodo;
    const hoy = new Date().toISOString().split('T')[0];

    // Construir filtros de fecha
    let filtroInicio = fechaInicio || '2024-01-01';
    let filtroFin = fechaFin || hoy;

    // Obtener ingresos totales (usando la estructura real de la vista)
    const { data: ingresos } = await supabase
      .from('reporte_ingresos_mensual')
      .select('total')
      .filter('fecha', 'gte', filtroInicio)
      .filter('fecha', 'lte', filtroFin);

    // Obtener egresos de compras
    const { data: egresosCompras } = await supabase
      .from('reporte_egresos_compras_mensual')
      .select('total')
      .filter('fecha', 'gte', filtroInicio)
      .filter('fecha', 'lte', filtroFin);

    // Obtener gastos operativos
    const { data: gastosOperativos } = await supabase
      .from('reporte_gastos_operativos_mensual')
      .select('importe')
      .filter('fecha', 'gte', filtroInicio)
      .filter('fecha', 'lte', filtroFin);

    // Obtener cuentas por cobrar
    const { data: cuentasPorCobrar } = await supabase
      .from('reporte_cuentas_por_cobrar')
      .select('saldo_pendiente, estado_cuenta');

    // Obtener cuentas por pagar
    const { data: cuentasPorPagar } = await supabase
      .from('reporte_cuentas_por_pagar')
      .select('monto_factura, estado_cuenta');

    // Calcular métricas básicas
    const totalIngresos = ingresos?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const totalEgresosCompras = egresosCompras?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const totalGastosOperativos = gastosOperativos?.reduce((sum, item) => sum + (item.importe || 0), 0) || 0;
    const totalEgresos = totalEgresosCompras + totalGastosOperativos;

    const utilidadBruta = totalIngresos - totalEgresos;
    const margenUtilidad = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;

    const totalPorCobrar = cuentasPorCobrar?.reduce((sum, item) =>
      sum + (item.estado_cuenta !== 'PAGADA' ? item.saldo_pendiente || 0 : 0), 0) || 0;

    const totalPorPagar = cuentasPorPagar?.reduce((sum, item) =>
      sum + (item.estado_cuenta !== 'PAGADA' ? item.monto_factura || 0 : 0), 0) || 0;

    const flujoEfectivo = totalPorCobrar - totalPorPagar;

    return {
      ingresos: totalIngresos,
      egresos: totalEgresos,
      utilidadBruta: utilidadBruta,
      margenUtilidad: margenUtilidad,
      cuentasPorCobrar: totalPorCobrar,
      cuentasPorPagar: totalPorPagar,
      flujoEfectivo: flujoEfectivo,
      liquidez: totalPorPagar > 0 ? totalPorCobrar / totalPorPagar : 0
    };
  } catch (error) {
    console.error('Error al obtener KPIs financieros:', error);
    // Retornar datos por defecto en caso de error
    return {
      ingresos: 0,
      egresos: 0,
      utilidadBruta: 0,
      margenUtilidad: 0,
      cuentasPorCobrar: 0,
      cuentasPorPagar: 0,
      flujoEfectivo: 0,
      liquidez: 0
    };
  }
};

// =====================================================
// TENDENCIAS MENSUALES AVANZADAS
// =====================================================

export const getTendenciasMensuales = async (mesesAtras = 12) => {
  try {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras);
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

    // Obtener ingresos mensuales
    const { data: ingresosMensuales } = await supabase
      .from('reporte_ingresos_mensual')
      .select('año, mes, total')
      .filter('fecha', 'gte', fechaInicioStr)
      .order('año', { ascending: true })
      .order('mes', { ascending: true });

    // Obtener egresos mensuales
    const { data: egresosMensuales } = await supabase
      .from('reporte_egresos_compras_mensual')
      .select('año, mes, total')
      .filter('fecha', 'gte', fechaInicioStr)
      .order('año', { ascending: true })
      .order('mes', { ascending: true });

    // Obtener gastos operativos mensuales
    const { data: gastosMensuales } = await supabase
      .from('reporte_gastos_operativos_mensual')
      .select('año, mes, importe')
      .filter('fecha', 'gte', fechaInicioStr)
      .order('año', { ascending: true })
      .order('mes', { ascending: true });

    // Agrupar datos por mes/año
    const tendencias = {};

    // Procesar ingresos
    ingresosMensuales?.forEach(item => {
      const key = `${item.año}-${String(item.mes).padStart(2, '0')}`;
      if (!tendencias[key]) {
        tendencias[key] = { periodo: key, ingresos: 0, egresos: 0, gastos: 0 };
      }
      tendencias[key].ingresos += item.total || 0;
    });

    // Procesar egresos de compras
    egresosMensuales?.forEach(item => {
      const key = `${item.año}-${String(item.mes).padStart(2, '0')}`;
      if (!tendencias[key]) {
        tendencias[key] = { periodo: key, ingresos: 0, egresos: 0, gastos: 0 };
      }
      tendencias[key].egresos += item.total || 0;
    });

    // Procesar gastos operativos
    gastosMensuales?.forEach(item => {
      const key = `${item.año}-${String(item.mes).padStart(2, '0')}`;
      if (!tendencias[key]) {
        tendencias[key] = { periodo: key, ingresos: 0, egresos: 0, gastos: 0 };
      }
      tendencias[key].gastos += item.importe || 0;
    });

    // Convertir a array y calcular utilidad
    return Object.values(tendencias).map(item => ({
      ...item,
      utilidad: item.ingresos - item.egresos - item.gastos,
      margen: item.ingresos > 0 ? ((item.ingresos - item.egresos - item.gastos) / item.ingresos * 100) : 0
    })).sort((a, b) => a.periodo.localeCompare(b.periodo));

  } catch (error) {
    console.error('Error al obtener tendencias mensuales:', error);
    return [];
  }
};

// =====================================================
// DATOS EN TIEMPO REAL (TABLAS REALES)
// =====================================================

export const getDatosEnTiempoReal = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Datos del día actual - ventas
    const { data: ventasHoy } = await supabase
      .from('reporte_ingresos_mensual')
      .select('total')
      .filter('fecha', 'eq', hoy);

    // Datos del día actual - gastos
    const { data: gastosHoy } = await supabase
      .from('reporte_gastos_operativos_mensual')
      .select('importe')
      .filter('fecha', 'eq', hoy);

    // Datos del mes actual - ventas
    const { data: ventasMes } = await supabase
      .from('reporte_ingresos_mensual')
      .select('total')
      .filter('fecha', 'gte', inicioMes)
      .filter('fecha', 'lte', hoy);

    // Datos del mes actual - gastos
    const { data: gastosMes } = await supabase
      .from('reporte_gastos_operativos_mensual')
      .select('importe')
      .filter('fecha', 'gte', inicioMes)
      .filter('fecha', 'lte', hoy);

    // Producción del día actual
    const [celofanHoy, polietilenoHoy] = await Promise.all([
      supabase.from('produccion_celofan')
        .select('millares')
        .filter('fecha', 'eq', hoy),
      supabase.from('produccion_polietileno')
        .select('kilos')
        .filter('fecha', 'eq', hoy)
    ]);

    // Calcular totales
    const ventasHoyTotal = ventasHoy?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
    const gastosHoyTotal = gastosHoy?.reduce((sum, g) => sum + (g.importe || 0), 0) || 0;
    const ventasMesTotal = ventasMes?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
    const gastosMesTotal = gastosMes?.reduce((sum, g) => sum + (g.importe || 0), 0) || 0;

    const celofanProducidoHoy = celofanHoy.data?.reduce((sum, p) => sum + (p.millares || 0), 0) || 0;
    const polietilenoProducidoHoy = polietilenoHoy.data?.reduce((sum, p) => sum + (p.kilos || 0), 0) || 0;

    const diasMes = new Date().getDate();

    return {
      hoy: {
        ventas: ventasHoyTotal,
        gastos: gastosHoyTotal,
        utilidad: ventasHoyTotal - gastosHoyTotal,
        produccionCelofan: celofanProducidoHoy,
        produccionPolietileno: polietilenoProducidoHoy
      },
      mes: {
        ventas: ventasMesTotal,
        gastos: gastosMesTotal,
        utilidad: ventasMesTotal - gastosMesTotal,
        diasTranscurridos: diasMes,
        promedioVentasDiarias: diasMes > 0 ? ventasMesTotal / diasMes : 0
      },
      ultimaActualizacion: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error al obtener datos en tiempo real:', error);
    return {
      hoy: { ventas: 0, gastos: 0, utilidad: 0, produccionCelofan: 0, produccionPolietileno: 0 },
      mes: { ventas: 0, gastos: 0, utilidad: 0, diasTranscurridos: 1, promedioVentasDiarias: 0 },
      ultimaActualizacion: new Date().toISOString()
    };
  }
};

// =====================================================
// ANÁLISIS DE CLIENTES TOP
// =====================================================

export const getTopClientes = async (limite = 10, periodo = {}) => {
  try {
    let query = supabase
      .from('reporte_ingresos_mensual')
      .select('nombre_cliente, total');

    if (periodo.fechaInicio) {
      query = query.filter('fecha', 'gte', periodo.fechaInicio);
    }

    if (periodo.fechaFin) {
      query = query.filter('fecha', 'lte', periodo.fechaFin);
    }

    const { data } = await query;

    // Agrupar por cliente
    const clientesAgrupados = {};
    data?.forEach(item => {
      const cliente = item.nombre_cliente || 'Sin Nombre';
      if (!clientesAgrupados[cliente]) {
        clientesAgrupados[cliente] = 0;
      }
      clientesAgrupados[cliente] += item.total || 0;
    });

    // Convertir a array y ordenar
    return Object.entries(clientesAgrupados)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limite);

  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    return [];
  }
};

// =====================================================
// ANÁLISIS DE GASTOS POR CATEGORÍA
// =====================================================

export const getGastosPorCategoria = async (periodo = {}) => {
  try {
    let query = supabase
      .from('reporte_gastos_operativos_mensual')
      .select('categoria, importe');

    if (periodo.fechaInicio) {
      query = query.filter('fecha', 'gte', periodo.fechaInicio);
    }

    if (periodo.fechaFin) {
      query = query.filter('fecha', 'lte', periodo.fechaFin);
    }

    const { data } = await query;

    // Agrupar por categoría
    const categoriasAgrupadas = {};
    data?.forEach(item => {
      const categoria = item.categoria || 'Sin Categoría';
      if (!categoriasAgrupadas[categoria]) {
        categoriasAgrupadas[categoria] = 0;
      }
      categoriasAgrupadas[categoria] += item.importe || 0;
    });

    const total = Object.values(categoriasAgrupadas).reduce((sum, val) => sum + val, 0);

    // Convertir a array con porcentajes
    return Object.entries(categoriasAgrupadas)
      .map(([categoria, monto]) => ({
        categoria,
        monto,
        porcentaje: total > 0 ? ((monto / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.monto - a.monto);

  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    return [];
  }
};

// =====================================================
// ESTADO DE CUENTAS POR COBRAR Y PAGAR
// =====================================================

export const getEstadoCuentas = async () => {
  try {
    const [cuentasPorCobrar, cuentasPorPagar] = await Promise.all([
      supabase.from('reporte_cuentas_por_cobrar').select('*'),
      supabase.from('reporte_cuentas_por_pagar').select('*')
    ]);

    // Análisis de cuentas por cobrar
    const cxc = cuentasPorCobrar.data || [];
    const resumenCxC = {
      total: cxc.length,
      vigentes: cxc.filter(c => c.estado_cuenta === 'VIGENTE').length,
      vencidas: cxc.filter(c => c.estado_cuenta === 'VENCIDA').length,
      montoTotal: cxc.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0),
      montoVencido: cxc.filter(c => c.estado_cuenta === 'VENCIDA')
        .reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    };

    // Análisis de cuentas por pagar
    const cxp = cuentasPorPagar.data || [];
    const resumenCxP = {
      total: cxp.length,
      vigentes: cxp.filter(c => c.estado_cuenta === 'VIGENTE').length,
      vencidas: cxp.filter(c => c.estado_cuenta === 'VENCIDA').length,
      montoTotal: cxp.reduce((sum, c) => sum + (c.monto_factura || 0), 0),
      montoVencido: cxp.filter(c => c.estado_cuenta === 'VENCIDA')
        .reduce((sum, c) => sum + (c.monto_factura || 0), 0)
    };

    return {
      cuentasPorCobrar: resumenCxC,
      cuentasPorPagar: resumenCxP,
      flujoNeto: resumenCxC.montoTotal - resumenCxP.montoTotal
    };

  } catch (error) {
    console.error('Error al obtener estado de cuentas:', error);
    return {
      cuentasPorCobrar: {
        total: 0,
        vigentes: 0,
        vencidas: 0,
        montoTotal: 0,
        montoVencido: 0
      },
      cuentasPorPagar: {
        total: 0,
        vigentes: 0,
        vencidas: 0,
        montoTotal: 0,
        montoVencido: 0
      },
      flujoNeto: 0
    };
  }
};

// =====================================================
// ALERTAS FINANCIERAS INTELIGENTES
// =====================================================

export const getAlertasFinancieras = async () => {
  try {
    const [cuentasPorCobrar, cuentasPorPagar, inventarios, kpis] = await Promise.all([
      supabase.from('reporte_cuentas_por_cobrar').select('*'),
      supabase.from('reporte_cuentas_por_pagar').select('*'),
      getAnalisisInventarios(),
      getKPIsFinancieros()
    ]);

    const alertas = [];

    // Alertas de cuentas por cobrar vencidas
    const cxcVencidas = cuentasPorCobrar.data?.filter(c => c.estado_cuenta === 'VENCIDA') || [];
    if (cxcVencidas.length > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Cuentas por Cobrar Vencidas',
        mensaje: `${cxcVencidas.length} facturas vencidas por cobrar`,
        monto: cxcVencidas.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0),
        prioridad: 'alta',
        icono: '💸',
        area: 'cobranza'
      });
    }

    // Alertas de cuentas por pagar vencidas
    const cxpVencidas = cuentasPorPagar.data?.filter(c => c.estado_cuenta === 'VENCIDA') || [];
    if (cxpVencidas.length > 0) {
      alertas.push({
        tipo: 'error',
        titulo: 'Cuentas por Pagar Vencidas',
        mensaje: `${cxpVencidas.length} facturas vencidas por pagar`,
        monto: cxpVencidas.reduce((sum, c) => sum + (c.monto_factura || 0), 0),
        prioridad: 'critica',
        icono: '🚨',
        area: 'pagos'
      });
    }

    // Alertas de facturas próximas a vencer (próximos 7 días)
    const proximosAVencer = cuentasPorPagar.data?.filter(c => {
      if (c.estado_cuenta !== 'VIGENTE') return false;
      const fechaVencimiento = new Date(c.fecha_vencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes >= 0;
    }) || [];

    if (proximosAVencer.length > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Próximos Vencimientos',
        mensaje: `${proximosAVencer.length} facturas vencen en los próximos 7 días`,
        monto: proximosAVencer.reduce((sum, c) => sum + (c.monto_factura || 0), 0),
        prioridad: 'media',
        icono: '⏰',
        area: 'pagos'
      });
    }

    // Alertas de liquidez baja
    const ratioLiquidez = kpis.cuentasPorPagar > 0 ? kpis.cuentasPorCobrar / kpis.cuentasPorPagar : 0;
    if (ratioLiquidez < 1.0 && kpis.cuentasPorPagar > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Liquidez Comprometida',
        mensaje: `Ratio de liquidez: ${ratioLiquidez.toFixed(2)} (recomendado: >1.2)`,
        prioridad: 'alta',
        icono: '💧',
        area: 'liquidez'
      });
    }

    // Alertas de margen bajo
    if (kpis.margenUtilidad < 10 && kpis.ingresos > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Margen de Utilidad Bajo',
        mensaje: `Margen actual: ${kpis.margenUtilidad.toFixed(1)}% (mínimo recomendado: 10%)`,
        prioridad: 'alta',
        icono: '📉',
        area: 'rentabilidad'
      });
    }

    // Alertas de inventario con stock bajo
    if (inventarios.alertas.stockBajo > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Stock Bajo Detectado',
        mensaje: `${inventarios.alertas.stockBajo} materias primas con stock por debajo del mínimo`,
        prioridad: 'media',
        icono: '📦',
        area: 'inventario'
      });
    }

    // Oportunidades (alertas positivas)
    if (kpis.margenUtilidad > 20 && ratioLiquidez > 1.5) {
      alertas.push({
        tipo: 'success',
        titulo: 'Oportunidad de Crecimiento',
        mensaje: 'Excelente posición financiera para considerar expansión o inversión',
        prioridad: 'baja',
        icono: '🚀',
        area: 'oportunidad'
      });
    }

    return alertas.sort((a, b) => {
      const prioridadOrder = { 'critica': 3, 'alta': 2, 'media': 1, 'baja': 0 };
      return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
    });

  } catch (error) {
    console.error('Error al obtener alertas financieras:', error);
    return [];
  }
};

// =====================================================
// RESUMEN EJECUTIVO
// =====================================================

export const getResumenEjecutivo = async (periodo = {}) => {
  try {
    const [kpis, tendencias, estadoCuentas, alertas, produccion, indicadoresSalud] = await Promise.all([
      getKPIsFinancieros(periodo),
      getTendenciasMensuales(6),
      getEstadoCuentas(),
      getAlertasFinancieras(),
      getDatosProduccion(periodo),
      getIndicadoresSalud()
    ]);

    // Calcular crecimiento respecto al mes anterior
    const ultimosMeses = tendencias.slice(-2);
    const crecimientoIngresos = ultimosMeses.length === 2 && ultimosMeses[0].ingresos > 0 ?
      ((ultimosMeses[1].ingresos - ultimosMeses[0].ingresos) / ultimosMeses[0].ingresos * 100) : 0;

    return {
      kpis,
      crecimientoIngresos,
      estadoCuentas,
      alertas: alertas.slice(0, 6), // Máximo 6 alertas
      produccion,
      scoreEmpresarial: indicadoresSalud.scoreGeneral,
      ultimaActualizacion: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error al obtener resumen ejecutivo:', error);
    return {
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
      alertas: [],
      scoreEmpresarial: 0,
      ultimaActualizacion: new Date().toISOString()
    };
  }
};

// =====================================================
// DATOS DE PRODUCCIÓN INDUSTRIAL (TABLAS REALES)
// =====================================================

export const getDatosProduccion = async (periodo = {}) => {
  try {
    const { fechaInicio, fechaFin } = periodo;
    const hoy = new Date().toISOString().split('T')[0];
    let filtroInicio = fechaInicio || '2024-01-01';
    let filtroFin = fechaFin || hoy;

    // Obtener datos reales de producción de celofán
    const { data: celofanData } = await supabase
      .from('produccion_celofan')
      .select('millares')
      .filter('fecha', 'gte', filtroInicio)
      .filter('fecha', 'lte', filtroFin);

    // Obtener datos reales de producción de polietileno
    const { data: polietilenoData } = await supabase
      .from('produccion_polietileno')
      .select('kilos')
      .filter('fecha', 'gte', filtroInicio)
      .filter('fecha', 'lte', filtroFin);

    // Obtener inventarios actuales usando las vistas reales
    const [inventarioCelofan, inventarioPolietileno] = await Promise.all([
      supabase.from('vista_inventario_celofan').select('stock_cares'),
      supabase.from('vista_inventario_polietileno').select('stock_kilos')
    ]);

    // Calcular totales de producción
    const totalCelofan = celofanData?.reduce((sum, item) => sum + (item.millares || 0), 0) || 0;
    const totalPolietileno = polietilenoData?.reduce((sum, item) => sum + (item.kilos || 0), 0) || 0;

    // Calcular inventarios totales
    const inventarioTotalCelofan = inventarioCelofan.data?.reduce((sum, item) => sum + (item.stock_cares || 0), 0) || 0;
    const inventarioTotalPolietileno = inventarioPolietileno.data?.reduce((sum, item) => sum + (item.stock_kilos || 0), 0) || 0;

    return {
      celofan: {
        producido: totalCelofan,
        inventario: inventarioTotalCelofan
      },
      polietileno: {
        producido: totalPolietileno,
        inventario: inventarioTotalPolietileno
      },
      consolidado: {
        totalProduccion: totalCelofan + totalPolietileno,
        totalInventario: inventarioTotalCelofan + inventarioTotalPolietileno
      }
    };

  } catch (error) {
    console.error('Error al obtener datos de producción:', error);
    return {
      celofan: { producido: 0, inventario: 0 },
      polietileno: { producido: 0, inventario: 0 },
      consolidado: { totalProduccion: 0, totalInventario: 0 }
    };
  }
};

// =====================================================
// ANÁLISIS DE INVENTARIOS (VISTAS REALES)
// =====================================================

export const getAnalisisInventarios = async () => {
  try {
    // Usar las vistas reales de inventario
    const [inventarioMP, inventarioCelofan, inventarioPolietileno] = await Promise.all([
      supabase.from('vista_inventario_materia_prima').select('*'),
      supabase.from('vista_inventario_celofan').select('*'),
      supabase.from('vista_inventario_polietileno').select('*')
    ]);

    const materiaPrima = inventarioMP.data || [];
    const celofan = inventarioCelofan.data || [];
    const polietileno = inventarioPolietileno.data || [];

    // Identificar productos con stock bajo
    const stockBajo = materiaPrima.filter(item => item.estado_stock === 'BAJO');

    return {
      materiaPrima: {
        items: materiaPrima.length,
        stockBajo: stockBajo.length,
        itemsStockBajo: stockBajo
      },
      productoTerminado: {
        celofan: celofan.length,
        polietileno: polietileno.length
      },
      alertas: {
        stockBajo: stockBajo.length,
        itemsStockBajo: stockBajo
      }
    };

  } catch (error) {
    console.error('Error al obtener análisis de inventarios:', error);
    return {
      materiaPrima: { items: 0, stockBajo: 0, itemsStockBajo: [] },
      productoTerminado: { celofan: 0, polietileno: 0 },
      alertas: { stockBajo: 0, itemsStockBajo: [] }
    };
  }
};

// =====================================================
// ANÁLISIS DE PROVEEDORES (TABLAS REALES)
// =====================================================

export const getAnalisisProveedores = async (periodo = {}) => {
  try {
    let query = supabase
      .from('compras')
      .select(`
        proveedor_id,
        total,
        fecha,
        proveedores (nombre)
      `);

    if (periodo.fechaInicio) {
      query = query.filter('fecha', 'gte', periodo.fechaInicio);
    }
    if (periodo.fechaFin) {
      query = query.filter('fecha', 'lte', periodo.fechaFin);
    }

    const { data: compras } = await query;

    // Agrupar por proveedor
    const proveedoresData = {};
    compras?.forEach(compra => {
      const proveedorId = compra.proveedor_id;
      if (!proveedoresData[proveedorId]) {
        proveedoresData[proveedorId] = {
          nombre: compra.proveedores?.nombre || 'Sin nombre',
          totalCompras: 0,
          numeroTransacciones: 0
        };
      }
      proveedoresData[proveedorId].totalCompras += compra.total || 0;
      proveedoresData[proveedorId].numeroTransacciones += 1;
    });

    // Convertir a array y ordenar
    const topProveedores = Object.values(proveedoresData)
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 10);

    return {
      topProveedores,
      totalProveedores: topProveedores.length
    };

  } catch (error) {
    console.error('Error al obtener análisis de proveedores:', error);
    return { topProveedores: [], totalProveedores: 0 };
  }
};

// =====================================================
// INDICADORES DE SALUD EMPRESARIAL
// =====================================================

export const getIndicadoresSalud = async () => {
  try {
    const [kpis, inventarios] = await Promise.all([
      getKPIsFinancieros(),
      getAnalisisInventarios()
    ]);

    // Calcular indicadores de salud basados en datos reales
    const liquidez = kpis.cuentasPorPagar > 0 ? kpis.cuentasPorCobrar / kpis.cuentasPorPagar : 0;
    const rentabilidad = kpis.margenUtilidad;
    const eficienciaOperativa = kpis.ingresos > 0 ? ((kpis.ingresos - kpis.egresos) / kpis.ingresos * 100) : 0;

    // Score general basado solo en datos financieros reales
    let scoreGeneral = 0;
    let factores = 3;

    // Factor liquidez (33%)
    if (liquidez >= 1.5) scoreGeneral += 33;
    else if (liquidez >= 1.0) scoreGeneral += 25;
    else if (liquidez >= 0.5) scoreGeneral += 15;
    else scoreGeneral += 5;

    // Factor rentabilidad (33%)
    if (rentabilidad >= 20) scoreGeneral += 33;
    else if (rentabilidad >= 10) scoreGeneral += 25;
    else if (rentabilidad >= 5) scoreGeneral += 15;
    else scoreGeneral += 5;

    // Factor eficiencia operativa (34%)
    if (eficienciaOperativa >= 25) scoreGeneral += 34;
    else if (eficienciaOperativa >= 15) scoreGeneral += 25;
    else if (eficienciaOperativa >= 5) scoreGeneral += 15;
    else scoreGeneral += 5;

    return {
      scoreGeneral: Math.round(scoreGeneral),
      indicadores: {
        liquidez: {
          valor: liquidez.toFixed(2),
          estado: liquidez >= 1.5 ? 'excelente' : liquidez >= 1.0 ? 'bueno' : 'critico'
        },
        rentabilidad: {
          valor: rentabilidad.toFixed(1),
          estado: rentabilidad >= 20 ? 'excelente' : rentabilidad >= 10 ? 'bueno' : 'critico'
        },
        eficienciaOperativa: {
          valor: eficienciaOperativa.toFixed(1),
          estado: eficienciaOperativa >= 25 ? 'excelente' : eficienciaOperativa >= 15 ? 'bueno' : 'critico'
        }
      },
      recomendaciones: generarRecomendaciones(Math.round(scoreGeneral), {
        liquidez,
        rentabilidad,
        eficienciaOperativa
      })
    };

  } catch (error) {
    console.error('Error al obtener indicadores de salud:', error);
    return {
      scoreGeneral: 0,
      indicadores: {
        liquidez: { valor: '0.00', estado: 'critico' },
        rentabilidad: { valor: '0.0', estado: 'critico' },
        eficienciaOperativa: { valor: '0.0', estado: 'critico' }
      },
      recomendaciones: []
    };
  }
};

// =====================================================
// GENERADOR DE RECOMENDACIONES
// =====================================================

const generarRecomendaciones = (score, indicadores) => {
  const recomendaciones = [];

  if (indicadores.liquidez < 1.0) {
    recomendaciones.push({
      tipo: 'urgente',
      area: 'Liquidez',
      titulo: 'Mejorar flujo de efectivo',
      descripcion: 'Acelerar cobranza y gestionar mejor los pagos a proveedores'
    });
  }

  if (indicadores.rentabilidad < 10) {
    recomendaciones.push({
      tipo: 'importante',
      area: 'Rentabilidad',
      titulo: 'Optimizar márgenes',
      descripcion: 'Revisar estructura de costos y precios de venta'
    });
  }

  if (indicadores.eficienciaOperativa < 15) {
    recomendaciones.push({
      tipo: 'mejora',
      area: 'Operaciones',
      titulo: 'Optimizar procesos operativos',
      descripcion: 'Reducir costos operativos y mejorar eficiencia'
    });
  }

  if (score >= 75) {
    recomendaciones.push({
      tipo: 'crecimiento',
      area: 'Expansión',
      titulo: 'Considerar crecimiento',
      descripcion: 'Buena posición financiera para invertir en expansión'
    });
  }

  return recomendaciones;
};

// =====================================================
// UTILIDADES
// =====================================================

export const exportarDashboard = async (datos, formato = 'excel') => {
  try {
    // TODO: Implementar exportación real
    console.log(`Exportando dashboard en formato ${formato}:`, datos);

    return {
      success: true,
      url: `#export-dashboard-${formato}`,
      mensaje: `Dashboard exportado exitosamente en formato ${formato}`
    };
  } catch (error) {
    throw error;
  }
};