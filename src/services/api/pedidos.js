import { supabase } from '../supabase';

export const getNotasVentaPaginadas = async (params = {}) => {
  const { offset = 0, limit = 15, filtros = {} } = params;

  // Primera consulta: obtener IDs de notas que cumplen con los filtros usando la vista
  let filterQuery = supabase
    .from('notas_venta_con_estados')
    .select('id', { count: 'exact' })
    .order('fecha', { ascending: false });

  // Aplicar filtros de fecha
  if (filtros.fechaDesde) {
    filterQuery = filterQuery.gte('fecha', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    filterQuery = filterQuery.lte('fecha', filtros.fechaHasta);
  }

  // Aplicar filtro de cliente
  if (filtros.cliente) {
    filterQuery = filterQuery.eq('clientes_id', parseInt(filtros.cliente));
  }

  // Aplicar filtros de estado en la consulta (NO después)
  if (filtros.estadoPago) {
    filterQuery = filterQuery.eq('estado_pago', filtros.estadoPago);
  }

  if (filtros.estadoEntrega) {
    filterQuery = filterQuery.eq('estado_entrega', filtros.estadoEntrega);
  }

  if (filtros.estadoCredito) {
    filterQuery = filterQuery.eq('estado_credito', filtros.estadoCredito);
  }

  // Aplicar paginación
  filterQuery = filterQuery.range(offset, offset + limit - 1);

  const { data: filteredIds, error: filterError, count: totalCount } = await filterQuery;

  if (filterError) {
    throw filterError;
  }

  // Si no hay resultados, retornar vacío
  if (!filteredIds || filteredIds.length === 0) {
    return {
      data: [],
      count: totalCount || 0,
      hasMore: false
    };
  }

  // Segunda consulta: obtener los datos completos solo de las notas filtradas
  const ids = filteredIds.map(item => item.id);

  const { data, error } = await supabase
    .from('notas_venta')
    .select(`
      id,
      numero_factura,
      fecha,
      total,
      subtotal,
      iva,
      clientes!inner (
        empresa,
        nombre_contacto,
        telefono,
        dias_credito,
        vendedores (
          nombre
        )
      ),
      pedidos (
        id,
        cantidad,
        entregas (
          id,
          cantidad
        )
      ),
      pagos (
        importe
      )
    `)
    .in('id', ids)
    .order('fecha', { ascending: false });

  if (error) {
    throw error;
  }

  // Procesar datos para calcular los porcentajes
  const processedData = data?.map(nota => {
    const totalPagado = nota.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
    const saldoPendiente = parseFloat(nota.total) - totalPagado;
    const porcentajePagado = nota.total > 0 ? (totalPagado / parseFloat(nota.total)) * 100 : 0;

    const totalPedidos = nota.pedidos?.length || 0;
    const pedidosEntregados = nota.pedidos?.filter(pedido => pedido.entregas?.length > 0).length || 0;
    const pedidosPendientes = totalPedidos - pedidosEntregados;
    const porcentajeEntregado = totalPedidos > 0 ? (pedidosEntregados / totalPedidos) * 100 : 0;

    const diasCredito = nota.clientes?.dias_credito || 0;
    const fechaLimite = new Date(nota.fecha);
    fechaLimite.setDate(fechaLimite.getDate() + diasCredito);
    const hoy = new Date();
    const diasRestantesCredito = Math.max(0, Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24)));
    const porcentajeCreditoRestante = diasCredito > 0 ? (diasRestantesCredito / diasCredito) * 100 : 100;

    // Calcular estados categóricos
    let estadoPago = 'pendiente';
    if (porcentajePagado >= 100) {
      estadoPago = 'pagado';
    } else if (porcentajePagado > 0) {
      estadoPago = 'parcial';
    }

    let estadoEntrega = 'pendiente';
    if (porcentajeEntregado >= 100) {
      estadoEntrega = 'completo';
    } else if (porcentajeEntregado > 0) {
      estadoEntrega = 'parcial';
    }

    let estadoCredito = 'vigente';
    if (diasRestantesCredito <= 0) {
      estadoCredito = 'vencido';
    } else if (diasRestantesCredito <= 7) {
      estadoCredito = 'por_vencer';
    }

    return {
      ...nota,
      totalPagado,
      saldoPendiente,
      porcentajePagado: Math.min(100, Math.max(0, porcentajePagado)),
      estadoPago,
      totalPedidos,
      pedidosEntregados,
      pedidosPendientes,
      porcentajeEntregado: Math.min(100, Math.max(0, porcentajeEntregado)),
      estadoEntrega,
      diasRestantesCredito,
      porcentajeCreditoRestante: Math.min(100, Math.max(0, porcentajeCreditoRestante)),
      estadoCredito,
      fechaLimite,
      vendedor: nota.clientes?.vendedores?.nombre || 'Sin asignar'
    };
  }) || [];

  return {
    data: processedData,
    count: totalCount || 0,
    hasMore: (offset + limit) < (totalCount || 0)
  };
};

export const getNotasVentaCount = async (filtros = {}) => {
  let query = supabase
    .from('notas_venta')
    .select('id', { count: 'exact', head: true });

  // Aplicar mismos filtros que en la consulta principal
  if (filtros.fechaDesde) {
    query = query.gte('fecha', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte('fecha', filtros.fechaHasta);
  }

  if (filtros.cliente) {
    // Filtrar por ID de cliente específico
    query = query.eq('clientes_id', parseInt(filtros.cliente));
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count;
};

// Obtener clientes para el formulario
export const getClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      id,
      empresa,
      nombre_contacto,
      telefono,
      dias_credito,
      vendedores (
        id,
        nombre
      )
    `)
    .eq('estado', true)
    .order('empresa');

  if (error) {
    throw error;
  }

  return data;
};

// Obtener productos para agregar a la nota de venta
export const getProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Crear nueva nota de venta
// Obtener detalle completo de una nota de venta específica
export const getNotaVentaDetalle = async (notaVentaId) => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        subtotal,
        iva,
        descuento,
        clientes_id,
        clientes!inner (
          id,
          empresa,
          nombre_contacto,
          correo,
          telefono,
          direccion,
          dias_credito,
          vendedores (
            id,
            nombre
          )
        ),
        pedidos (
          id,
          cantidad,
          precio_unitario_venta,
          productos (
            id,
            nombre,
            material,
            ancho_cm,
            largo_cm,
            micraje_um,
            presentacion,
            tipo
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
      `)
      .eq('id', notaVentaId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Nota de venta no encontrada');
    }

    // Calcular estadísticas detalladas
    const totalPedidos = data.pedidos?.length || 0;
    const totalEntregado = data.pedidos?.reduce((sum, pedido) => {
      const entregado = pedido.entregas?.reduce((entSum, entrega) => entSum + (entrega.cantidad || 0), 0) || 0;
      return sum + entregado;
    }, 0) || 0;

    const totalPedidosCantidad = data.pedidos?.reduce((sum, pedido) => sum + (pedido.cantidad || 0), 0) || 0;
    const totalPagado = data.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
    const saldoPendiente = parseFloat(data.total || 0) - totalPagado;

    // Calcular días de crédito restantes
    const fechaVenta = new Date(data.fecha);
    const fechaVencimiento = new Date(fechaVenta);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + (data.clientes?.dias_credito || 0));
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

    // Calcular porcentajes para barras de progreso
    const porcentajePago = data.total > 0 ? Math.min((totalPagado / parseFloat(data.total)) * 100, 100) : 0;
    const porcentajeEntrega = totalPedidosCantidad > 0 ? Math.min((totalEntregado / totalPedidosCantidad) * 100, 100) : 0;
    const porcentajeCredito = data.clientes?.dias_credito > 0 ?
      Math.max(0, Math.min((diasRestantes / data.clientes.dias_credito) * 100, 100)) : 100;

    return {
      ...data,
      estadisticas: {
        totalPedidos,
        totalPedidosCantidad,
        totalEntregado,
        totalPagado,
        saldoPendiente,
        diasRestantes,
        fechaVencimiento,
        porcentajePago,
        porcentajeEntrega,
        porcentajeCredito,
        estadoPago: porcentajePago >= 100 ? 'pagado' : saldoPendiente > 0 ? 'pendiente' : 'sin_pagos',
        estadoEntrega: porcentajeEntrega >= 100 ? 'completo' : totalEntregado > 0 ? 'parcial' : 'pendiente',
        estadoCredito: diasRestantes > 7 ? 'vigente' : diasRestantes > 0 ? 'proximo_vencer' : 'vencido'
      }
    };

  } catch (error) {
    console.error('Error al obtener detalle de nota de venta:', error);
    throw error;
  }
};

// CRUD para pedidos individuales
export const createPedido = async (pedidoData) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedidoData])
      .select(`
        id,
        cantidad,
        precio_unitario_venta,
        productos (
          id,
          nombre,
          material,
          ancho_cm,
          largo_cm,
          micraje_um,
          presentacion,
          tipo
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

export const updatePedido = async (pedidoId, pedidoData) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update(pedidoData)
      .eq('id', pedidoId)
      .select(`
        id,
        cantidad,
        precio_unitario_venta,
        productos (
          id,
          nombre,
          material,
          ancho_cm,
          largo_cm,
          micraje_um,
          presentacion,
          tipo
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    throw error;
  }
};

export const deletePedido = async (pedidoId) => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', pedidoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    throw error;
  }
};

// Actualizar totales de nota de venta
export const updateNotaVentaTotales = async (notaVentaId, totales) => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .update({
        subtotal: totales.subtotal,
        iva: totales.iva,
        total: totales.total
      })
      .eq('id', notaVentaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar totales:', error);
    throw error;
  }
};

export const updateNotaVenta = async (notaVentaId, notaVentaData) => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .update(notaVentaData)
      .eq('id', notaVentaId)
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        subtotal,
        iva,
        descuento,
        clientes_id
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar nota de venta:', error);
    throw error;
  }
};

export const createNotaVenta = async (notaVentaData) => {
  const { pedidos, ...notaData } = notaVentaData;

  try {
    // Primero crear la nota de venta
    const { data: notaVenta, error: notaError } = await supabase
      .from('notas_venta')
      .insert([notaData])
      .select()
      .single();

    if (notaError) {
      throw notaError;
    }

    // Si hay pedidos, agregarlos
    if (pedidos && pedidos.length > 0) {
      const pedidosConNotaId = pedidos.map(pedido => ({
        ...pedido,
        notas_venta_id: notaVenta.id
      }));

      const { error: pedidosError } = await supabase
        .from('pedidos')
        .insert(pedidosConNotaId);

      if (pedidosError) {
        // Si hay error en pedidos, eliminar la nota de venta creada
        await supabase
          .from('notas_venta')
          .delete()
          .eq('id', notaVenta.id);

        throw pedidosError;
      }
    }

    return notaVenta;
  } catch (error) {
    console.error('Error al crear nota de venta:', error);
    throw error;
  }
};

export const deleteNotaVenta = async (notaVentaId) => {
  try {
    console.log('Iniciando eliminación de nota de venta:', notaVentaId);

    // Paso 1: Obtener los pedidos asociados
    const { data: pedidos, error: pedidosQueryError } = await supabase
      .from('pedidos')
      .select('id')
      .eq('notas_venta_id', notaVentaId);

    if (pedidosQueryError) {
      console.error('Error al consultar pedidos:', pedidosQueryError);
      throw pedidosQueryError;
    }

    console.log(`Encontrados ${pedidos?.length || 0} pedidos asociados`);

    if (pedidos && pedidos.length > 0) {
      const pedidoIds = pedidos.map(p => p.id);

      // Paso 2: Obtener entregas asociadas a los pedidos
      const { data: entregas, error: entregasQueryError } = await supabase
        .from('entregas')
        .select('id')
        .in('pedidos_id', pedidoIds);

      if (entregasQueryError) {
        console.error('Error al consultar entregas:', entregasQueryError);
      }

      if (entregas && entregas.length > 0) {
        const entregaIds = entregas.map(e => e.id);
        console.log(`Encontradas ${entregaIds.length} entregas para eliminar`);

        // Paso 3: Eliminar movimientos de almacén que referencian las entregas
        console.log('Eliminando movimientos de almacén de celofán...');
        const { error: movCelofanError } = await supabase
          .from('almacen_celofan_movimientos')
          .delete()
          .in('entrega_id', entregaIds);

        if (movCelofanError) {
          console.error('Error al eliminar movimientos celofán:', movCelofanError);
        }

        console.log('Eliminando movimientos de almacén de polietileno...');
        const { error: movPolietilenoError } = await supabase
          .from('almacen_polietileno_movimientos')
          .delete()
          .in('entrega_id', entregaIds);

        if (movPolietilenoError) {
          console.error('Error al eliminar movimientos polietileno:', movPolietilenoError);
        }

        // Paso 4: Eliminar entregas
        console.log('Eliminando entregas...');
        const { error: entregasError } = await supabase
          .from('entregas')
          .delete()
          .in('pedidos_id', pedidoIds);

        if (entregasError) {
          console.error('Error al eliminar entregas:', entregasError);
          throw entregasError;
        }
        console.log('Entregas eliminadas exitosamente');
      }

      // Paso 5: Eliminar pedidos asociados
      console.log('Eliminando pedidos asociados...');
      const { error: pedidosError } = await supabase
        .from('pedidos')
        .delete()
        .eq('notas_venta_id', notaVentaId);

      if (pedidosError) {
        console.error('Error al eliminar pedidos:', pedidosError);
        throw pedidosError;
      }
      console.log('Pedidos eliminados exitosamente');
    }

    // Paso 6: Eliminar pagos asociados
    console.log('Eliminando pagos asociados...');
    const { error: pagosError } = await supabase
      .from('pagos')
      .delete()
      .eq('notas_venta_id', notaVentaId);

    if (pagosError) {
      console.error('Error al eliminar pagos:', pagosError);
      // Continuamos porque los pagos pueden no existir
    } else {
      console.log('Pagos eliminados exitosamente');
    }

    // Paso 7: Finalmente, eliminar la nota de venta
    console.log('Eliminando nota de venta...');
    const { error: notaError } = await supabase
      .from('notas_venta')
      .delete()
      .eq('id', notaVentaId);

    if (notaError) {
      console.error('Error al eliminar nota de venta:', notaError);
      throw notaError;
    }

    console.log('Nota de venta eliminada exitosamente');
    return true;

  } catch (error) {
    console.error('Error completo al eliminar nota de venta:', error);
    throw error;
  }
};

// Obtener todas las facturas de un vendedor específico
export const getFacturasByVendedor = async (vendedorId) => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        subtotal,
        iva,
        clientes!inner (
          id,
          empresa,
          nombre_contacto,
          vendedores!inner (
            id,
            nombre
          )
        ),
        pagos (
          importe
        ),
        pedidos (
          id,
          cantidad,
          entregas (
            id,
            cantidad
          )
        )
      `)
      .eq('clientes.vendedores.id', vendedorId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Procesar los datos para agregar información de estado
    const processedData = data?.map(factura => {
      const totalPagado = factura.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
      const saldoPendiente = parseFloat(factura.total || 0) - totalPagado;

      let estadoPago = 'Pendiente';
      if (totalPagado >= parseFloat(factura.total || 0)) {
        estadoPago = 'Pagada';
      } else if (totalPagado > 0) {
        estadoPago = 'Parcial';
      }

      // Verificar si está vencida
      const diasCredito = factura.clientes?.dias_credito || 30;
      const fechaVenta = new Date(factura.fecha);
      const fechaVencimiento = new Date(fechaVenta);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);
      const hoy = new Date();

      if (hoy > fechaVencimiento && saldoPendiente > 0) {
        estadoPago = 'Vencida';
      }

      return {
        ...factura,
        montoPagado: totalPagado,
        saldoPendiente,
        estadoPago,
        cliente: factura.clientes
      };
    }) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener facturas del vendedor:', error);
    throw error;
  }
};

// Función para crear un nuevo pago
export const createPago = async (pagoData) => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pagoData])
      .select(`
        id,
        fecha,
        importe,
        metodo_pago,
        foto_comprobante,
        notas_venta_id
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear pago:', error);
    throw error;
  }
};

// Obtener estadísticas agregadas del año actual
export const getEstadisticasAñoActual = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const añoInicio = `${currentYear}-01-01`;
    const añoFin = `${currentYear}-12-31`;

    // Primera consulta: obtener IDs de notas que cumplen con los filtros de año
    let filterQuery = supabase
      .from('notas_venta_con_estados')
      .select('id', { count: 'exact' })
      .gte('fecha', añoInicio)
      .lte('fecha', añoFin)
      .order('fecha', { ascending: false });

    const { data: filteredIds, error: filterError, count: totalCount } = await filterQuery;

    if (filterError) throw filterError;

    if (!filteredIds || filteredIds.length === 0) {
      return {
        totalNotas: 0,
        pagadasCompleto: 0,
        entregadasCompleto: 0,
        creditoVencido: 0
      };
    }

    // Segunda consulta: obtener los datos completos solo de las notas filtradas
    const ids = filteredIds.map(item => item.id);

    const { data, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        clientes!inner (
          dias_credito,
          vendedores (
            nombre
          )
        ),
        pedidos (
          id,
          cantidad,
          entregas (
            id,
            cantidad
          )
        ),
        pagos (
          importe
        )
      `)
      .in('id', ids)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Procesar datos para calcular los porcentajes y contadores
    let pagadasCompleto = 0;
    let entregadasCompleto = 0;
    let creditoVencido = 0;

    data?.forEach(nota => {
      const totalPagado = nota.pagos?.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0) || 0;
      const porcentajePagado = nota.total > 0 ? (totalPagado / parseFloat(nota.total)) * 100 : 0;

      const totalPedidos = nota.pedidos?.length || 0;
      const pedidosEntregados = nota.pedidos?.filter(pedido => pedido.entregas?.length > 0).length || 0;
      const porcentajeEntregado = totalPedidos > 0 ? (pedidosEntregados / totalPedidos) * 100 : 0;

      const diasCredito = nota.clientes?.dias_credito || 0;
      const fechaLimite = new Date(nota.fecha);
      fechaLimite.setDate(fechaLimite.getDate() + diasCredito);
      const hoy = new Date();
      const diasRestantesCredito = Math.max(0, Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24)));

      // Contar estadísticas
      if (porcentajePagado >= 100) pagadasCompleto++;
      if (porcentajeEntregado >= 100) entregadasCompleto++;
      if (diasRestantesCredito <= 0) creditoVencido++;
    });

    return {
      totalNotas: totalCount || 0,
      pagadasCompleto,
      entregadasCompleto,
      creditoVencido
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del año actual:', error);
    throw error;
  }
};