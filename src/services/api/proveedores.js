import { supabase } from '../supabase';

export const getProveedoresByMaterial = async (material, filtros = {}) => {
  let query = supabase
    .from('proveedores')
    .select('*');

  if (filtros.activo !== undefined) {
    query = query.eq('activo', filtros.activo);
  }

  if (filtros.search) {
    query = query.or(`nombre.ilike.%${filtros.search}%,contacto.ilike.%${filtros.search}%`);
  }

  query = query.order('nombre');

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Por ahora retornamos todos los proveedores, ya que la tabla no tiene especialización por material
  return data || [];
};

export const getAllProveedores = async (filtros = {}) => {
  let query = supabase
    .from('proveedores')
    .select('*');

  if (filtros.activo !== undefined) {
    query = query.eq('activo', filtros.activo);
  }

  if (filtros.search) {
    query = query.or(`nombre.ilike.%${filtros.search}%,contacto.ilike.%${filtros.search}%`);
  }

  query = query.order('nombre');

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const getProveedorById = async (id) => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createProveedor = async (proveedor) => {
  // Solo incluir campos que existen en la tabla
  const proveedorData = {
    nombre: proveedor.nombre,
    contacto: proveedor.contacto,
    telefono: proveedor.telefono,
    email: proveedor.email,
    direccion: proveedor.direccion,
    dias_pago: proveedor.dias_pago,
    activo: proveedor.activo
  };

  const { data, error } = await supabase
    .from('proveedores')
    .insert([proveedorData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateProveedor = async (id, updates) => {
  // Solo incluir campos que existen en la tabla
  const updateData = {
    nombre: updates.nombre,
    contacto: updates.contacto,
    telefono: updates.telefono,
    email: updates.email,
    direccion: updates.direccion,
    dias_pago: updates.dias_pago,
    activo: updates.activo
  };

  const { data, error } = await supabase
    .from('proveedores')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const toggleProveedorStatus = async (id) => {
  const proveedor = await getProveedorById(id);
  const { data, error } = await supabase
    .from('proveedores')
    .update({
      activo: !proveedor.activo
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteProveedor = async (id) => {
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};