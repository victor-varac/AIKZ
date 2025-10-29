import { supabase } from '../supabase';

export const getClientes = async (params = {}) => {
  const { offset = 0, limit = 15, filtros = {} } = params;

  let query = supabase
    .from('clientes')
    .select(`
      id,
      nombre_contacto,
      empresa,
      correo,
      telefono,
      direccion,
      dias_credito,
      estado,
      vendedores (
        id,
        nombre
      )
    `)
    .order('empresa', { ascending: true });

  // Aplicar filtros
  if (filtros.empresa) {
    query = query.ilike('empresa', `%${filtros.empresa}%`);
  }

  if (filtros.nombre_contacto) {
    query = query.ilike('nombre_contacto', `%${filtros.nombre_contacto}%`);
  }

  if (filtros.vendedor_id) {
    query = query.eq('vendedores_id', filtros.vendedor_id);
  }

  if (filtros.estado !== undefined && filtros.estado !== '') {
    query = query.eq('estado', filtros.estado);
  }

  if (filtros.dias_credito_min) {
    query = query.gte('dias_credito', filtros.dias_credito_min);
  }

  if (filtros.dias_credito_max) {
    query = query.lte('dias_credito', filtros.dias_credito_max);
  }

  if (filtros.correo) {
    query = query.ilike('correo', `%${filtros.correo}%`);
  }

  if (filtros.telefono) {
    query = query.ilike('telefono', `%${filtros.telefono}%`);
  }

  // Paginaci�n
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  // Procesar datos para incluir informaci�n adicional
  const processedData = data?.map(cliente => {
    return {
      ...cliente,
      vendedor: cliente.vendedores?.nombre || 'Sin asignar',
      estadoTexto: cliente.estado ? 'Activo' : 'Inactivo'
    };
  }) || [];

  return {
    data: processedData,
    count,
    hasMore: data?.length === limit
  };
};

export const getClientesCount = async (filtros = {}) => {
  let query = supabase
    .from('clientes')
    .select('id', { count: 'exact', head: true });

  // Aplicar mismos filtros
  if (filtros.empresa) {
    query = query.ilike('empresa', `%${filtros.empresa}%`);
  }

  if (filtros.nombre_contacto) {
    query = query.ilike('nombre_contacto', `%${filtros.nombre_contacto}%`);
  }

  if (filtros.vendedor_id) {
    query = query.eq('vendedores_id', filtros.vendedor_id);
  }

  if (filtros.estado !== undefined && filtros.estado !== '') {
    query = query.eq('estado', filtros.estado);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count;
};

export const createCliente = async (clienteData) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([clienteData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateCliente = async (id, clienteData) => {
  const { data, error } = await supabase
    .from('clientes')
    .update(clienteData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};

// Obtener detalle completo de un cliente específico
export const getClienteDetalle = async (clienteId) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id,
        nombre_contacto,
        empresa,
        correo,
        telefono,
        direccion,
        dias_credito,
        estado,
        vendedores (
          id,
          nombre
        ),
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
      `)
      .eq('id', clienteId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Cliente no encontrado');
    }

    // Calcular estadísticas detalladas
    const notasVenta = data.notas_venta || [];

    // Estadísticas financieras
    const totalFacturas = notasVenta.length;
    const montoTotalFacturado = notasVenta.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0);
    const totalPagado = notasVenta.reduce((sum, nota) => {
      const pagosNota = nota.pagos?.reduce((pagSum, pago) => pagSum + parseFloat(pago.importe || 0), 0) || 0;
      return sum + pagosNota;
    }, 0);
    const saldoPendiente = montoTotalFacturado - totalPagado;

    // Estadísticas de productos
    const totalPedidos = notasVenta.reduce((sum, nota) => sum + (nota.pedidos?.length || 0), 0);
    const totalProductosPedidos = notasVenta.reduce((sum, nota) => {
      return sum + (nota.pedidos?.reduce((pedSum, pedido) => pedSum + (pedido.cantidad || 0), 0) || 0);
    }, 0);
    const totalProductosEntregados = notasVenta.reduce((sum, nota) => {
      return sum + (nota.pedidos?.reduce((pedSum, pedido) => {
        return pedSum + (pedido.entregas?.reduce((entSum, entrega) => entSum + (entrega.cantidad || 0), 0) || 0);
      }, 0) || 0);
    }, 0);

    // Última actividad
    const ultimaFactura = notasVenta.length > 0
      ? notasVenta.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
      : null;

    const ultimoPago = notasVenta.reduce((ultimoPago, nota) => {
      const pagosNota = nota.pagos || [];
      const ultimoPagoNota = pagosNota.length > 0
        ? pagosNota.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
        : null;

      if (!ultimoPago || (ultimoPagoNota && new Date(ultimoPagoNota.fecha) > new Date(ultimoPago.fecha))) {
        return ultimoPagoNota;
      }
      return ultimoPago;
    }, null);

    // Análisis de crédito
    const hoy = new Date();
    const facturasPendientes = notasVenta.filter(nota => {
      const totalPagadoNota = nota.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
      return parseFloat(nota.total || 0) > totalPagadoNota;
    });

    const facturasVencidas = facturasPendientes.filter(nota => {
      const fechaVencimiento = new Date(nota.fecha);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (data.dias_credito || 0));
      return fechaVencimiento < hoy;
    });

    // Productos más comprados
    const productosMap = new Map();
    notasVenta.forEach(nota => {
      nota.pedidos?.forEach(pedido => {
        if (pedido.productos) {
          const key = pedido.productos.id;
          if (productosMap.has(key)) {
            const existing = productosMap.get(key);
            existing.cantidadTotal += pedido.cantidad || 0;
            existing.vecesComprado += 1;
          } else {
            productosMap.set(key, {
              producto: pedido.productos,
              cantidadTotal: pedido.cantidad || 0,
              vecesComprado: 1
            });
          }
        }
      });
    });

    const productosMasComprados = Array.from(productosMap.values())
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
      .slice(0, 5);

    // Historial mensual (últimos 12 meses)
    const historialMensual = [];
    for (let i = 11; i >= 0; i--) {
      const fechaMes = new Date();
      fechaMes.setMonth(fechaMes.getMonth() - i);
      const año = fechaMes.getFullYear();
      const mes = fechaMes.getMonth();

      const facturasMes = notasVenta.filter(nota => {
        const fechaNota = new Date(nota.fecha);
        return fechaNota.getFullYear() === año && fechaNota.getMonth() === mes;
      });

      const pagosMes = notasVenta.reduce((totalPagos, nota) => {
        const pagosNotaMes = nota.pagos?.filter(pago => {
          const fechaPago = new Date(pago.fecha);
          return fechaPago.getFullYear() === año && fechaPago.getMonth() === mes;
        }) || [];
        return totalPagos + pagosNotaMes.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0);
      }, 0);

      historialMensual.push({
        mes: fechaMes.toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }),
        facturas: facturasMes.length,
        montoFacturado: facturasMes.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0),
        pagos: pagosMes
      });
    }

    return {
      ...data,
      estadisticas: {
        // Financieras
        totalFacturas,
        montoTotalFacturado,
        totalPagado,
        saldoPendiente,
        facturasPendientesCount: facturasPendientes.length,
        facturasVencidasCount: facturasVencidas.length,

        // Productos
        totalPedidos,
        totalProductosPedidos,
        totalProductosEntregados,
        porcentajeEntrega: totalProductosPedidos > 0 ? (totalProductosEntregados / totalProductosPedidos) * 100 : 0,

        // Actividad
        ultimaFactura: ultimaFactura?.fecha || null,
        ultimoPago: ultimoPago?.fecha || null,

        // Análisis
        productosMasComprados,
        historialMensual,

        // Estados
        estadoPago: saldoPendiente <= 0 ? 'al_corriente' : facturasVencidas.length > 0 ? 'vencido' : 'pendiente',
        riesgoCredito: facturasVencidas.length > 2 ? 'alto' : facturasVencidas.length > 0 ? 'medio' : 'bajo'
      }
    };

  } catch (error) {
    console.error('Error al obtener detalle de cliente:', error);
    throw error;
  }
};

// Obtener vendedores para filtros
export const getVendedores = async () => {
  const { data, error } = await supabase
    .from('vendedores')
    .select('id, nombre')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Obtener estad�sticas de cliente
export const getClienteEstadisticas = async (clienteId) => {
  try {
    // Obtener notas de venta del cliente
    const { data: notasVenta, error: notasError } = await supabase
      .from('notas_venta')
      .select(`
        id,
        fecha,
        total,
        pagos (
          importe
        )
      `)
      .eq('clientes_id', clienteId);

    if (notasError) throw notasError;

    // Calcular estad�sticas
    const totalFacturas = notasVenta?.length || 0;
    const montoTotal = notasVenta?.reduce((sum, nota) => sum + parseFloat(nota.total || 0), 0) || 0;
    const totalPagado = notasVenta?.reduce((sum, nota) => {
      const pagosNota = nota.pagos?.reduce((pagSum, pago) => pagSum + parseFloat(pago.importe || 0), 0) || 0;
      return sum + pagosNota;
    }, 0) || 0;
    const saldoPendiente = montoTotal - totalPagado;

    // �ltima compra
    const ultimaCompra = notasVenta?.length > 0
      ? notasVenta.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]?.fecha
      : null;

    return {
      totalFacturas,
      montoTotal,
      totalPagado,
      saldoPendiente,
      ultimaCompra
    };
  } catch (error) {
    console.error('Error al obtener estad�sticas del cliente:', error);
    return {
      totalFacturas: 0,
      montoTotal: 0,
      totalPagado: 0,
      saldoPendiente: 0,
      ultimaCompra: null
    };
  }
};