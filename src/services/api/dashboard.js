import { supabase } from '../supabase';

// Función principal para obtener todos los datos del dashboard
export const getDashboardData = async (temporalidad = 'mensual') => {
  try {
    const [
      kpis,
      salesChart,
      inventory,
      recentOrders,
      topClients,
      vendedores,
      estadisticasRapidas
    ] = await Promise.all([
      getKPIs(),
      getSalesChartData(temporalidad),
      getInventoryStatus(),
      getRecentOrders(),
      getTopClients(),
      getVendedorPerformance(),
      getEstadisticasRapidas()
    ]);

    return {
      kpis,
      salesChart,
      inventory,
      recentOrders,
      topClients,
      vendedores,
      estadisticasRapidas
    };
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    throw error;
  }
};

// KPIs principales
export const getKPIs = async () => {
  try {
    // Ventas del mes actual
    const fechaInicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const fechaFinMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    // Ventas del mes anterior para comparación
    const fechaInicioMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
    const fechaFinMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString();

    // Obtener ventas del mes actual
    const { data: ventasMesActual, error: errorVentasActual } = await supabase
      .from('notas_venta')
      .select('total')
      .gte('fecha', fechaInicioMes)
      .lte('fecha', fechaFinMes);

    if (errorVentasActual) throw errorVentasActual;

    // Obtener ventas del mes anterior
    const { data: ventasMesAnterior, error: errorVentasAnterior } = await supabase
      .from('notas_venta')
      .select('total')
      .gte('fecha', fechaInicioMesAnterior)
      .lte('fecha', fechaFinMesAnterior);

    if (errorVentasAnterior) throw errorVentasAnterior;

    // Calcular totales
    const ventasDelMes = ventasMesActual?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
    const ventasDelMesAnterior = ventasMesAnterior?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;

    // Calcular cambio porcentual
    const cambioVentas = ventasDelMesAnterior > 0
      ? ((ventasDelMes - ventasDelMesAnterior) / ventasDelMesAnterior) * 100
      : 0;

    // Órdenes activas (notas de venta con entregas pendientes)
    const { data: ordenesActivas, error: errorOrdenes } = await supabase
      .from('notas_venta')
      .select(`
        id,
        pedidos (
          id,
          cantidad,
          entregas (
            id,
            cantidad
          )
        )
      `);

    if (errorOrdenes) throw errorOrdenes;

    let contadorOrdenesActivas = 0;
    ordenesActivas?.forEach(nota => {
      if (nota.pedidos?.some(pedido => {
        const totalPedido = pedido.cantidad || 0;
        const totalEntregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
        return totalEntregado < totalPedido;
      })) {
        contadorOrdenesActivas++;
      }
    });

    // Stock crítico (productos con inventario bajo)
    const { data: inventarioCelofan, error: errorCelofan } = await supabase
      .from('vista_inventario_celofan')
      .select('*')
      .lt('stock_cares', 1000); // Menos de 1000 millares es crítico

    const { data: inventarioPolietileno, error: errorPolietileno } = await supabase
      .from('vista_inventario_polietileno')
      .select('*')
      .lt('stock_kilos', 100); // Menos de 100 kg es crítico

    if (errorCelofan) throw errorCelofan;
    if (errorPolietileno) throw errorPolietileno;

    const stockCritico = (inventarioCelofan?.length || 0) + (inventarioPolietileno?.length || 0);

    // Clientes activos (que han comprado en los últimos 3 meses)
    const fechaTresMesesAtras = new Date();
    fechaTresMesesAtras.setMonth(fechaTresMesesAtras.getMonth() - 3);

    const { data: clientesActivos, error: errorClientes } = await supabase
      .from('notas_venta')
      .select('clientes_id')
      .gte('fecha', fechaTresMesesAtras.toISOString())
      .not('clientes_id', 'is', null);

    if (errorClientes) throw errorClientes;

    // Contar clientes únicos
    const clientesUnicos = new Set(clientesActivos?.map(nota => nota.clientes_id) || []).size;

    return {
      ventasDelMes,
      cambioVentas: Math.round(cambioVentas),
      ordenesActivas: contadorOrdenesActivas,
      cambioOrdenes: 0, // Por implementar comparación con mes anterior
      stockCritico,
      cambioStock: 0, // Por implementar comparación con mes anterior
      clientesActivos: clientesUnicos,
      cambioClientes: 0 // Por implementar comparación con mes anterior
    };

  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    throw error;
  }
};

// Datos para gráfico de ventas con diferentes temporalidades
export const getSalesChartData = async (temporalidad = 'mensual') => {
  try {
    const fechaActual = new Date();
    const datos = [];

    switch (temporalidad) {
      case 'diaria':
        // Obtener datos de los últimos 7 días (lunes a domingo)
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        for (let i = 6; i >= 0; i--) {
          const fecha = new Date(fechaActual);
          fecha.setDate(fecha.getDate() - i);

          const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).toISOString();
          const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59).toISOString();

          const { data: ventas, error } = await supabase
            .from('notas_venta')
            .select('total')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin);

          if (error) throw error;

          const totalVentas = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
          const diaSemana = diasSemana[fecha.getDay()];

          datos.push({
            periodo: diaSemana,
            ventas: totalVentas,
            label: diaSemana
          });
        }
        break;

      case 'semanal':
        // Obtener datos de lunes a domingo de las últimas 8 semanas
        for (let i = 7; i >= 0; i--) {
          // Calcular el lunes de la semana
          const fechaActualSemana = new Date(fechaActual);
          fechaActualSemana.setDate(fechaActualSemana.getDate() - (fechaActualSemana.getDay() - 1)); // Ir al lunes de la semana actual
          fechaActualSemana.setDate(fechaActualSemana.getDate() - (i * 7)); // Retroceder i semanas

          const fechaInicio = new Date(fechaActualSemana); // Lunes
          const fechaFin = new Date(fechaActualSemana);
          fechaFin.setDate(fechaFin.getDate() + 6); // Domingo (lunes + 6 días = domingo)

          const { data: ventas, error } = await supabase
            .from('notas_venta')
            .select('total')
            .gte('fecha', fechaInicio.toISOString())
            .lte('fecha', fechaFin.toISOString());

          if (error) throw error;

          const totalVentas = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
          const semana = 8 - i;

          datos.push({
            periodo: `S${semana}`,
            ventas: totalVentas,
            label: `Sem ${semana}`
          });
        }
        break;

      case 'trimestral':
        // Obtener datos de los últimos 4 trimestres
        for (let i = 3; i >= 0; i--) {
          const fechaFinTrimestre = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - (i * 3) + 1, 0);
          const fechaInicioTrimestre = new Date(fechaFinTrimestre.getFullYear(), fechaFinTrimestre.getMonth() - 2, 1);

          const { data: ventas, error } = await supabase
            .from('notas_venta')
            .select('total')
            .gte('fecha', fechaInicioTrimestre.toISOString())
            .lte('fecha', fechaFinTrimestre.toISOString());

          if (error) throw error;

          const totalVentas = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
          const trimestre = Math.floor((fechaFinTrimestre.getMonth()) / 3) + 1;

          datos.push({
            periodo: `Q${trimestre}`,
            ventas: totalVentas,
            label: `Q${trimestre}`
          });
        }
        break;

      case 'anual':
        // Obtener datos de los últimos 5 años
        for (let i = 4; i >= 0; i--) {
          const año = fechaActual.getFullYear() - i;
          const fechaInicio = new Date(año, 0, 1).toISOString(); // 1 de enero
          const fechaFin = new Date(año, 11, 31).toISOString();   // 31 de diciembre

          const { data: ventas, error } = await supabase
            .from('notas_venta')
            .select('total')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin);

          if (error) throw error;

          const totalVentas = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;

          datos.push({
            periodo: año.toString(),
            ventas: totalVentas,
            label: año.toString()
          });
        }
        break;

      default: // mensual
        // Obtener datos de enero a diciembre del año actual
        for (let mes = 0; mes < 12; mes++) {
          const fechaInicio = new Date(fechaActual.getFullYear(), mes, 1).toISOString();
          const fechaFin = new Date(fechaActual.getFullYear(), mes + 1, 0).toISOString();

          const { data: ventas, error } = await supabase
            .from('notas_venta')
            .select('total')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin);

          if (error) throw error;

          const totalVentas = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
          const fecha = new Date(fechaActual.getFullYear(), mes, 1);

          datos.push({
            periodo: fecha.toLocaleDateString('es-MX', { month: 'short' }),
            ventas: totalVentas,
            label: fecha.toLocaleDateString('es-MX', { month: 'short' })
          });
        }
        break;
    }

    return datos;
  } catch (error) {
    console.error('Error al obtener datos del gráfico de ventas:', error);
    throw error;
  }
};

// Estado del inventario
export const getInventoryStatus = async () => {
  try {
    // Inventario de celofán
    const { data: celofan, error: errorCelofan } = await supabase
      .from('vista_inventario_celofan')
      .select('*');

    // Inventario de polietileno
    const { data: polietileno, error: errorPolietileno } = await supabase
      .from('vista_inventario_polietileno')
      .select('*');

    if (errorCelofan) throw errorCelofan;
    if (errorPolietileno) throw errorPolietileno;

    // Calcular totales y productos críticos
    const celofanStats = {
      stock: celofan?.reduce((sum, item) => sum + (item.stock_cares || 0), 0) || 0,
      productos: celofan?.length || 0,
      criticos: celofan?.filter(item => (item.stock_cares || 0) < 1000).length || 0
    };

    const polietilenoStats = {
      stock: polietileno?.reduce((sum, item) => sum + (item.stock_kilos || 0), 0) || 0,
      productos: polietileno?.length || 0,
      criticos: polietileno?.filter(item => (item.stock_kilos || 0) < 100).length || 0
    };

    // Obtener entregas pendientes reales
    const { data: notasConPedidos, error: errorEntregas } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        clientes(empresa),
        pedidos(
          id,
          cantidad,
          productos(material),
          entregas(cantidad)
        )
      `)
      .order('fecha', { ascending: false })
      .limit(50);

    if (errorEntregas) {
      console.log('Error obteniendo entregas, usando datos simulados:', errorEntregas);
      // Fallback a datos simulados si hay error
      const pendientes = [];
      return {
        celofan: celofanStats,
        polietileno: polietilenoStats,
        entregasPendientes: pendientes
      };
    }

    // Procesar entregas pendientes
    const pendientes = [];
    notasConPedidos?.forEach(nota => {
      nota.pedidos?.forEach(pedido => {
        const totalPedido = pedido.cantidad || 0;
        const totalEntregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
        const pendiente = totalPedido - totalEntregado;

        if (pendiente > 0) {
          const diasPendiente = Math.floor((new Date() - new Date(nota.fecha)) / (1000 * 60 * 60 * 24));

          pendientes.push({
            numero_factura: nota.numero_factura || 'Sin número',
            cliente: nota.clientes?.empresa || 'Sin empresa',
            cantidad: pendiente,
            unidad: pedido.productos?.material === 'celofan' ? 'millares' : 'kg',
            dias_pendiente: diasPendiente
          });
        }
      });
    });

    return {
      celofan: celofanStats,
      polietileno: polietilenoStats,
      entregasPendientes: pendientes.slice(0, 10) // Limitar a 10
    };

  } catch (error) {
    console.error('Error al obtener estado del inventario:', error);
    throw error;
  }
};

// Pedidos recientes
export const getRecentOrders = async () => {
  try {
    // Obtener notas de venta con relaciones
    const { data: pedidos, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        clientes(empresa),
        pedidos(
          id,
          cantidad,
          productos(nombre),
          entregas(cantidad)
        )
      `)
      .order('fecha', { ascending: false })
      .limit(3);

    if (error) {
      // Fallback si hay error con relaciones
      const { data: basicPedidos, error: basicError } = await supabase
        .from('notas_venta')
        .select('id, numero_factura, fecha, total')
        .order('fecha', { ascending: false })
        .limit(3);

      if (basicError) throw basicError;

      return basicPedidos?.map(nota => ({
        id: nota.id,
        numero_factura: nota.numero_factura,
        fecha: nota.fecha,
        total: nota.total || 0,
        cliente: 'Sin datos',
        vendedor: 'Sin asignar',
        productos: [],
        progreso_entrega: 0,
        dias_desde_creacion: Math.floor((new Date() - new Date(nota.fecha)) / (1000 * 60 * 60 * 24)),
        estado: 'pendiente'
      })) || [];
    }

    // Procesar datos completos
    const processed = pedidos?.map(nota => {
      const diasDesdeCreacion = Math.floor((new Date() - new Date(nota.fecha)) / (1000 * 60 * 60 * 24));

      // Calcular progreso de entrega
      let totalPedido = 0;
      let totalEntregado = 0;

      nota.pedidos?.forEach(pedido => {
        totalPedido += pedido.cantidad || 0;
        totalEntregado += pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
      });

      const progresoEntrega = totalPedido > 0 ? Math.round((totalEntregado / totalPedido) * 100) : 0;

      return {
        id: nota.id,
        numero_factura: nota.numero_factura,
        fecha: nota.fecha,
        total: nota.total || 0,
        cliente: nota.clientes?.empresa || 'Sin empresa',
        vendedor: 'Sin asignar', // No disponible en esquema actual
        productos: nota.pedidos?.map(p => ({ nombre: p.productos?.nombre || 'Sin nombre' })) || [],
        progreso_entrega: progresoEntrega,
        dias_desde_creacion: diasDesdeCreacion,
        estado: progresoEntrega >= 100 ? 'completado' : progresoEntrega > 0 ? 'en_proceso' : 'pendiente'
      };
    }) || [];

    return processed;
  } catch (error) {
    console.error('Error al obtener pedidos recientes:', error);
    throw error;
  }
};

// Top clientes
export const getTopClients = async () => {
  try {
    // Usar la vista ya existente en la base de datos
    const { data: clientes, error } = await supabase
      .from('vista_ventas_por_cliente')
      .select('*')
      .order('total_vendido', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Procesar datos de la vista
    const processed = clientes?.map(cliente => ({
      id: cliente.cliente_id,
      empresa: cliente.empresa || 'Sin empresa',
      nombre_contacto: cliente.nombre_contacto || 'Sin contacto',
      telefono: null, // No disponible en la vista
      total_compras: cliente.total_vendido || 0,
      num_pedidos: cliente.total_facturas || 0,
      ultima_compra: null // Requiere consulta adicional
    })) || [];

    return processed;
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    throw error;
  }
};

// Rendimiento de vendedores
export const getVendedorPerformance = async () => {
  try {
    // Obtener fecha del mes actual
    const fechaInicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const fechaFinMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    // Obtener vendedores
    const { data: vendedores, error: errorVendedores } = await supabase
      .from('vendedores')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (errorVendedores) throw errorVendedores;

    // Por simplicidad, devolver estructura básica de vendedores sin ventas por ahora
    const processed = vendedores?.map(vendedor => ({
      id: vendedor.id,
      nombre: vendedor.nombre,
      email: null, // No disponible en esquema actual
      telefono: null, // No disponible en esquema actual
      zona: null, // No disponible en esquema actual
      ventas_mes: 0, // Por implementar con consultas separadas si es necesario
      num_ventas: 0,
      venta_promedio: 0,
      clientes_atendidos: 0,
      ultima_venta: null,
      meta_mensual: 100000
    })) || [];

    return processed;
  } catch (error) {
    console.error('Error al obtener rendimiento de vendedores:', error);
    throw error;
  }
};

// Estadísticas rápidas para la sección de acciones rápidas
export const getEstadisticasRapidas = async () => {
  try {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString();

    // Calcular inicio de la semana (lunes)
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); // Lunes de esta semana
    inicioSemana.setHours(0, 0, 0, 0);

    // Calcular inicio del mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();

    // 1. Pedidos de hoy
    const { data: pedidosHoy, error: errorPedidosHoy } = await supabase
      .from('notas_venta')
      .select('id')
      .gte('fecha', inicioHoy)
      .lte('fecha', finHoy);

    if (errorPedidosHoy) throw errorPedidosHoy;

    // 2. Entregas de esta semana
    const { data: entregasSemana, error: errorEntregasSemana } = await supabase
      .from('entregas')
      .select('id')
      .gte('fecha_entrega', inicioSemana.toISOString());

    if (errorEntregasSemana) throw errorEntregasSemana;

    // 3. Clientes nuevos este mes - usar primera compra como proxy
    // Como la tabla clientes no tiene created_at, contar clientes únicos con su primera compra este mes
    const { data: primerasCompras, error: errorPrimerasCompras } = await supabase
      .from('notas_venta')
      .select('clientes_id')
      .gte('fecha', inicioMes)
      .not('clientes_id', 'is', null);

    let conteoClientesNuevos = 0;
    if (!errorPrimerasCompras && primerasCompras) {
      // Obtener clientes únicos que compraron este mes
      const clientesDelMes = new Set(primerasCompras.map(nota => nota.clientes_id));

      // Para cada cliente, verificar si es su primera compra
      for (const clienteId of clientesDelMes) {
        const { data: primeraCompraCliente } = await supabase
          .from('notas_venta')
          .select('fecha')
          .eq('clientes_id', clienteId)
          .order('fecha', { ascending: true })
          .limit(1);

        if (primeraCompraCliente && primeraCompraCliente[0] &&
            new Date(primeraCompraCliente[0].fecha) >= new Date(inicioMes)) {
          conteoClientesNuevos++;
        }
      }
    }

    // 4. Pedidos pendientes de revisar (sin entregas completas)
    const { data: notasConPedidos, error: errorPendientes } = await supabase
      .from('notas_venta')
      .select(`
        id,
        pedidos(
          id,
          cantidad,
          entregas(cantidad)
        )
      `);

    let pendientesRevisar = 0;
    if (!errorPendientes) {
      notasConPedidos?.forEach(nota => {
        const tienePendientes = nota.pedidos?.some(pedido => {
          const totalPedido = pedido.cantidad || 0;
          const totalEntregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
          return totalEntregado < totalPedido;
        });

        if (tienePendientes) {
          pendientesRevisar++;
        }
      });
    }

    return {
      pedidosHoy: pedidosHoy?.length || 0,
      entregasSemana: entregasSemana?.length || 0,
      clientesNuevosMes: conteoClientesNuevos,
      pendientesRevisar: pendientesRevisar
    };

  } catch (error) {
    console.error('Error al obtener estadísticas rápidas:', error);
    // Devolver valores por defecto en caso de error
    return {
      pedidosHoy: 0,
      entregasSemana: 0,
      clientesNuevosMes: 0,
      pendientesRevisar: 0
    };
  }
};