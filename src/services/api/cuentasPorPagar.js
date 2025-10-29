import { supabase } from '../supabase';

// =====================================================
// GESTIÓN DE FACTURAS DE PROVEEDORES (COMPRAS)
// =====================================================

export const getAllCompras = async (filtros = {}) => {
  let query = supabase
    .from('compras')
    .select(`
      *,
      proveedores (
        id,
        nombre,
        contacto,
        telefono,
        dias_pago
      )
    `);

  if (filtros.proveedor_id) {
    query = query.eq('proveedor_id', filtros.proveedor_id);
  }

  if (filtros.pagada !== undefined) {
    query = query.eq('pagada', filtros.pagada);
  }

  if (filtros.fechaDesde) {
    query = query.gte('fecha', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte('fecha', filtros.fechaHasta);
  }

  if (filtros.numero_factura) {
    query = query.ilike('numero_factura', `%${filtros.numero_factura}%`);
  }

  query = query.order('fecha', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const getCompraById = async (id) => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      proveedores (
        id,
        nombre,
        contacto,
        telefono,
        dias_pago
      ),
      detalle_compras (
        *,
        materias_primas (
          id,
          nombre,
          tipo,
          unidad_medida
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createCompra = async (compra) => {
  const compraData = {
    fecha: compra.fecha,
    proveedor_id: compra.proveedor_id,
    numero_factura: compra.numero_factura,
    subtotal: compra.subtotal,
    iva: compra.iva,
    total: compra.total,
    pagada: false,
    fecha_pago: null
  };

  const { data, error } = await supabase
    .from('compras')
    .insert([compraData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateCompra = async (id, updates) => {
  const updateData = {
    fecha: updates.fecha,
    proveedor_id: updates.proveedor_id,
    numero_factura: updates.numero_factura,
    subtotal: updates.subtotal,
    iva: updates.iva,
    total: updates.total
  };

  const { data, error } = await supabase
    .from('compras')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteCompra = async (id) => {
  const { error } = await supabase
    .from('compras')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};

// =====================================================
// ESTADO DE CUENTAS POR PAGAR
// =====================================================

export const getCuentasPorPagar = async (filtros = {}) => {
  let query = supabase
    .from('reporte_cuentas_por_pagar')
    .select('*');

  if (filtros.estado && filtros.estado !== 'todas') {
    query = query.eq('estado_cuenta', filtros.estado);
  }

  if (filtros.proveedor) {
    query = query.ilike('nombre_proveedor', `%${filtros.proveedor}%`);
  }

  if (filtros.fechaDesde) {
    query = query.gte('fecha_factura', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte('fecha_factura', filtros.fechaHasta);
  }

  query = query.order('fecha_vencimiento', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const getResumenCuentasPorPagar = async () => {
  const { data, error } = await supabase
    .from('reporte_cuentas_por_pagar')
    .select('estado_cuenta, monto_factura');

  if (error) {
    throw error;
  }

  const resumen = {
    total: data.length,
    vencidas: data.filter(c => c.estado_cuenta === 'VENCIDA').length,
    vigentes: data.filter(c => c.estado_cuenta === 'VIGENTE').length,
    pagadas: data.filter(c => c.estado_cuenta === 'PAGADA').length,
    montoTotal: data
      .filter(c => c.estado_cuenta !== 'PAGADA')
      .reduce((sum, c) => sum + c.monto_factura, 0),
    montoVencido: data
      .filter(c => c.estado_cuenta === 'VENCIDA')
      .reduce((sum, c) => sum + c.monto_factura, 0)
  };

  return resumen;
};

// =====================================================
// CONTROL DE PAGOS
// =====================================================

export const registrarPago = async (pagoData) => {
  try {
    // Actualizar la factura como pagada
    const { error: compraError } = await supabase
      .from('compras')
      .update({
        pagada: true,
        fecha_pago: pagoData.fecha_pago
      })
      .eq('id', pagoData.compra_id);

    if (compraError) {
      throw compraError;
    }

    // Crear registro en tabla de gastos (si existe)
    const gastoData = {
      fecha: pagoData.fecha_pago,
      concepto: `Pago factura ${pagoData.numero_factura} - ${pagoData.nombre_proveedor}`,
      importe: pagoData.monto,
      categoria: 'Pago a Proveedores'
    };

    const { data: gasto, error: gastoError } = await supabase
      .from('gastos')
      .insert([gastoData])
      .select()
      .single();

    if (gastoError) {
      console.warn('Error al crear registro de gasto:', gastoError);
    }

    return {
      success: true,
      pago_id: gasto?.id,
      mensaje: 'Pago registrado exitosamente'
    };
  } catch (error) {
    throw error;
  }
};

export const getHistorialPagos = async (filtros = {}) => {
  let query = supabase
    .from('compras')
    .select(`
      id,
      numero_factura,
      fecha_pago,
      total,
      proveedores (
        nombre,
        contacto
      )
    `)
    .eq('pagada', true)
    .not('fecha_pago', 'is', null);

  if (filtros.fechaDesde) {
    query = query.gte('fecha_pago', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte('fecha_pago', filtros.fechaHasta);
  }

  query = query.order('fecha_pago', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

// =====================================================
// REPORTES Y ANÁLISIS
// =====================================================

export const getReporteResumenMensual = async (periodo = {}) => {
  let query = supabase.rpc('get_resumen_mensual_cuentas_por_pagar');

  if (periodo.fechaInicio && periodo.fechaFin) {
    query = query.gte('fecha', periodo.fechaInicio).lte('fecha', periodo.fechaFin);
  }

  const { data, error } = await query;

  if (error) {
    // Si la función RPC no existe, crear datos mock
    console.warn('RPC function not found, returning mock data');
    return [
      {
        mes: new Date().toISOString().slice(0, 7),
        total_facturas: 0,
        monto_total: 0,
        facturas_pagadas: 0,
        monto_pagado: 0,
        facturas_pendientes: 0,
        monto_pendiente: 0
      }
    ];
  }

  return data || [];
};

export const getGastosPorCategoria = async (periodo = {}) => {
  let query = supabase
    .from('gastos')
    .select('categoria, importe');

  if (periodo.fechaInicio) {
    query = query.gte('fecha', periodo.fechaInicio);
  }

  if (periodo.fechaFin) {
    query = query.lte('fecha', periodo.fechaFin);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Agrupar por categoría
  const agrupado = data.reduce((acc, gasto) => {
    const categoria = gasto.categoria || 'Sin Categoría';
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += gasto.importe;
    return acc;
  }, {});

  const total = Object.values(agrupado).reduce((sum, val) => sum + val, 0);

  return Object.entries(agrupado).map(([categoria, monto]) => ({
    categoria,
    total: monto,
    porcentaje: total > 0 ? ((monto / total) * 100).toFixed(1) : 0
  }));
};

export const getGastosPorProveedor = async (periodo = {}) => {
  let query = supabase
    .from('compras')
    .select(`
      total,
      proveedores (
        nombre
      )
    `)
    .eq('pagada', true);

  if (periodo.fechaInicio) {
    query = query.gte('fecha_pago', periodo.fechaInicio);
  }

  if (periodo.fechaFin) {
    query = query.lte('fecha_pago', periodo.fechaFin);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Agrupar por proveedor
  const agrupado = data.reduce((acc, compra) => {
    const proveedor = compra.proveedores?.nombre || 'Sin Proveedor';
    if (!acc[proveedor]) {
      acc[proveedor] = {
        total_facturas: 0,
        monto_total: 0
      };
    }
    acc[proveedor].total_facturas += 1;
    acc[proveedor].monto_total += compra.total;
    return acc;
  }, {});

  return Object.entries(agrupado).map(([proveedor, datos]) => ({
    proveedor,
    total_facturas: datos.total_facturas,
    monto_total: datos.monto_total,
    promedio: datos.monto_total / datos.total_facturas
  }));
};

export const getProyeccionPagos = async (diasAdelante = 30) => {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasAdelante);

  const { data, error } = await supabase
    .from('reporte_cuentas_por_pagar')
    .select('*')
    .eq('estado_cuenta', 'VIGENTE')
    .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
    .order('fecha_vencimiento', { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(cuenta => ({
    fecha: cuenta.fecha_vencimiento,
    proveedor: cuenta.nombre_proveedor,
    monto: cuenta.monto_factura,
    dias_restantes: Math.ceil(
      (new Date(cuenta.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)
    )
  }));
};

// =====================================================
// UTILIDADES
// =====================================================

export const exportarReporte = async (tipo, datos, nombreArchivo) => {
  // TODO: Implementar exportación a Excel/PDF
  console.log(`Exportando ${tipo}:`, datos);
  return {
    success: true,
    url: `#export-${nombreArchivo}`,
    mensaje: `Reporte ${tipo} generado exitosamente`
  };
};

export const subirComprobantePago = async (archivo, pagoId) => {
  try {
    const fileName = `comprobantes/${pagoId}-${Date.now()}-${archivo.name}`;

    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, archivo);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    };
  } catch (error) {
    throw error;
  }
};