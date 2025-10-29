import { useState } from 'react';

const FiltrosAvanzados = ({
  filtros,
  onFiltrosChange,
  mostrarFiltroProducto = true,
  mostrarFiltroCliente = true,
  mostrarFiltroProveedor = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  const periodosPredefinidos = [
    { id: 'hoy', label: 'Hoy', dias: 0 },
    { id: 'semana', label: 'Esta semana', dias: 7 },
    { id: 'mes', label: 'Este mes', dias: 30 },
    { id: 'trimestre', label: 'Trimestre', dias: 90 },
    { id: 'semestre', label: 'Semestre', dias: 180 },
    { id: 'año', label: 'Este año', dias: 365 },
    { id: 'personalizado', label: 'Personalizado', dias: null }
  ];

  const tiposProducto = [
    { id: 'todos', label: 'Todos los productos' },
    { id: 'celofan', label: 'Celofán' },
    { id: 'polietileno', label: 'Polietileno' },
    { id: 'proceso_pelletizado', label: 'Proceso Pelletizado' }
  ];

  const manejarCambioPeriodo = (periodoId) => {
    if (periodoId === 'personalizado') {
      onFiltrosChange({
        ...filtros,
        periodo: periodoId,
        fechaInicio: '',
        fechaFin: ''
      });
    } else {
      const periodo = periodosPredefinidos.find(p => p.id === periodoId);
      if (periodo && periodo.dias !== null) {
        const fechaFin = new Date();
        const fechaInicio = new Date();

        if (periodo.dias === 0) {
          // Hoy
          fechaInicio.setHours(0, 0, 0, 0);
        } else {
          fechaInicio.setDate(fechaFin.getDate() - periodo.dias);
        }

        onFiltrosChange({
          ...filtros,
          periodo: periodoId,
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0]
        });
      }
    }
  };

  const manejarCambioFiltro = (campo, valor) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      periodo: 'mes',
      fechaInicio: '',
      fechaFin: '',
      tipoProducto: 'todos',
      cliente: '',
      proveedor: '',
      montoMinimo: '',
      montoMaximo: ''
    });
    setMostrarFiltrosAvanzados(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Filtros básicos siempre visibles */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        {/* Selector de período */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={filtros.periodo || 'mes'}
            onChange={(e) => manejarCambioPeriodo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          >
            {periodosPredefinidos.map(periodo => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fechas personalizadas */}
        {filtros.periodo === 'personalizado' && (
          <>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Desde:</label>
              <input
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={(e) => manejarCambioFiltro('fechaInicio', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Hasta:</label>
              <input
                type="date"
                value={filtros.fechaFin || ''}
                onChange={(e) => manejarCambioFiltro('fechaFin', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Selector de producto */}
        {mostrarFiltroProducto && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Producto:</label>
            <select
              value={filtros.tipoProducto || 'todos'}
              onChange={(e) => manejarCambioFiltro('tipoProducto', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tiposProducto.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón para mostrar filtros avanzados */}
        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <span>{mostrarFiltrosAvanzados ? '🔽' : '▶️'}</span>
          <span>Filtros avanzados</span>
        </button>

        {/* Indicador de filtros activos */}
        {(filtros.cliente || filtros.proveedor || filtros.montoMinimo || filtros.montoMaximo) && (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-xs text-blue-600 font-medium">Filtros activos</span>
          </div>
        )}
      </div>

      {/* Filtros avanzados colapsables */}
      {mostrarFiltrosAvanzados && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por cliente */}
            {mostrarFiltroCliente && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente:
                </label>
                <input
                  type="text"
                  value={filtros.cliente || ''}
                  onChange={(e) => manejarCambioFiltro('cliente', e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Filtro por proveedor */}
            {mostrarFiltroProveedor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor:
                </label>
                <input
                  type="text"
                  value={filtros.proveedor || ''}
                  onChange={(e) => manejarCambioFiltro('proveedor', e.target.value)}
                  placeholder="Buscar proveedor..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Filtro por monto mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto mínimo:
              </label>
              <input
                type="number"
                value={filtros.montoMinimo || ''}
                onChange={(e) => manejarCambioFiltro('montoMinimo', e.target.value)}
                placeholder="$0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por monto máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto máximo:
              </label>
              <input
                type="number"
                value={filtros.montoMaximo || ''}
                onChange={(e) => manejarCambioFiltro('montoMaximo', e.target.value)}
                placeholder="Sin límite"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              🗑️ Limpiar filtros
            </button>

            <button
              onClick={() => setMostrarFiltrosAvanzados(false)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              ✅ Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Resumen de filtros aplicados */}
      {Object.values(filtros).some(v => v && v !== 'todos' && v !== 'mes') && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Filtros aplicados:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {filtros.periodo && filtros.periodo !== 'mes' && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  📅 {periodosPredefinidos.find(p => p.id === filtros.periodo)?.label}
                </span>
              )}
              {filtros.tipoProducto && filtros.tipoProducto !== 'todos' && (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  📦 {tiposProducto.find(t => t.id === filtros.tipoProducto)?.label}
                </span>
              )}
              {filtros.cliente && (
                <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  👤 {filtros.cliente}
                </span>
              )}
              {filtros.montoMinimo && (
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  💰 Min: ${Number(filtros.montoMinimo).toLocaleString()}
                </span>
              )}
              {filtros.montoMaximo && (
                <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                  💰 Max: ${Number(filtros.montoMaximo).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosAvanzados;