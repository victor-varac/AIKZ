import React, { useState, useEffect } from 'react';
import { getMateriasPrimasCelofan, createMovimientoMateriaPrima, validarDisponibilidadStock } from '../../services/api/almacenMp';

const SalidaMpForm = ({ isOpen, onCancel, onMovimientoCreated, inventario, materiaPrimaPreseleccionada }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materia_prima_id: '',
    cantidad: '',
    destino: 'produccion_celofan',
    observaciones: ''
  });

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMateriasPrimas, setLoadingMateriasPrimas] = useState(true);
  const [error, setError] = useState(null);
  const [stockDisponible, setStockDisponible] = useState(0);

  useEffect(() => {
    loadMateriasPrimas();
  }, []);

  useEffect(() => {
    // Actualizar stock disponible cuando cambie el material seleccionado
    if (formData.materia_prima_id && inventario) {
      const materialSeleccionado = inventario.find(item =>
        item.materia_prima_id === parseInt(formData.materia_prima_id)
      );
      setStockDisponible(materialSeleccionado?.stock_actual || 0);
    } else {
      setStockDisponible(0);
    }
  }, [formData.materia_prima_id, inventario]);

  // Pre-seleccionar materia prima si viene preseleccionada o resetear cuando se cierre
  useEffect(() => {
    if (isOpen && materiaPrimaPreseleccionada) {
      setFormData(prev => ({
        ...prev,
        materia_prima_id: materiaPrimaPreseleccionada.materia_prima_id?.toString() || ''
      }));
    } else if (!isOpen) {
      // Resetear formulario cuando se cierre
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        materia_prima_id: '',
        cantidad: '',
        destino: 'produccion_celofan',
        observaciones: ''
      });
      setError(null);
    }
  }, [materiaPrimaPreseleccionada, isOpen]);

  const loadMateriasPrimas = async () => {
    try {
      setLoadingMateriasPrimas(true);
      const data = await getMateriasPrimasCelofan();
      setMateriasPrimas(data);
    } catch (err) {
      console.error('Error al cargar materias primas:', err);
      setError('Error al cargar la lista de materias primas');
    } finally {
      setLoadingMateriasPrimas(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error al hacer cambios
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.materia_prima_id || !formData.cantidad || !formData.fecha) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    // Validar stock disponible
    if (cantidad > stockDisponible) {
      setError(`Stock insuficiente. Disponible: ${stockDisponible.toLocaleString()}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validar disponibilidad en el servidor
      const disponible = await validarDisponibilidadStock(
        parseInt(formData.materia_prima_id),
        cantidad
      );

      if (!disponible) {
        setError('Stock insuficiente para realizar esta salida');
        return;
      }

      const movimientoData = {
        fecha: formData.fecha,
        materia_prima_id: parseInt(formData.materia_prima_id),
        cantidad: cantidad,
        movimiento: 'salida',
        observaciones: `Destino: ${formData.destino}${formData.observaciones ? '. ' + formData.observaciones : ''}`
      };

      // Agregar referencia según destino
      if (formData.destino === 'produccion_celofan') {
        // En un sistema real, aquí se vincularía con un registro de producción específico
        movimientoData.observaciones = `Consumo para producción de celofán. ${formData.observaciones || ''}`;
      }

      await createMovimientoMateriaPrima(movimientoData);

      // Notificar éxito
      const materiaPrimaSeleccionada = materiasPrimas.find(mp => mp.id === parseInt(formData.materia_prima_id));
      alert(`✅ Salida registrada exitosamente:\n\nMaterial: ${materiaPrimaSeleccionada?.nombre}\nCantidad: ${formData.cantidad} ${materiaPrimaSeleccionada?.unidad_medida}\nDestino: ${formData.destino}\nFecha: ${formData.fecha}`);

      onMovimientoCreated();
    } catch (err) {
      console.error('Error al registrar salida:', err);
      setError(err.message || 'Error al registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loadingMateriasPrimas) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const materiaPrimaSeleccionada = materiasPrimas.find(mp => mp.id === parseInt(formData.materia_prima_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">📤 Nueva Salida de Materia Prima</h2>
              <p className="text-gray-600 mt-1">
                Registra un consumo o salida de materia prima del almacén
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400 mr-3">⚠️</div>
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materia Prima <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.materia_prima_id}
            onChange={(e) => handleInputChange('materia_prima_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="">Seleccionar material...</option>
            {materiasPrimas.map((mp) => (
              <option key={mp.id} value={mp.id}>
                {mp.nombre} ({mp.unidad_medida})
              </option>
            ))}
          </select>
          {formData.materia_prima_id && (
            <p className="mt-1 text-sm text-gray-600">
              Stock disponible: <span className="font-medium">{stockDisponible.toLocaleString()} {materiaPrimaSeleccionada?.unidad_medida}</span>
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={stockDisponible}
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destino <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.destino}
            onChange={(e) => handleInputChange('destino', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="produccion_celofan">Producción de Celofán</option>
            <option value="transferencia">Transferencia Interna</option>
            <option value="merma">Merma/Ajuste</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          rows="3"
          placeholder="Notas adicionales sobre la salida..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : '📤 Registrar Salida'}
        </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalidaMpForm;