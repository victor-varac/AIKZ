import { supabase } from '../supabase';

// Tipos de materia prima de polietileno
const TIPOS_POLIETILENO = ['resina_virgen_natural', 'resina_virgen_color', 'arana_bolsas', 'pellet_reciclado'];

// Obtener inventario de materia prima por tipo
export const getInventarioMateriaPrimaPolietileno = async () => {
  const { data, error } = await supabase
    .from('vista_inventario_materia_prima')
    .select('*')
    .in('tipo', TIPOS_POLIETILENO)
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Obtener lista de materias primas de polietileno para formularios
export const getMateriasPrimasPolietileno = async () => {
  const { data, error } = await supabase
    .from('materias_primas')
    .select('*')
    .in('tipo', TIPOS_POLIETILENO)
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Crear nuevo movimiento de materia prima
export const createMovimientoMateriaPrimaPolietileno = async (movimientoData) => {
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
export const getMovimientosMateriaPrimaPolietileno = async (filtros = {}) => {
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
export const validarDisponibilidadStockPolietileno = async (materiaPrimaId, cantidadRequerida) => {
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

// Obtener todas las materias primas de polietileno
export const getMateriasPrimasPolietilenoCatalogo = async () => {
  const { data, error } = await supabase
    .from('materias_primas')
    .select('*')
    .in('tipo', TIPOS_POLIETILENO)
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
};

// Crear nueva materia prima
export const createMateriaPrimaPolietileno = async (materiaPrimaData) => {
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
export const updateMateriaPrimaPolietileno = async (id, materiaPrimaData) => {
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

// Eliminar materia prima
export const deleteMateriaPrimaPolietileno = async (id) => {
  const { data, error } = await supabase
    .from('materias_primas')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return data;
};