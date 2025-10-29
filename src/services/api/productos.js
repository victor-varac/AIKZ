import { supabase } from '../supabase';

export const getProductosPorMaterial = async (material, params = {}) => {
  const { offset = 0, limit = 15, filtros = {} } = params;

  let query = supabase
    .from('productos')
    .select('*')
    .eq('material', material)
    .order('nombre', { ascending: true });

  // Aplicar filtros
  if (filtros.presentacion) {
    query = query.eq('presentacion', filtros.presentacion);
  }

  if (filtros.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros.nombre) {
    query = query.ilike('nombre', `%${filtros.nombre}%`);
  }

  if (filtros.anchoMinimo) {
    query = query.gte('ancho_cm', filtros.anchoMinimo);
  }

  if (filtros.anchoMaximo) {
    query = query.lte('ancho_cm', filtros.anchoMaximo);
  }

  if (filtros.largoMinimo) {
    query = query.gte('largo_cm', filtros.largoMinimo);
  }

  if (filtros.largoMaximo) {
    query = query.lte('largo_cm', filtros.largoMaximo);
  }

  if (filtros.micrajeMinimo) {
    query = query.gte('micraje_um', filtros.micrajeMinimo);
  }

  if (filtros.micrajeMaximo) {
    query = query.lte('micraje_um', filtros.micrajeMaximo);
  }

  // Paginación
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

export const getProductosCount = async (material, filtros = {}) => {
  let query = supabase
    .from('productos')
    .select('id', { count: 'exact', head: true })
    .eq('material', material);

  // Aplicar mismos filtros
  if (filtros.presentacion) {
    query = query.eq('presentacion', filtros.presentacion);
  }

  if (filtros.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros.nombre) {
    query = query.ilike('nombre', `%${filtros.nombre}%`);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count;
};

export const createProducto = async (productoData) => {
  const { data, error } = await supabase
    .from('productos')
    .insert([productoData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateProducto = async (id, productoData) => {
  const { data, error } = await supabase
    .from('productos')
    .update(productoData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteProducto = async (id) => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};

// Obtener stock actual de un producto (requiere JOIN con almacén)
export const getStockProducto = async (productoId, material) => {
  let tableName = '';
  let campoStock = '';

  if (material === 'celofan') {
    tableName = 'almacen_celofan_movimientos';
    campoStock = 'millares';
  } else if (material === 'polietileno') {
    tableName = 'almacen_polietileno_movimientos';
    campoStock = 'kilos';
  } else {
    throw new Error('Material no válido');
  }

  const { data, error } = await supabase
    .from(tableName)
    .select(`${campoStock}, movimiento`)
    .eq('producto_id', productoId);

  if (error) {
    throw error;
  }

  // Calcular stock actual
  let stockActual = 0;
  data?.forEach(movimiento => {
    if (movimiento.movimiento === 'entrada') {
      stockActual += parseFloat(movimiento[campoStock] || 0);
    } else {
      stockActual -= parseFloat(movimiento[campoStock] || 0);
    }
  });

  return stockActual;
};