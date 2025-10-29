import { supabase } from '../supabase';

// Obtener inventario de materia prima por tipo
export const getInventarioMateriaPrima = async (tipo = 'celofan_rollo') => {
  const { data, error } = await supabase
    .from('vista_inventario_materia_prima')
    .select('*')
    .eq('tipo', tipo)
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Obtener lista de materias primas de celofán para formularios
export const getMateriasPrimasCelofan = async () => {
  const { data, error } = await supabase
    .from('materias_primas')
    .select('*')
    .eq('tipo', 'celofan_rollo')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Crear nuevo movimiento de materia prima
export const createMovimientoMateriaPrima = async (movimientoData) => {
  const { data, error } = await supabase
    .from('almacen_materia_prima_movimientos')
    .insert([movimientoData])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};

// Obtener movimientos de materia prima con filtros
export const getMovimientosMateriaPrima = async (filtros = {}) => {
  let query = supabase
    .from('almacen_materia_prima_movimientos')
    .select(`
      *,
      materias_primas (
        nombre,
        tipo,
        unidad_medida
      )
    `)
    .order('fecha', { ascending: false });

  // Aplicar filtros si existen
  if (filtros.materiaPrimaId) {
    query = query.eq('materia_prima_id', filtros.materiaPrimaId);
  }

  if (filtros.fechaDesde) {
    query = query.gte('fecha', filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    query = query.lte('fecha', filtros.fechaHasta);
  }

  if (filtros.movimiento) {
    query = query.eq('movimiento', filtros.movimiento);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

// Validar disponibilidad de stock antes de salida
export const validarDisponibilidadStock = async (materiaPrimaId, cantidadRequerida) => {
  const { data, error } = await supabase
    .rpc('validar_disponibilidad_materia_prima', {
      p_materia_prima_id: materiaPrimaId,
      p_cantidad_requerida: cantidadRequerida
    });

  if (error) {
    throw error;
  }

  return data;
};

// ============================================
// CRUD para Materias Primas (Catálogo)
// ============================================

// Obtener todas las materias primas de celofán
export const getMateriasPrimas = async () => {
  const { data, error } = await supabase
    .from('materias_primas')
    .select('*')
    .eq('tipo', 'celofan_rollo')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Crear nueva materia prima
export const createMateriaPrima = async (materiaPrimaData) => {
  const { data, error } = await supabase
    .from('materias_primas')
    .insert([materiaPrimaData])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};

// Actualizar materia prima
export const updateMateriaPrima = async (id, materiaPrimaData) => {
  const { data, error } = await supabase
    .from('materias_primas')
    .update(materiaPrimaData)
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};

// Validar si una materia prima puede ser eliminada (no tiene movimientos)
export const validateMateriaPrimaForDeletion = async (id) => {
  const { data, error } = await supabase
    .from('almacen_materia_prima_movimientos')
    .select('id')
    .eq('materia_prima_id', id)
    .limit(1);

  if (error) {
    throw error;
  }

  return {
    canDelete: data.length === 0,
    hasMovements: data.length > 0
  };
};

// Eliminar materia prima
export const deleteMateriaPrima = async (id) => {
  // Primero validar si se puede eliminar
  const validation = await validateMateriaPrimaForDeletion(id);

  if (!validation.canDelete) {
    throw new Error(
      'No se puede eliminar esta materia prima porque tiene movimientos registrados en el almacén. ' +
      'Para eliminarla, primero debes eliminar todos sus movimientos de entrada y salida.'
    );
  }

  const { data, error } = await supabase
    .from('materias_primas')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return data;
};

// ============================================
// CRUD para Movimientos de Materia Prima
// ============================================

// Eliminar movimiento de materia prima
export const deleteMovimientoMateriaPrima = async (id) => {
  const { data, error } = await supabase
    .from('almacen_materia_prima_movimientos')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return data;
};

// Actualizar movimiento de materia prima
export const updateMovimientoMateriaPrima = async (id, movimientoData) => {
  const { data, error } = await supabase
    .from('almacen_materia_prima_movimientos')
    .update(movimientoData)
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};