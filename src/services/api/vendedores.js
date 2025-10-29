import { supabase } from '../supabase';

export const getVendedores = async (params = {}) => {
  const { offset = 0, limit = 15, filtros = {} } = params;

  let query = supabase
    .from('vendedores')
    .select(`
      id,
      nombre
    `)
    .order('nombre', { ascending: true });

  // Aplicar filtros
  if (filtros.nombre) {
    query = query.ilike('nombre', `%${filtros.nombre}%`);
  }

  // Paginaci�n
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    count,
    hasMore: data?.length === limit
  };
};

export const getVendedoresCount = async (filtros = {}) => {
  let query = supabase
    .from('vendedores')
    .select('id', { count: 'exact', head: true });

  if (filtros.nombre) {
    query = query.ilike('nombre', `%${filtros.nombre}%`);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count;
};

export const createVendedor = async (vendedorData) => {
  const { data, error } = await supabase
    .from('vendedores')
    .insert([vendedorData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateVendedor = async (id, vendedorData) => {
  const { data, error } = await supabase
    .from('vendedores')
    .update(vendedorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteVendedor = async (id) => {
  const { error } = await supabase
    .from('vendedores')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};

// Obtener estad�sticas detalladas de un vendedor
export const getVendedorEstadisticas = async (vendedorId) => {
  try {
    // Obtener clientes del vendedor
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select(`
        id,
        empresa,
        estado,
        notas_venta (
          id,
          fecha,
          total,
          pagos (
            importe
          )
        )
      `)
      .eq('vendedores_id', vendedorId);

    if (clientesError) throw clientesError;

    // Calcular estad�sticas
    const totalClientes = clientes?.length || 0;
    const clientesActivos = clientes?.filter(c => c.estado).length || 0;

    // Estad�sticas de ventas
    let totalVentas = 0;
    let montoTotalVendido = 0;
    let totalPagado = 0;
    let ventasEsteMes = 0;
    let montoEsteMes = 0;

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    clientes?.forEach(cliente => {
      cliente.notas_venta?.forEach(nota => {
        totalVentas++;
        const montoNota = parseFloat(nota.total || 0);
        montoTotalVendido += montoNota;

        // Pagos de esta nota
        const pagosNota = nota.pagos?.reduce((sum, pago) =>
          sum + parseFloat(pago.importe || 0), 0) || 0;
        totalPagado += pagosNota;

        // Ventas de este mes
        const fechaNota = new Date(nota.fecha);
        if (fechaNota >= inicioMes) {
          ventasEsteMes++;
          montoEsteMes += montoNota;
        }
      });
    });

    const saldoPendiente = montoTotalVendido - totalPagado;

    // Cliente con mayor volumen
    let mejorCliente = null;
    let mayorVolumen = 0;

    clientes?.forEach(cliente => {
      const volumenCliente = cliente.notas_venta?.reduce((sum, nota) =>
        sum + parseFloat(nota.total || 0), 0) || 0;

      if (volumenCliente > mayorVolumen) {
        mayorVolumen = volumenCliente;
        mejorCliente = {
          empresa: cliente.empresa,
          volumen: volumenCliente
        };
      }
    });

    // �ltima venta
    let ultimaVenta = null;
    clientes?.forEach(cliente => {
      cliente.notas_venta?.forEach(nota => {
        if (!ultimaVenta || new Date(nota.fecha) > new Date(ultimaVenta)) {
          ultimaVenta = nota.fecha;
        }
      });
    });

    return {
      totalClientes,
      clientesActivos,
      totalVentas,
      montoTotalVendido,
      totalPagado,
      saldoPendiente,
      ventasEsteMes,
      montoEsteMes,
      mejorCliente,
      ultimaVenta,
      promedioVentaPorCliente: totalClientes > 0 ? montoTotalVendido / totalClientes : 0
    };

  } catch (error) {
    console.error('Error al obtener estad�sticas del vendedor:', error);
    return {
      totalClientes: 0,
      clientesActivos: 0,
      totalVentas: 0,
      montoTotalVendido: 0,
      totalPagado: 0,
      saldoPendiente: 0,
      ventasEsteMes: 0,
      montoEsteMes: 0,
      mejorCliente: null,
      ultimaVenta: null,
      promedioVentaPorCliente: 0
    };
  }
};

// Obtener ranking de vendedores por ventas
// Obtener detalle completo de un vendedor específico
export const getVendedorDetalle = async (vendedorId) => {
  try {
    const { data, error } = await supabase
      .from('vendedores')
      .select(`
        id,
        nombre,
        clientes (
          id,
          empresa,
          nombre_contacto,
          correo,
          telefono,
          direccion,
          dias_credito,
          estado,
          notas_venta (
            id,
            numero_factura,
            fecha,
            total,
            subtotal,
            iva,
            descuento,
            pedidos (
              id,
              cantidad,
              precio_unitario_venta,
              productos (
                id,
                nombre,
                material
              ),
              entregas (
                id,
                fecha_entrega,
                cantidad
              )
            ),
            pagos (
              id,
              fecha,
              importe,
              metodo_pago
            )
          )
        )
      `)
      .eq('id', vendedorId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Vendedor no encontrado');
    }

    // Calcular estadísticas detalladas
    const clientes = data.clientes || [];
    const clientesActivos = clientes.filter(c => c.estado);

    // Obtener todas las notas de venta de todos los clientes
    const todasLasNotas = clientes.reduce((notas, cliente) => {
      return notas.concat(cliente.notas_venta || []);
    }, []);

    // Estadísticas financieras
    const totalFacturas = todasLasNotas.length;
    const montoTotalVendido = todasLasNotas.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0);
    const totalPagado = todasLasNotas.reduce((sum, nota) => {
      const pagosNota = nota.pagos?.reduce((pagSum, pago) => pagSum + parseFloat(pago.importe || 0), 0) || 0;
      return sum + pagosNota;
    }, 0);
    const saldoPendiente = montoTotalVendido - totalPagado;

    // Estadísticas de productos
    const totalPedidos = todasLasNotas.reduce((sum, nota) => sum + (nota.pedidos?.length || 0), 0);
    const totalProductosVendidos = todasLasNotas.reduce((sum, nota) => {
      return sum + (nota.pedidos?.reduce((pedSum, pedido) => pedSum + (pedido.cantidad || 0), 0) || 0);
    }, 0);
    const totalProductosEntregados = todasLasNotas.reduce((sum, nota) => {
      return sum + (nota.pedidos?.reduce((pedSum, pedido) => {
        return pedSum + (pedido.entregas?.reduce((entSum, entrega) => entSum + (entrega.cantidad || 0), 0) || 0);
      }, 0) || 0);
    }, 0);

    // Análisis temporal
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAño = new Date(hoy.getFullYear(), 0, 1);

    const facturasEsteMes = todasLasNotas.filter(nota => new Date(nota.fecha) >= inicioMes);
    const facturasEsteAño = todasLasNotas.filter(nota => new Date(nota.fecha) >= inicioAño);

    const ventasEsteMes = facturasEsteMes.length;
    const montoEsteMes = facturasEsteMes.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0);
    const ventasEsteAño = facturasEsteAño.length;
    const montoEsteAño = facturasEsteAño.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0);

    // Última actividad
    const ultimaVenta = todasLasNotas.length > 0
      ? todasLasNotas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
      : null;

    const ultimoPago = todasLasNotas.reduce((ultimoPago, nota) => {
      const pagosNota = nota.pagos || [];
      const ultimoPagoNota = pagosNota.length > 0
        ? pagosNota.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
        : null;

      if (!ultimoPago || (ultimoPagoNota && new Date(ultimoPagoNota.fecha) > new Date(ultimoPago.fecha))) {
        return ultimoPagoNota;
      }
      return ultimoPago;
    }, null);

    // Mejores clientes por volumen
    const clientesConVolumen = clientes.map(cliente => {
      const notasCliente = cliente.notas_venta || [];
      const volumenTotal = notasCliente.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0);
      const facturas = notasCliente.length;

      return {
        cliente,
        volumenTotal,
        facturas
      };
    }).filter(item => item.volumenTotal > 0)
      .sort((a, b) => b.volumenTotal - a.volumenTotal)
      .slice(0, 10);

    // Productos más vendidos
    const productosMap = new Map();
    todasLasNotas.forEach(nota => {
      nota.pedidos?.forEach(pedido => {
        if (pedido.productos) {
          const key = pedido.productos.id;
          if (productosMap.has(key)) {
            const existing = productosMap.get(key);
            existing.cantidadTotal += pedido.cantidad || 0;
            existing.vecesVendido += 1;
            existing.ingresoTotal += (pedido.cantidad || 0) * (pedido.precio_unitario_venta || 0);
          } else {
            productosMap.set(key, {
              producto: pedido.productos,
              cantidadTotal: pedido.cantidad || 0,
              vecesVendido: 1,
              ingresoTotal: (pedido.cantidad || 0) * (pedido.precio_unitario_venta || 0)
            });
          }
        }
      });
    });

    const productosMasVendidos = Array.from(productosMap.values())
      .sort((a, b) => b.ingresoTotal - a.ingresoTotal)
      .slice(0, 5);

    // Historial mensual (últimos 12 meses)
    const historialMensual = [];
    for (let i = 11; i >= 0; i--) {
      const fechaMes = new Date();
      fechaMes.setMonth(fechaMes.getMonth() - i);
      const año = fechaMes.getFullYear();
      const mes = fechaMes.getMonth();

      const facturasMes = todasLasNotas.filter(nota => {
        const fechaNota = new Date(nota.fecha);
        return fechaNota.getFullYear() === año && fechaNota.getMonth() === mes;
      });

      const pagosMes = todasLasNotas.reduce((totalPagos, nota) => {
        const pagosNotaMes = nota.pagos?.filter(pago => {
          const fechaPago = new Date(pago.fecha);
          return fechaPago.getFullYear() === año && fechaPago.getMonth() === mes;
        }) || [];
        return totalPagos + pagosNotaMes.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0);
      }, 0);

      historialMensual.push({
        mes: fechaMes.toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }),
        facturas: facturasMes.length,
        montoVendido: facturasMes.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0),
        pagosRecibidos: pagosMes
      });
    }

    // Análisis de performance
    const promedioVentaPorCliente = clientes.length > 0 ? montoTotalVendido / clientes.length : 0;
    const promedioVentaPorFactura = totalFacturas > 0 ? montoTotalVendido / totalFacturas : 0;
    const tasaCobranza = montoTotalVendido > 0 ? (totalPagado / montoTotalVendido) * 100 : 0;
    const tasaEntrega = totalProductosVendidos > 0 ? (totalProductosEntregados / totalProductosVendidos) * 100 : 0;

    // Nivel de performance basado en ventas del mes
    let nivelPerformance = 'bajo';
    if (ventasEsteMes >= 10) nivelPerformance = 'excelente';
    else if (ventasEsteMes >= 5) nivelPerformance = 'bueno';
    else if (ventasEsteMes >= 1) nivelPerformance = 'regular';

    return {
      ...data,
      estadisticas: {
        // Clientes
        totalClientes: clientes.length,
        clientesActivos: clientesActivos.length,

        // Financieras
        totalFacturas,
        montoTotalVendido,
        totalPagado,
        saldoPendiente,

        // Periodo actual
        ventasEsteMes,
        montoEsteMes,
        ventasEsteAño,
        montoEsteAño,

        // Productos
        totalPedidos,
        totalProductosVendidos,
        totalProductosEntregados,

        // Análisis
        promedioVentaPorCliente,
        promedioVentaPorFactura,
        tasaCobranza,
        tasaEntrega,
        nivelPerformance,

        // Actividad
        ultimaVenta: ultimaVenta?.fecha || null,
        ultimoPago: ultimoPago?.fecha || null,

        // Rankings
        mejoresClientes: clientesConVolumen,
        productosMasVendidos,
        historialMensual
      }
    };

  } catch (error) {
    console.error('Error al obtener detalle de vendedor:', error);
    throw error;
  }
};

export const getRankingVendedores = async (periodo = 'mes') => {
  try {
    let fechaInicio;
    const hoy = new Date();

    switch (periodo) {
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'trimestre':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
        break;
      case 'a�o':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    const { data: vendedores, error } = await supabase
      .from('vendedores')
      .select(`
        id,
        nombre,
        clientes (
          notas_venta (
            fecha,
            total
          )
        )
      `);

    if (error) throw error;

    // Calcular ventas por vendedor en el per�odo
    const ranking = vendedores?.map(vendedor => {
      let ventasPeriodo = 0;
      let montoPeriodo = 0;

      vendedor.clientes?.forEach(cliente => {
        cliente.notas_venta?.forEach(nota => {
          const fechaNota = new Date(nota.fecha);
          if (fechaNota >= fechaInicio) {
            ventasPeriodo++;
            montoPeriodo += parseFloat(nota.total || 0);
          }
        });
      });

      return {
        id: vendedor.id,
        nombre: vendedor.nombre,
        ventasPeriodo,
        montoPeriodo
      };
    }).sort((a, b) => b.montoPeriodo - a.montoPeriodo) || [];

    return ranking;

  } catch (error) {
    console.error('Error al obtener ranking de vendedores:', error);
    return [];
  }
};