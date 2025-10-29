import React, { useState, useEffect } from 'react';

const FiltrosProductos = ({ onApplyFilters, onResetFilters, loading, material }) => {
  const [filtros, setFiltros] = useState({
    nombre: '',
    presentacion: '',
    tipo: '',
    anchoMinimo: '',
    anchoMaximo: '',
    largoMinimo: '',
    largoMaximo: '',
    micrajeMinimo: '',
    micrajeMaximo: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Resetear filtros cuando cambia el material para evitar valores inválidos
  useEffect(() => {
    setFiltros({
      nombre: '',
      presentacion: '',
      tipo: '',
      anchoMinimo: '',
      anchoMaximo: '',
      largoMinimo: '',
      largoMaximo: '',
      micrajeMinimo: '',
      micrajeMaximo: ''
    });
  }, [material]);

  const handleInputChange = (field, value) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    const filtrosSaneados = Object.fromEntries(
      Object.entries(filtros)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => {
          // Convertir valores numéricos a números
          if (['anchoMinimo', 'anchoMaximo', 'largoMinimo', 'largoMaximo', 'micrajeMinimo', 'micrajeMaximo'].includes(key)) {
            return [key, parseFloat(value)];
          }
          return [key, value];
        })
    );
    onApplyFilters(filtrosSaneados);
  };

  const handleResetFilters = () => {
    setFiltros({
      nombre: '',
      presentacion: '',
      tipo: '',
      anchoMinimo: '',
      anchoMaximo: '',
      largoMinimo: '',
      largoMaximo: '',
      micrajeMinimo: '',
      micrajeMaximo: ''
    });
    onResetFilters();
  };

  const hasActiveFilters = Object.values(filtros).some(value => value !== '');

  // Opciones dinámicas según el material
  const getPresentacionOptions = () => {
    if (material === 'celofan') {
      return [
        { value: 'micraje', label: '📏 Micraje' },
        { value: 'gramaje', label: '⚖️ Gramaje' }
      ];
    } else if (material === 'polietileno') {
      return [
        { value: 'bobina', label: '🌀 Bobina' },
        { value: 'bolsa', label: '🛍️ Bolsa' }
      ];
    }
    return [];
  };

  const getTipoOptions = () => {
    if (material === 'celofan') {
      return [
        { value: 'mordaza', label: 'Mordaza' },
        { value: 'lateral', label: 'Lateral' },
        { value: 'pegol', label: 'Pegol' },
        { value: 'cenefa + pegol', label: 'Cenefa + Pegol' },
        { value: '100gr corta', label: '100gr Corta' },
        { value: '100gr larga', label: '100gr Larga' },
        { value: '150gr', label: '150gr' },
        { value: '250gr', label: '250gr' },
        { value: '500gr', label: '500gr' },
        { value: '1kg', label: '1kg' },
        { value: '1.5kg', label: '1.5kg' },
        { value: '2kg', label: '2kg' },
        { value: '2.5kg', label: '2.5kg' },
        { value: '3kg', label: '3kg' }
      ];
    } else if (material === 'polietileno') {
      return [
        { value: 'negra', label: 'Negra' },
        { value: 'semi natural', label: 'Semi Natural' },
        { value: 'virgen', label: 'Virgen' },
        { value: 'color', label: 'Color' }
      ];
    }
    return [];
  };

  const presentacionOptions = getPresentacionOptions();
  const tipoOptions = getTipoOptions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header del panel de filtros */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">
            🔍 Filtros para {material === 'celofan' ? 'Celofán' : 'Polietileno'}
          </h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetFilters();
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible de filtros */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Búsqueda por nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre del producto
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Presentación */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Presentación
              </label>
              <select
                value={filtros.presentacion}
                onChange={(e) => handleInputChange('presentacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las presentaciones</option>
                {presentacionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tipoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ancho mínimo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ancho mínimo (cm)
              </label>
              <input
                type="number"
                placeholder="0"
                step="0.1"
                value={filtros.anchoMinimo}
                onChange={(e) => handleInputChange('anchoMinimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ancho máximo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ancho máximo (cm)
              </label>
              <input
                type="number"
                placeholder="999"
                step="0.1"
                value={filtros.anchoMaximo}
                onChange={(e) => handleInputChange('anchoMaximo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Largo mínimo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Largo mínimo (cm)
              </label>
              <input
                type="number"
                placeholder="0"
                step="0.1"
                value={filtros.largoMinimo}
                onChange={(e) => handleInputChange('largoMinimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Largo máximo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Largo máximo (cm)
              </label>
              <input
                type="number"
                placeholder="999"
                step="0.1"
                value={filtros.largoMaximo}
                onChange={(e) => handleInputChange('largoMaximo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Micraje mínimo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Micraje mínimo (μm)
              </label>
              <input
                type="number"
                placeholder="0"
                step="0.1"
                value={filtros.micrajeMinimo}
                onChange={(e) => handleInputChange('micrajeMinimo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Micraje máximo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Micraje máximo (μm)
              </label>
              <input
                type="number"
                placeholder="999"
                step="0.1"
                value={filtros.micrajeMaximo}
                onChange={(e) => handleInputChange('micrajeMaximo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Aplicando...' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosProductos;