import React, { useState, useEffect } from 'react';
import { getProductosPolietileno, getEntregasPendientes, createMovimientoPolietileno, updateMovimientoPolietileno } from '../../services/api/almacen';

const MovimientoPolietilenoForm = ({ isOpen, onClose, onMovimientoCreated, productoPreseleccionado, entradaToEdit }) => {
  const [formData, setFormData] = useState({
    producto_id: '',
    millares: '',
    movimiento: 'entrada',
    fecha: new Date().toISOString().split('T')[0],
    produccion_id: '',
    entrega_id: '',
    maquina: '',
    operador: ''
  });

  const [productos, setProductos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFormData();

      // Si estamos editando una entrada, cargar sus datos
      if (entradaToEdit) {
        setFormData({
          producto_id: entradaToEdit.producto_id?.toString() || '',
          millares: entradaToEdit.millares?.toString() || '',
          movimiento: 'entrada', // Solo editamos entradas por ahora
          fecha: entradaToEdit.fecha || new Date().toISOString().split('T')[0],
          produccion_id: entradaToEdit.produccion_id?.toString() || '',
          entrega_id: '',
          maquina: entradaToEdit.maquina || '',
          operador: entradaToEdit.operador || ''
        });
      }
      // Pre-seleccionar producto si se proporciona y no estamos editando
      else if (productoPreseleccionado) {
        setFormData(prev => ({
          ...prev,
          producto_id: productoPreseleccionado.id.toString(),
          movimiento: 'entrada' // Por defecto para nuevas entradas
        }));
      }
    }
  }, [isOpen, productoPreseleccionado, entradaToEdit]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [productosData, entregasData] = await Promise.all([
        getProductosPolietileno(),
        getEntregasPendientes()
      ]);

      setProductos(productosData);
      setEntregas(entregasData);
    } catch (err) {
      console.error('Error al cargar datos del formulario:', err);
      setError('Error al cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validaciones básicas
      if (!formData.producto_id || !formData.millares) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      if (parseFloat(formData.millares) <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      // Preparar datos para envío
      const movimientoData = {
        producto_id: parseInt(formData.producto_id),
        millares: parseFloat(formData.millares),
        movimiento: formData.movimiento,
        fecha: formData.fecha
      };

      // Agregar campos opcionales si tienen valor
      if (formData.maquina) {
        movimientoData.maquina = formData.maquina;
      }
      if (formData.operador) {
        movimientoData.operador = formData.operador;
      }

      // Agregar ID de producción o entrega según el tipo
      if (formData.movimiento === 'entrada' && formData.produccion_id) {
        movimientoData.produccion_id = parseInt(formData.produccion_id);
      } else if (formData.movimiento === 'salida' && formData.entrega_id) {
        movimientoData.entrega_id = parseInt(formData.entrega_id);
      }

      let resultado;
      if (entradaToEdit) {
        // Editando entrada existente
        resultado = await updateMovimientoPolietileno(entradaToEdit.id, movimientoData);
      } else {
        // Creando nueva entrada
        resultado = await createMovimientoPolietileno(movimientoData);
      }

      // Resetear formulario
      setFormData({
        producto_id: '',
        millares: '',
        movimiento: 'entrada',
        fecha: new Date().toISOString().split('T')[0],
        produccion_id: '',
        entrega_id: '',
        maquina: '',
        operador: ''
      });

      onMovimientoCreated(resultado);
      onClose();
    } catch (err) {
      console.error('Error al crear movimiento:', err);
      setError(err.message || 'Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {entradaToEdit ? '✏️ Editar Entrada de' :
               productoPreseleccionado ? '📥 Nueva Entrada de' :
               '📥 Registrar Movimiento de'} Polietileno
            </h2>
            {(productoPreseleccionado || entradaToEdit) && (
              <p className="text-sm text-gray-600 mt-1">
                Producto: {productoPreseleccionado?.nombre || 'Seleccionado'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <span className="text-red-400 mr-3">⚠️</span>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="movimiento"
                  value="entrada"
                  checked={formData.movimiento === 'entrada'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-green-600">📥 Entrada</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="movimiento"
                  value="salida"
                  checked={formData.movimiento === 'salida'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-red-600">📤 Salida</span>
              </label>
            </div>
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto *
            </label>
            <select
              name="producto_id"
              value={formData.producto_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - {producto.ancho_cm}cm x {producto.largo_cm}cm
                  {producto.micraje_um && ` - ${producto.micraje_um}μm`}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (Kilogramos) *
              </label>
              <input
                type="number"
                name="millares"
                value={formData.millares}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Máquina y Operador */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máquina
              </label>
              <input
                type="text"
                name="maquina"
                value={formData.maquina}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Máquina 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operador
              </label>
              <input
                type="text"
                name="operador"
                value={formData.operador}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del operador"
              />
            </div>
          </div>


          {/* Campos específicos según tipo de movimiento */}
          {formData.movimiento === 'entrada' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Producción
              </label>
              <input
                type="number"
                name="produccion_id"
                value={formData.produccion_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de orden de producción"
              />
            </div>
          )}

          {formData.movimiento === 'salida' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entrega
              </label>
              <select
                name="entrega_id"
                value={formData.entrega_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar entrega...</option>
                {entregas.map((entrega) => (
                  <option key={entrega.id} value={entrega.id}>
                    {entrega.cliente} - {entrega.producto} ({entrega.cantidad} millares)
                  </option>
                ))}
              </select>
            </div>
          )}


          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? (entradaToEdit ? 'Actualizando...' : 'Registrando...') :
                        (entradaToEdit ? 'Actualizar Entrada' : 'Registrar Movimiento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovimientoPolietilenoForm;