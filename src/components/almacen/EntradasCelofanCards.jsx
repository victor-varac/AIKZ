import { useState, useMemo } from 'react';

const EntradasCelofanCards = ({ entradasPorProducto, loading, onNuevaEntrada, onVerDetalle }) => {
  // Estados para los filtros de búsqueda
  const [filtroAncho, setFiltroAncho] = useState('');
  const [filtroLargo, setFiltroLargo] = useState('');
  const [filtroMicraje, setFiltroMicraje] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Función consolidada de formateo de fecha
  const formatDate = (dateString, format = 'short') => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: format,
      day: 'numeric'
    });
  };

  // Filtrar productos por medidas específicas
  const productosFiltrados = useMemo(() => {
    if (!entradasPorProducto) return [];

    return entradasPorProducto.filter(item => {
      const producto = item.producto;

      // Si no hay filtros, mostrar todos
      if (!filtroAncho && !filtroLargo && !filtroMicraje) return true;

      // Filtrar por ancho si está definido
      if (filtroAncho && producto.ancho_cm) {
        const ancho = parseFloat(producto.ancho_cm);
        const busquedaAncho = parseFloat(filtroAncho);
        if (!isNaN(busquedaAncho) && Math.abs(ancho - busquedaAncho) > 0.01) {
          return false;
        }
      }

      // Filtrar por largo si está definido
      if (filtroLargo && producto.largo_cm) {
        const largo = parseFloat(producto.largo_cm);
        const busquedaLargo = parseFloat(filtroLargo);
        if (!isNaN(busquedaLargo) && Math.abs(largo - busquedaLargo) > 0.01) {
          return false;
        }
      }

      // Filtrar por micraje si está definido
      if (filtroMicraje && producto.micraje_um) {
        const micraje = parseFloat(producto.micraje_um);
        const busquedaMicraje = parseFloat(filtroMicraje);
        if (!isNaN(busquedaMicraje) && Math.abs(micraje - busquedaMicraje) > 0.01) {
          return false;
        }
      }

      return true;
    });
  }, [entradasPorProducto, filtroAncho, filtroLargo, filtroMicraje]);

  const limpiarFiltros = () => {
    setFiltroAncho('');
    setFiltroLargo('');
    setFiltroMicraje('');
  };

  // Componente para skeleton card
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48"></div>
    </div>
  );


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Entradas por Producto de Celofán</h2>
          <p className="text-sm text-gray-600 mt-1">Historial de entradas al almacén organizadas por producto</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Entradas por Producto de Celofán</h2>
            <p className="text-sm text-gray-600 mt-1">Historial de entradas al almacén organizadas por producto</p>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            {mostrarFiltros ? 'Ocultar filtros' : 'Buscar por medidas'}
          </button>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filtro-ancho" className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (cm)
                </label>
                <input
                  id="filtro-ancho"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 50"
                  value={filtroAncho}
                  onChange={(e) => setFiltroAncho(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="filtro-largo" className="block text-sm font-medium text-gray-700 mb-1">
                  Largo (cm)
                </label>
                <input
                  id="filtro-largo"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 70"
                  value={filtroLargo}
                  onChange={(e) => setFiltroLargo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="filtro-micraje" className="block text-sm font-medium text-gray-700 mb-1">
                  Micraje (μm)
                </label>
                <input
                  id="filtro-micraje"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 25"
                  value={filtroMicraje}
                  onChange={(e) => setFiltroMicraje(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {(filtroAncho || filtroLargo || filtroMicraje) && (
              <div className="mt-3 text-sm text-gray-600">
                Mostrando productos con medidas:
                {filtroAncho && <span className="ml-2 font-medium">Ancho: {filtroAncho}cm</span>}
                {filtroLargo && <span className="ml-2 font-medium">Largo: {filtroLargo}cm</span>}
                {filtroMicraje && <span className="ml-2 font-medium">Micraje: {filtroMicraje}μm</span>}
                <span className="ml-2 text-blue-600">({productosFiltrados.length} productos encontrados)</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📥</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              {(filtroAncho || filtroLargo || filtroMicraje)
                ? 'No se encontraron productos con esas especificaciones'
                : 'No hay entradas registradas'}
            </h3>
            <p className="text-gray-500 mt-2">
              {(filtroAncho || filtroLargo || filtroMicraje)
                ? 'Intenta con otras medidas o limpia los filtros'
                : 'Las entradas aparecerán aquí una vez que se registren movimientos de entrada'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((item) => (
              <div
                key={item.producto.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onVerDetalle && onVerDetalle(item.producto)}
              >
                {/* Header del producto */}
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.producto.nombre || 'Producto sin nombre'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {item.producto.ancho_cm && item.producto.largo_cm && (
                          <span>{item.producto.ancho_cm}cm x {item.producto.largo_cm}cm</span>
                        )}
                        {item.producto.micraje_um && (
                          <span> • {item.producto.micraje_um}μm</span>
                        )}
                      </div>
                    </div>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      👁️
                    </div>
                  </div>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(item.estadisticas?.totalEntradas || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Total Entradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(item.estadisticas?.totalMillares || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Millares Totales</div>
                  </div>
                </div>

                {/* Información de última entrada */}
                {item.estadisticas?.ultimaEntrada ? (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Última Entrada:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <div className="font-medium">
                          {formatDate(item.estadisticas.ultimaEntrada.fecha)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <div className="font-medium text-green-600">
                          {(item.estadisticas.ultimaEntrada.millares || 0).toLocaleString()} millares
                        </div>
                      </div>
                      {item.estadisticas.ultimaEntrada.produccion_id && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Producción:</span>
                          <div className="font-medium">
                            🏭 #{item.estadisticas.ultimaEntrada.produccion_id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center text-gray-500 text-sm">
                    Sin entradas registradas
                  </div>
                )}

                {/* Promedio */}
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-600">Promedio por entrada:</span>
                  <span className="font-medium">
                    {(item.estadisticas?.promedioEntrada || 0).toLocaleString()} millares
                  </span>
                </div>

                {/* Información resumida */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {item.entradas?.length || 0} entradas registradas
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Haz clic para ver detalles
                  </span>
                </div>

                {/* Botón para nueva entrada */}
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNuevaEntrada && onNuevaEntrada(item.producto);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">➕</span>
                    Añadir Nueva Entrada
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntradasCelofanCards;