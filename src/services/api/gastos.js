import { supabase } from '../supabase';

export const getGastos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false });

    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    if (filtros.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.conceptoBusqueda) {
      query = query.ilike('concepto', `%${filtros.conceptoBusqueda}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

export const createGasto = async (gastoData) => {
  try {
    const gasto = {
      fecha: gastoData.fecha,
      concepto: gastoData.concepto,
      importe: parseFloat(gastoData.monto),
      categoria: gastoData.categoria
    };

    const { data, error } = await supabase
      .from('gastos')
      .insert([gasto])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error al crear gasto:', error);
    throw error;
  }
};

export const updateGasto = async (id, gastoData) => {
  try {
    const gasto = {
      fecha: gastoData.fecha,
      concepto: gastoData.concepto,
      importe: parseFloat(gastoData.monto),
      categoria: gastoData.categoria
    };

    const { data, error } = await supabase
      .from('gastos')
      .update(gasto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    throw error;
  }
};

export const deleteGasto = async (id) => {
  try {
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    throw error;
  }
};

export const getResumenGastos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('gastos')
      .select('categoria, importe');

    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data.reduce((sum, gasto) => sum + (parseFloat(gasto.importe) || 0), 0);

    const porCategoria = data.reduce((acc, gasto) => {
      const categoria = gasto.categoria || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + (parseFloat(gasto.importe) || 0);
      return acc;
    }, {});

    return {
      total,
      porCategoria,
      totalRegistros: data.length
    };
  } catch (error) {
    console.error('Error al obtener resumen de gastos:', error);
    throw error;
  }
};