import React, { useState, useEffect } from 'react';
import { getMateriasPrimasPolietileno, createMovimientoMateriaPrimaPolietileno } from '../../services/api/almacenMpPolietileno';

const EntradaMpPolietilenForm = ({ isOpen, onCancel, onMovimientoCreated, materiaPrimaPreseleccionada }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materia_prima_id: '',
    cantidad: '',
    costo_unitario: '',
    estado_material: 'crudo',
    observaciones: ''
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
        costo_unitario: '',
        estado_material: 'crudo',
        observaciones: ''
      });
      setError(null);
    }
  }, [materiaPrimaPreseleccionada, isOpen]);

  const loadMateriasPrimas = async () => {
    try {
      setLoadingMateriasPrimas(true);
      const data = await getMateriasPrimasPolietileno();
      console.log('Materias primas de polietileno cargadas:', data);
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

    if (parseFloat(formData.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const movimientoData = {
        fecha: formData.fecha,
        materia_prima_id: parseInt(formData.materia_prima_id),
        cantidad: parseFloat(formData.cantidad),
        movimiento: 'entrada',
        estado_material: formData.estado_material,
        costo_unitario: formData.costo_unitario ? parseFloat(formData.costo_unitario) : null,
        observaciones: formData.observaciones || null
      };

      console.log('Enviando movimiento de entrada de polietileno:', movimientoData);

      const nuevoMovimiento = await createMovimientoMateriaPrimaPolietileno(movimientoData);

      // Notificar éxito
      alert('✅ Entrada de materia prima registrada exitosamente');

      // Notificar al componente padre
      onMovimientoCreated(nuevoMovimiento);

    } catch (err) {
      console.error('Error al crear movimiento:', err);
      setError(err.message || 'Error al registrar la entrada');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📥 Nueva Entrada - Materia Prima Polietileno
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registra una nueva entrada de materia prima de polietileno al almacén
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Selecciona una materia prima</option>
                  {materiasPrimas.map(mp => (
                    <option key={mp.id} value={mp.id}>
                      {getTipoIcon(mp.tipo)} {mp.nombre} - {getTipoDisplayName(mp.tipo)}
                    </option>
                  ))}
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
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading}
                required
              />
              {formData.materia_prima_id && (
                <p className="text-xs text-gray-500 mt-1">
                  Unidad: {materiasPrimas.find(mp => mp.id == formData.materia_prima_id)?.unidad_medida}
                </p>
              )}
            </div>

            {/* Costo Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Unitario (Opcional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costo_unitario}
                onChange={(e) => handleInputChange('costo_unitario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Costo por unidad de medida
              </p>
            </div>

            {/* Estado del Material */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Material *
              </label>
              <select
                value={formData.estado_material}
                onChange={(e) => handleInputChange('estado_material', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
                required
              >
                <option value="crudo">🔸 Crudo</option>
                <option value="procesado">🔶 Procesado</option>
                <option value="listo_produccion">✅ Listo para Producción</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notas adicionales sobre esta entrada..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              disabled={loading || loadingMateriasPrimas}
            >
              {loading ? 'Registrando...' : '📥 Registrar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntradaMpPolietilenForm;