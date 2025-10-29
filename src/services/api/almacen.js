import { supabase } from '../supabase';

// Obtener inventario actual de celof�n
export const getInventarioCelofan = async () => {
  try {
    const { data, error } = await supabase
      .from('vista_inventario_celofan')
      .select('*')
      .order('producto');

    if (error) throw error;

    // Mapear stock_cares a stock_millares para mantener compatibilidad
    const processedData = data?.map(item => ({
      ...item,
      stock_millares: item.stock_cares || 0
    })) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener inventario de celofán:', error);
    throw error;
  }
};

// Obtener movimientos de celof�n con filtros
export const getMovimientosCelofan = async (filtros = {}) => {
  try {
    let query = supabase
      .from('almacen_celofan_movimientos')
      .select(`
        id,
        fecha,
        millares,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .order('fecha', { ascending: false });

    // Aplicar filtros
    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    if (filtros.tipoMovimiento) {
      query = query.eq('movimiento', filtros.tipoMovimiento);
    }


    const { data, error } = await query;

    if (error) throw error;

    // Procesar datos para agregar información básica
    const processedData = data?.map(movimiento => ({
      ...movimiento,
      cliente: null, // Por ahora, se puede mejorar después
      producto: `Producto ID: ${movimiento.producto_id}` // Temporal hasta resolver las relaciones
    })) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener movimientos de celof�n:', error);
    throw error;
  }
};

// Crear nuevo movimiento de celof�n
export const createMovimientoCelofan = async (movimientoData) => {
  try {
    const { data, error } = await supabase
      .from('almacen_celofan_movimientos')
      .insert([movimientoData])
      .select(`
        id,
        fecha,
        millares,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear movimiento de celof�n:', error);
    throw error;
  }
};

// Obtener productos de celof�n para formularios
export const getProductosCelofan = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('material', 'celofan')
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener productos de celof�n:', error);
    throw error;
  }
};

// Obtener entregas pendientes para salidas
export const getEntregasPendientes = async () => {
  try {
    const { data, error } = await supabase
      .from('entregas')
      .select(`
        id,
        fecha_entrega,
        cantidad,
        pedidos (
          productos (
            nombre
          ),
          notas_venta (
            clientes (
              empresa
            )
          )
        )
      `)
      .order('fecha_entrega');

    if (error) throw error;

    // Procesar datos para mostrar informaci�n �til
    const processedData = data?.map(entrega => ({
      ...entrega,
      cliente: entrega.pedidos?.notas_venta?.clientes?.empresa || 'Cliente no encontrado',
      producto: entrega.pedidos?.productos?.nombre || 'Producto no encontrado'
    })) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener entregas pendientes:', error);
    throw error;
  }
};

// Obtener notas de venta con productos de celofán para entregas
export const getNotasVentaCelofan = async () => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        clientes (
          id,
          empresa,
          nombre_contacto
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
            micraje_um
          ),
          entregas (
            id,
            cantidad,
            fecha_entrega
          )
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Filtrar solo notas que tienen productos de celofán
    const notasCelofan = data?.filter(nota =>
      nota.pedidos?.some(pedido =>
        pedido.productos?.material === 'celofan'
      )
    ) || [];

    // Procesar datos para agregar información de estado de entregas
    const processedData = notasCelofan.map(nota => {
      // Filtrar solo pedidos de celofán
      const pedidosCelofan = nota.pedidos?.filter(pedido =>
        pedido.productos?.material === 'celofan'
      ) || [];

      // Calcular totales de entregas
      const totalPedido = pedidosCelofan.reduce((sum, pedido) => sum + (pedido.cantidad || 0), 0);
      const totalEntregado = pedidosCelofan.reduce((sum, pedido) => {
        const entregado = pedido.entregas?.reduce((entSum, entrega) => entSum + (entrega.cantidad || 0), 0) || 0;
        return sum + entregado;
      }, 0);

      const porcentajeEntregado = totalPedido > 0 ? (totalEntregado / totalPedido) * 100 : 0;

      let estadoEntrega = 'pendiente';
      if (porcentajeEntregado >= 100) {
        estadoEntrega = 'completo';
      } else if (totalEntregado > 0) {
        estadoEntrega = 'parcial';
      }

      return {
        ...nota,
        pedidos: pedidosCelofan,
        estadisticas: {
          totalPedido,
          totalEntregado,
          totalPendiente: totalPedido - totalEntregado,
          porcentajeEntregado: Math.min(100, Math.max(0, porcentajeEntregado)),
          estadoEntrega
        }
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error al obtener notas de venta de celofán:', error);
    throw error;
  }
};

// Entregar todo - Marcar todos los pedidos pendientes como entregados
export const entregarTodo = async (notaVentaId) => {
  try {
    // Obtener todos los pedidos pendientes de la nota de venta con información del producto
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        cantidad,
        productos_id,
        productos (
          id,
          material
        ),
        entregas (
          cantidad
        )
      `)
      .eq('notas_venta_id', notaVentaId);

    if (pedidosError) throw pedidosError;

    // Crear entregas para completar cada pedido
    const nuevasEntregas = [];
    const fechaEntrega = new Date().toISOString().split('T')[0];

    for (const pedido of pedidos) {
      const totalEntregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
      const cantidadPendiente = (pedido.cantidad || 0) - totalEntregado;

      if (cantidadPendiente > 0) {
        nuevasEntregas.push({
          pedidos_id: pedido.id,
          cantidad: cantidadPendiente,
          fecha_entrega: fechaEntrega
        });
      }
    }

    if (nuevasEntregas.length > 0) {
      const { data: entregasCreadas, error } = await supabase
        .from('entregas')
        .insert(nuevasEntregas)
        .select();

      if (error) throw error;

      // Crear movimientos de salida en almacén para cada entrega
      const movimientosAlmacen = [];

      for (let i = 0; i < entregasCreadas.length; i++) {
        const entrega = entregasCreadas[i];
        const pedido = pedidos.find(p => p.id === nuevasEntregas[i].pedidos_id);

        if (pedido?.productos?.material === 'celofan') {
          movimientosAlmacen.push({
            fecha: fechaEntrega,
            producto_id: pedido.productos_id,
            millares: entrega.cantidad,
            movimiento: 'salida',
            entrega_id: entrega.id
          });
        } else if (pedido?.productos?.material === 'polietileno') {
          movimientosAlmacen.push({
            fecha: fechaEntrega,
            producto_id: pedido.productos_id,
            kilos: entrega.cantidad,
            movimiento: 'salida',
            entrega_id: entrega.id
          });
        }
      }

      // Insertar movimientos en las tablas correspondientes
      const movimientosCelofan = movimientosAlmacen.filter(m => m.millares !== undefined);
      const movimientosPolietileno = movimientosAlmacen.filter(m => m.kilos !== undefined);

      if (movimientosCelofan.length > 0) {
        const { error: errorCelofan } = await supabase
          .from('almacen_celofan_movimientos')
          .insert(movimientosCelofan);
        if (errorCelofan) throw errorCelofan;
      }

      if (movimientosPolietileno.length > 0) {
        const { error: errorPolietileno } = await supabase
          .from('almacen_polietileno_movimientos')
          .insert(movimientosPolietileno);
        if (errorPolietileno) throw errorPolietileno;
      }

      return entregasCreadas;
    }

    return [];
  } catch (error) {
    console.error('Error al entregar todo:', error);
    throw error;
  }
};

// Registrar entregas parciales específicas
export const registrarEntregasParciales = async (entregas) => {
  try {
    const fechaEntrega = new Date().toISOString().split('T')[0];

    // Preparar datos de entregas con fecha
    const entregasConFecha = entregas.map(entrega => ({
      ...entrega,
      fecha_entrega: entrega.fecha_entrega || fechaEntrega
    }));

    const { data: entregasCreadas, error } = await supabase
      .from('entregas')
      .insert(entregasConFecha)
      .select();

    if (error) throw error;

    // Obtener información de los pedidos para crear movimientos de almacén
    const pedidosIds = entregasCreadas.map(e => e.pedidos_id);
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select(`
        id,
        productos_id,
        productos (
          id,
          material
        )
      `)
      .in('id', pedidosIds);

    if (pedidosError) throw pedidosError;

    // Crear movimientos de salida en almacén para cada entrega
    const movimientosAlmacen = [];

    for (const entrega of entregasCreadas) {
      const pedido = pedidos.find(p => p.id === entrega.pedidos_id);

      if (pedido?.productos?.material === 'celofan') {
        movimientosAlmacen.push({
          fecha: entrega.fecha_entrega,
          producto_id: pedido.productos_id,
          millares: entrega.cantidad,
          movimiento: 'salida',
          entrega_id: entrega.id
        });
      } else if (pedido?.productos?.material === 'polietileno') {
        movimientosAlmacen.push({
          fecha: entrega.fecha_entrega,
          producto_id: pedido.productos_id,
          kilos: entrega.cantidad,
          movimiento: 'salida',
          entrega_id: entrega.id
        });
      }
    }

    // Insertar movimientos en las tablas correspondientes
    const movimientosCelofan = movimientosAlmacen.filter(m => m.millares !== undefined);
    const movimientosPolietileno = movimientosAlmacen.filter(m => m.kilos !== undefined);

    if (movimientosCelofan.length > 0) {
      const { error: errorCelofan } = await supabase
        .from('almacen_celofan_movimientos')
        .insert(movimientosCelofan);
      if (errorCelofan) throw errorCelofan;
    }

    if (movimientosPolietileno.length > 0) {
      const { error: errorPolietileno } = await supabase
        .from('almacen_polietileno_movimientos')
        .insert(movimientosPolietileno);
      if (errorPolietileno) throw errorPolietileno;
    }

    return entregasCreadas;
  } catch (error) {
    console.error('Error al registrar entregas parciales:', error);
    throw error;
  }
};

// Obtener entradas de celofán agrupadas por producto
export const getEntradasCelofanPorProducto = async () => {
  try {
    // Obtener todos los movimientos de entrada de celofán
    const { data: movimientos, error: movimientosError } = await supabase
      .from('almacen_celofan_movimientos')
      .select(`
        id,
        fecha,
        millares,
        produccion_id,
        producto_id,
        maquina,
        operador
      `)
      .eq('movimiento', 'entrada')
      .order('fecha', { ascending: false });

    if (movimientosError) throw movimientosError;

    // Obtener información de productos de celofán
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .eq('material', 'celofan')
      .order('nombre');

    if (productosError) throw productosError;

    // Agrupar movimientos por producto
    const entradasPorProducto = productos?.map(producto => {
      const entradasProducto = movimientos?.filter(mov => mov.producto_id === producto.id) || [];

      // Calcular estadísticas
      const totalEntradas = entradasProducto.length;
      const totalMillares = entradasProducto.reduce((sum, entrada) => sum + (entrada.millares || 0), 0);
      const ultimaEntrada = entradasProducto[0]; // Ya está ordenado por fecha descendente

      return {
        producto,
        entradas: entradasProducto,
        estadisticas: {
          totalEntradas,
          totalMillares,
          ultimaEntrada: ultimaEntrada ? {
            fecha: ultimaEntrada.fecha,
            millares: ultimaEntrada.millares,
            produccion_id: ultimaEntrada.produccion_id
          } : null,
          promedioEntrada: totalEntradas > 0 ? totalMillares / totalEntradas : 0
        }
      };
    }) || [];

    // Ordenar por total de millares descendente
    entradasPorProducto.sort((a, b) => b.estadisticas.totalMillares - a.estadisticas.totalMillares);

    return entradasPorProducto;
  } catch (error) {
    console.error('Error al obtener entradas de celofán por producto:', error);
    throw error;
  }
};

// Editar movimiento de celofán existente
export const updateMovimientoCelofan = async (movimientoId, movimientoData) => {
  try {
    const { data, error } = await supabase
      .from('almacen_celofan_movimientos')
      .update(movimientoData)
      .eq('id', movimientoId)
      .select(`
        id,
        fecha,
        millares,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar movimiento de celofán:', error);
    throw error;
  }
};

// Eliminar movimiento de celofán
export const deleteMovimientoCelofan = async (movimientoId) => {
  try {
    const { error } = await supabase
      .from('almacen_celofan_movimientos')
      .delete()
      .eq('id', movimientoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar movimiento de celofán:', error);
    throw error;
  }
};

// Actualizar stock despu�s de movimiento (esto deber�a manejarse por trigger en la BD)
export const actualizarStockCelofan = async (productoId, cantidad, tipoMovimiento) => {
  try {
    // Esta funci�n puede ser �til para validaciones o actualizaciones manuales
    // Normalmente el stock se actualiza autom�ticamente por triggers en la base de datos

    const { data: producto, error: getError } = await supabase
      .from('productos')
      .select('stock_millares')
      .eq('id', productoId)
      .single();

    if (getError) throw getError;

    const nuevoStock = tipoMovimiento === 'entrada'
      ? producto.stock_millares + cantidad
      : producto.stock_millares - cantidad;

    const { data, error } = await supabase
      .from('productos')
      .update({ stock_millares: Math.max(0, nuevoStock) })
      .eq('id', productoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar stock de celof�n:', error);
    throw error;
  }
};

// ===============================
// FUNCIONES PARA POLIETILENO
// ===============================

// Obtener inventario actual de polietileno
export const getInventarioPolietileno = async () => {
  try {
    const { data, error } = await supabase
      .from('vista_inventario_polietileno')
      .select('*')
      .order('producto');

    if (error) throw error;

    // Mapear stock_kilos a stock_millares para mantener compatibilidad con la UI
    // (En polietileno se mide en kg, pero mantenemos el nombre millares por compatibilidad)
    const processedData = data?.map(item => ({
      ...item,
      stock_millares: item.stock_kilos || 0
    })) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener inventario de polietileno:', error);
    throw error;
  }
};

// Obtener movimientos de polietileno con filtros
export const getMovimientosPolietileno = async (filtros = {}) => {
  try {
    let query = supabase
      .from('almacen_polietileno_movimientos')
      .select(`
        id,
        fecha,
        kilos,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .order('fecha', { ascending: false });

    // Aplicar filtros
    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    if (filtros.tipoMovimiento) {
      query = query.eq('movimiento', filtros.tipoMovimiento);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Procesar datos para agregar información básica
    const processedData = data?.map(movimiento => ({
      ...movimiento,
      millares: movimiento.kilos, // Mapear kilos a millares para compatibilidad con UI
      cliente: null, // Por ahora, se puede mejorar después
      producto: `Producto ID: ${movimiento.producto_id}` // Temporal hasta resolver las relaciones
    })) || [];

    return processedData;
  } catch (error) {
    console.error('Error al obtener movimientos de polietileno:', error);
    throw error;
  }
};

// Crear nuevo movimiento de polietileno
export const createMovimientoPolietileno = async (movimientoData) => {
  try {
    const { data, error } = await supabase
      .from('almacen_polietileno_movimientos')
      .insert([movimientoData])
      .select(`
        id,
        fecha,
        kilos,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear movimiento de polietileno:', error);
    throw error;
  }
};

// Obtener productos de polietileno para formularios
export const getProductosPolietileno = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('material', 'polietileno')
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener productos de polietileno:', error);
    throw error;
  }
};

// Obtener notas de venta con productos de polietileno para entregas
export const getNotasVentaPolietileno = async () => {
  try {
    const { data, error } = await supabase
      .from('notas_venta')
      .select(`
        id,
        numero_factura,
        fecha,
        total,
        clientes (
          id,
          empresa,
          nombre_contacto
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
            micraje_um
          ),
          entregas (
            id,
            cantidad,
            fecha_entrega
          )
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;

    // Filtrar solo notas que tienen productos de polietileno
    const notasPolietileno = data?.filter(nota =>
      nota.pedidos?.some(pedido =>
        pedido.productos?.material === 'polietileno'
      )
    ) || [];

    // Procesar datos para agregar información de estado de entregas
    const processedData = notasPolietileno.map(nota => {
      // Filtrar solo pedidos de polietileno
      const pedidosPolietileno = nota.pedidos?.filter(pedido =>
        pedido.productos?.material === 'polietileno'
      ) || [];

      // Calcular totales de entregas
      const totalPedido = pedidosPolietileno.reduce((sum, pedido) => sum + (pedido.cantidad || 0), 0);
      const totalEntregado = pedidosPolietileno.reduce((sum, pedido) => {
        const entregado = pedido.entregas?.reduce((entSum, entrega) => entSum + (entrega.cantidad || 0), 0) || 0;
        return sum + entregado;
      }, 0);

      const porcentajeEntregado = totalPedido > 0 ? (totalEntregado / totalPedido) * 100 : 0;

      let estadoEntrega = 'pendiente';
      if (porcentajeEntregado >= 100) {
        estadoEntrega = 'completo';
      } else if (totalEntregado > 0) {
        estadoEntrega = 'parcial';
      }

      return {
        ...nota,
        pedidos: pedidosPolietileno,
        estadisticas: {
          totalPedido,
          totalEntregado,
          totalPendiente: totalPedido - totalEntregado,
          porcentajeEntregado: Math.min(100, Math.max(0, porcentajeEntregado)),
          estadoEntrega
        }
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error al obtener notas de venta de polietileno:', error);
    throw error;
  }
};

// Entregar todo para polietileno - Marcar todos los pedidos pendientes como entregados
export const entregarTodoPolietileno = async (notaVentaId) => {
  try {
    // Usar la función genérica que ya maneja movimientos de almacén
    return await entregarTodo(notaVentaId);
  } catch (error) {
    console.error('Error al entregar todo polietileno:', error);
    throw error;
  }
};

// Registrar entregas parciales específicas para polietileno
export const registrarEntregasParcialesPolietileno = async (entregas) => {
  try {
    // Usar la función genérica que ya maneja movimientos de almacén
    return await registrarEntregasParciales(entregas);
  } catch (error) {
    console.error('Error al registrar entregas parciales de polietileno:', error);
    throw error;
  }
};

// Obtener entradas de polietileno agrupadas por producto
export const getEntradasPolietilenoPorProducto = async () => {
  try {
    // Obtener todos los movimientos de entrada de polietileno
    const { data: movimientos, error: movimientosError } = await supabase
      .from('almacen_polietileno_movimientos')
      .select(`
        id,
        fecha,
        kilos,
        produccion_id,
        producto_id,
        maquina,
        operador
      `)
      .eq('movimiento', 'entrada')
      .order('fecha', { ascending: false });

    if (movimientosError) throw movimientosError;

    // Obtener información de productos de polietileno
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .eq('material', 'polietileno')
      .order('nombre');

    if (productosError) throw productosError;

    // Agrupar movimientos por producto
    const entradasPorProducto = productos?.map(producto => {
      const entradasProducto = movimientos?.filter(mov => mov.producto_id === producto.id) || [];

      // Mapear kilos a millares para compatibilidad con UI
      const entradasConMillares = entradasProducto.map(entrada => ({
        ...entrada,
        millares: entrada.kilos
      }));

      // Calcular estadísticas
      const totalEntradas = entradasConMillares.length;
      const totalMillares = entradasConMillares.reduce((sum, entrada) => sum + (entrada.millares || 0), 0);
      const ultimaEntrada = entradasConMillares[0]; // Ya está ordenado por fecha descendente

      return {
        producto,
        entradas: entradasConMillares,
        estadisticas: {
          totalEntradas,
          totalMillares,
          ultimaEntrada: ultimaEntrada ? {
            fecha: ultimaEntrada.fecha,
            millares: ultimaEntrada.millares,
            produccion_id: ultimaEntrada.produccion_id
          } : null,
          promedioEntrada: totalEntradas > 0 ? totalMillares / totalEntradas : 0
        }
      };
    }) || [];

    // Ordenar por total de millares descendente
    entradasPorProducto.sort((a, b) => b.estadisticas.totalMillares - a.estadisticas.totalMillares);

    return entradasPorProducto;
  } catch (error) {
    console.error('Error al obtener entradas de polietileno por producto:', error);
    throw error;
  }
};

// Editar movimiento de polietileno existente
export const updateMovimientoPolietileno = async (movimientoId, movimientoData) => {
  try {
    // Convertir millares a kilos para la base de datos
    const dbData = {
      ...movimientoData,
      kilos: movimientoData.millares // La UI envía millares, pero DB usa kilos
    };
    delete dbData.millares;

    const { data, error } = await supabase
      .from('almacen_polietileno_movimientos')
      .update(dbData)
      .eq('id', movimientoId)
      .select(`
        id,
        fecha,
        kilos,
        movimiento,
        produccion_id,
        entrega_id,
        producto_id,
        maquina,
        operador
      `)
      .single();

    if (error) throw error;

    // Mapear kilos de vuelta a millares para la UI
    return {
      ...data,
      millares: data.kilos
    };
  } catch (error) {
    console.error('Error al actualizar movimiento de polietileno:', error);
    throw error;
  }
};

// Eliminar movimiento de polietileno
export const deleteMovimientoPolietileno = async (movimientoId) => {
  try {
    const { error } = await supabase
      .from('almacen_polietileno_movimientos')
      .delete()
      .eq('id', movimientoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar movimiento de polietileno:', error);
    throw error;
  }
};

// Actualizar stock de polietileno después de movimiento
export const actualizarStockPolietileno = async (productoId, cantidad, tipoMovimiento) => {
  try {
    // Esta función puede ser útil para validaciones o actualizaciones manuales
    // Normalmente el stock se actualiza automáticamente por triggers en la base de datos

    const { data: producto, error: getError } = await supabase
      .from('productos')
      .select('stock_millares')
      .eq('id', productoId)
      .single();

    if (getError) throw getError;

    const nuevoStock = tipoMovimiento === 'entrada'
      ? producto.stock_millares + cantidad
      : producto.stock_millares - cantidad;

    const { data, error } = await supabase
      .from('productos')
      .update({ stock_millares: Math.max(0, nuevoStock) })
      .eq('id', productoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar stock de polietileno:', error);
    throw error;
  }
};

// ===============================
// FUNCIONES PARA EDITAR ENTREGAS
// ===============================

// Actualizar una entrega específica
export const actualizarEntrega = async (entregaId, datosActualizados) => {
  try {
    const { data, error } = await supabase
      .from('entregas')
      .update(datosActualizados)
      .eq('id', entregaId)
      .select(`
        *,
        pedidos (
          id,
          productos_id,
          productos (
            id,
            material
          )
        )
      `)
      .single();

    if (error) throw error;

    // Actualizar el movimiento de almacén correspondiente si existe
    if (data.pedidos?.productos?.material) {
      const material = data.pedidos.productos.material;
      const tabla = material === 'celofan' ? 'almacen_celofan_movimientos' : 'almacen_polietileno_movimientos';
      const columna = material === 'celofan' ? 'millares' : 'kilos';

      const movimientoUpdate = {
        fecha: datosActualizados.fecha_entrega || data.fecha_entrega,
        [columna]: datosActualizados.cantidad || data.cantidad
      };

      const { error: movimientoError } = await supabase
        .from(tabla)
        .update(movimientoUpdate)
        .eq('entrega_id', entregaId);

      if (movimientoError) {
        console.warn('Error al actualizar movimiento de almacén:', movimientoError);
        // No lanzamos el error para no bloquear la actualización de la entrega
      }
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar entrega:', error);
    throw error;
  }
};

// Eliminar una entrega y su movimiento de almacén correspondiente
export const eliminarEntrega = async (entregaId) => {
  try {
    // Primero obtener información de la entrega para saber qué movimiento eliminar
    const { data: entrega, error: entregaError } = await supabase
      .from('entregas')
      .select(`
        *,
        pedidos (
          id,
          productos_id,
          productos (
            id,
            material
          )
        )
      `)
      .eq('id', entregaId)
      .single();

    if (entregaError) throw entregaError;

    // Eliminar el movimiento de almacén correspondiente
    if (entrega.pedidos?.productos?.material) {
      const material = entrega.pedidos.productos.material;
      const tabla = material === 'celofan' ? 'almacen_celofan_movimientos' : 'almacen_polietileno_movimientos';

      const { error: movimientoError } = await supabase
        .from(tabla)
        .delete()
        .eq('entrega_id', entregaId);

      if (movimientoError) {
        console.warn('Error al eliminar movimiento de almacén:', movimientoError);
        // Continuamos con la eliminación de la entrega
      }
    }

    // Eliminar la entrega
    const { error: deleteError } = await supabase
      .from('entregas')
      .delete()
      .eq('id', entregaId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Error al eliminar entrega:', error);
    throw error;
  }
};

// Procesar múltiples cambios de entregas
export const procesarCambiosEntregas = async (cambiosEntregas) => {
  try {
    const resultados = [];

    for (const [entregaId, cambios] of Object.entries(cambiosEntregas)) {
      if (!cambios || Object.keys(cambios).length === 0) continue;

      if (cambios.eliminar) {
        // Eliminar entrega
        await eliminarEntrega(parseInt(entregaId));
        resultados.push({ entregaId, accion: 'eliminada' });
      } else {
        // Actualizar entrega
        const datosUpdate = {};
        if (cambios.cantidad !== undefined) datosUpdate.cantidad = cambios.cantidad;
        if (cambios.fecha_entrega !== undefined) datosUpdate.fecha_entrega = cambios.fecha_entrega;

        if (Object.keys(datosUpdate).length > 0) {
          await actualizarEntrega(parseInt(entregaId), datosUpdate);
          resultados.push({ entregaId, accion: 'actualizada', cambios: datosUpdate });
        }
      }
    }

    return resultados;
  } catch (error) {
    console.error('Error al procesar cambios de entregas:', error);
    throw error;
  }
};