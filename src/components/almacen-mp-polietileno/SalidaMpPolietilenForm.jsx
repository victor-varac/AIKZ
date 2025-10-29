import React, { useState, useEffect } from 'react';
import { getMateriasPrimasPolietileno, createMovimientoMateriaPrimaPolietileno } from '../../services/api/almacenMpPolietileno';

const SalidaMpPolietilenForm = ({ isOpen, onCancel, onMovimientoCreated, inventario, materiaPrimaPreseleccionada }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materia_prima_id: '',
    cantidad: '',
    observaciones: '',
    destino: ''
  });

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMateriasPrimas, setLoadingMateriasPrimas] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMateriasPrimas();
  }, []);

  // Recargar materias primas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadMateriasPrimas();
    }
  }, [isOpen]);

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
        observaciones: '',
        destino: ''
      });
      setError(null);
    }
  }, [materiaPrimaPreseleccionada, isOpen]);

  const loadMateriasPrimas = async () => {
    try {
      setLoadingMateriasPrimas(true);
      const data = await getMateriasPrimasPolietileno();
      console.log('Materias primas de polietileno cargadas para salidas:', data);
      setMateriasPrimas(data || []);
    } catch (err) {
      console.error('Error al cargar materias primas de polietileno:', err);
      setError('Error al cargar la lista de materias primas de polietileno');
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
    const materiaPrimaSeleccionada = inventario?.find(mp => mp.materia_prima_id == formData.materia_prima_id) ||
                                    materiasPrimas?.find(mp => mp.id == formData.materia_prima_id);

    if (materiaPrimaSeleccionada) {
      const stockDisponible = materiaPrimaSeleccionada.stock_actual || 0;
      if (cantidad > stockDisponible) {
        setError(`No hay suficiente stock. Disponible: ${stockDisponible} ${materiaPrimaSeleccionada.unidad_medida}`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const movimientoData = {
        fecha: formData.fecha,
        materia_prima_id: parseInt(formData.materia_prima_id),
        cantidad: cantidad,
        movimiento: 'salida',
        observaciones: formData.observaciones || null
      };

      // Agregar destino si se especificó
      if (formData.destino) {
        movimientoData.observaciones = formData.observaciones
          ? `Destino: ${formData.destino}. ${formData.observaciones}`
          : `Destino: ${formData.destino}`;
      }

      console.log('Enviando movimiento de salida de polietileno:', movimientoData);

      const nuevoMovimiento = await createMovimientoMateriaPrimaPolietileno(movimientoData);

      // Notificar éxito
      alert('✅ Salida de materia prima registrada exitosamente');

      // Notificar al componente padre
      onMovimientoCreated(nuevoMovimiento);

    } catch (err) {
      console.error('Error al crear movimiento de salida:', err);
      setError(err.message || 'Error al registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  const getTipoDisplayName = (tipo) => {
    const tipos = {
      'resina_virgen_natural': 'Resina Virgen Natural',
      'resina_virgen_color': 'Resina Virgen Color',
      'arana_bolsas': 'Araña para Bolsas',
      'pellet_reciclado': 'Pellet Reciclado'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      'resina_virgen_natural': '🔹',
      'resina_virgen_color': '🎨',
      'arana_bolsas': '🕷️',
      'pellet_reciclado': '♻️'
    };
    return iconos[tipo] || '🛢️';
  };

  const getStockDisponible = (materiaPrimaId) => {
    const materiaPrima = inventario?.find(mp => mp.materia_prima_id == materiaPrimaId) ||
                        materiasPrimas?.find(mp => mp.id == materiaPrimaId);
    return materiaPrima?.stock_actual || 0;
  };

  const getUnidadMedida = (materiaPrimaId) => {
    const materiaPrima = inventario?.find(mp => mp.materia_prima_id == materiaPrimaId) ||
                        materiasPrimas?.find(mp => mp.id == materiaPrimaId);
    return materiaPrima?.unidad_medida || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📤 Nueva Salida - Materia Prima Polietileno
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registra una salida o consumo de materia prima de polietileno del almacén
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            {/* Materia Prima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materia Prima *
              </label>
              {loadingMateriasPrimas ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  Cargando materias primas...
                </div>
              ) : (
                <select
                  value={formData.materia_prima_id}
                  onChange={(e) => handleInputChange('materia_prima_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Selecciona una materia prima</option>
                  {materiasPrimas.map(mp => {
                    const stockDisponible = getStockDisponible(mp.id);
                    return (
                      <option key={mp.id} value={mp.id} disabled={stockDisponible <= 0}>
                        {getTipoIcon(mp.tipo)} {mp.nombre} - {getTipoDisplayName(mp.tipo)}
                        {stockDisponible <= 0 ? ' (Sin stock)' : ` (Stock: ${stockDisponible})`}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.materia_prima_id ? getStockDisponible(formData.materia_prima_id) : undefined}
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading}
                required
              />
              {formData.materia_prima_id && (
                <div className="text-xs text-gray-500 mt-1">
                  <div>Unidad: {getUnidadMedida(formData.materia_prima_id)}</div>
                  <div>Disponible: {getStockDisponible(formData.materia_prima_id)} {getUnidadMedida(formData.materia_prima_id)}</div>
                </div>
              )}
            </div>

            {/* Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino (Opcional)
              </label>
              <select
                value={formData.destino}
                onChange={(e) => handleInputChange('destino', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Seleccionar destino...</option>
                <option value="Producción de Bolsas">🛍️ Producción de Bolsas</option>
                <option value="Producción de Film">📄 Producción de Film</option>
                <option value="Proceso de Pelletizado">♻️ Proceso de Pelletizado</option>
                <option value="Transferencia">🔄 Transferencia</option>
                <option value="Merma">⚠️ Merma</option>
                <option value="Ajuste de Inventario">📊 Ajuste de Inventario</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (Opcional)
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Motivo de la salida, número de orden de producción, etc..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Validación de stock en tiempo real */}
          {formData.materia_prima_id && formData.cantidad && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm">
                <div className="font-medium text-blue-900">Validación de Stock:</div>
                <div className="text-blue-700 mt-1">
                  Cantidad solicitada: {formData.cantidad} {getUnidadMedida(formData.materia_prima_id)}
                </div>
                <div className="text-blue-700">
                  Stock disponible: {getStockDisponible(formData.materia_prima_id)} {getUnidadMedida(formData.materia_prima_id)}
                </div>
                <div className={`font-medium mt-1 ${
                  parseFloat(formData.cantidad) <= getStockDisponible(formData.materia_prima_id)
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {parseFloat(formData.cantidad) <= getStockDisponible(formData.materia_prima_id)
                    ? '✅ Stock suficiente'
                    : '❌ Stock insuficiente'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              disabled={loading || loadingMateriasPrimas}
            >
              {loading ? 'Registrando...' : '📤 Registrar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalidaMpPolietilenForm;