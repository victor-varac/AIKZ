import { useState, useMemo } from 'react';

const InventarioCelofanTable = ({ inventario, loading, onAjustarStock }) => {
  // Estados para los filtros de búsqueda
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroAncho, setFiltroAncho] = useState('');
  const [filtroLargo, setFiltroLargo] = useState('');
  const [filtroMicraje, setFiltroMicraje] = useState('');
  const [filtroStockMin, setFiltroStockMin] = useState('');
  const [filtroStockMax, setFiltroStockMax] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const getStockColor = (stock) => {
    if (stock <= 0) return 'text-red-600';
    if (stock <= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  // Función para obtener el estado del stock
  const getStockStatus = (stock) => {
    if (stock > 100) return 'alto';
    if (stock > 50) return 'medio';
    return 'bajo';
  };

  // Filtrar inventario
  const inventarioFiltrado = useMemo(() => {
    if (!inventario) return [];

    return inventario.filter(item => {
      // Filtrar por nombre del producto
      if (filtroNombre && item.producto) {
        const nombre = item.producto.toLowerCase();
        const busqueda = filtroNombre.toLowerCase();
        if (!nombre.includes(busqueda)) {
          return false;
        }
      }

      // Buscar medidas en el nombre del producto (formato: "Celofán 50x70 25μm")
      if (item.producto) {
        // Extraer ancho y largo del nombre del producto
        const medidasMatch = item.producto.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
        if (medidasMatch) {
          const anchoProducto = parseFloat(medidasMatch[1]);
          const largoProducto = parseFloat(medidasMatch[2]);

          // Filtrar por ancho
          if (filtroAncho) {
            const anchoBusqueda = parseFloat(filtroAncho);
            if (!isNaN(anchoBusqueda) && Math.abs(anchoProducto - anchoBusqueda) > 0.01) {
              return false;
            }
          }

          // Filtrar por largo
          if (filtroLargo) {
            const largoBusqueda = parseFloat(filtroLargo);
            if (!isNaN(largoBusqueda) && Math.abs(largoProducto - largoBusqueda) > 0.01) {
              return false;
            }
          }
        }

        // Extraer micraje del nombre del producto
        const micrajeMatch = item.producto.match(/(\d+(?:\.\d+)?)\s*(?:μm|um|micras?)/i);
        if (micrajeMatch && filtroMicraje) {
          const micrajeProducto = parseFloat(micrajeMatch[1]);
          const micrajeBusqueda = parseFloat(filtroMicraje);
          if (!isNaN(micrajeBusqueda) && Math.abs(micrajeProducto - micrajeBusqueda) > 0.01) {
            return false;
          }
        }
      }

      // Filtrar por stock mínimo
      const stock = item.stock_millares || 0;
      if (filtroStockMin) {
        const minStock = parseFloat(filtroStockMin);
        if (!isNaN(minStock) && stock < minStock) {
          return false;
        }
      }

      // Filtrar por stock máximo
      if (filtroStockMax) {
        const maxStock = parseFloat(filtroStockMax);
        if (!isNaN(maxStock) && stock > maxStock) {
          return false;
        }
      }

      // Filtrar por estado
      if (filtroEstado !== 'todos') {
        const estado = getStockStatus(stock);
        if (estado !== filtroEstado) {
          return false;
        }
      }

      return true;
    });
  }, [inventario, filtroNombre, filtroAncho, filtroLargo, filtroMicraje, filtroStockMin, filtroStockMax, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroAncho('');
    setFiltroLargo('');
    setFiltroMicraje('');
    setFiltroStockMin('');
    setFiltroStockMax('');
    setFiltroEstado('todos');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Inventario Actual de Celofán</h2>
          <p className="text-sm text-gray-600 mt-1">Stock actual de productos en millares</p>
        </div>
        <div className="animate-pulse p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
            <h2 className="text-xl font-semibold text-gray-900">Inventario Actual de Celofán</h2>
            <p className="text-sm text-gray-600 mt-1">Stock actual de productos en millares</p>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            {mostrarFiltros ? 'Ocultar filtros' : 'Buscar en inventario'}
          </button>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {/* Primera fila: Filtros de identificación y medidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="filtro-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto
                </label>
                <input
                  id="filtro-nombre"
                  type="text"
                  placeholder="Buscar producto..."
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
            </div>

            {/* Segunda fila: Filtros de stock y estado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filtro-stock-min" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock mínimo
                </label>
                <input
                  id="filtro-stock-min"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={filtroStockMin}
                  onChange={(e) => setFiltroStockMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="filtro-stock-max" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock máximo
                </label>
                <input
                  id="filtro-stock-max"
                  type="number"
                  step="1"
                  placeholder="1000"
                  value={filtroStockMax}
                  onChange={(e) => setFiltroStockMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del stock
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="bajo">Stock Bajo (&le;50)</option>
                  <option value="medio">Stock Medio (51-100)</option>
                  <option value="alto">Stock Alto (&gt;100)</option>
                </select>
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

            {(filtroNombre || filtroAncho || filtroLargo || filtroMicraje || filtroStockMin || filtroStockMax || filtroEstado !== 'todos') && (
              <div className="mt-3 text-sm text-gray-600">
                Filtros activos:
                {filtroNombre && <span className="ml-2 font-medium">Producto: "{filtroNombre}"</span>}
                {filtroAncho && <span className="ml-2 font-medium">Ancho: {filtroAncho}cm</span>}
                {filtroLargo && <span className="ml-2 font-medium">Largo: {filtroLargo}cm</span>}
                {filtroMicraje && <span className="ml-2 font-medium">Micraje: {filtroMicraje}μm</span>}
                {filtroStockMin && <span className="ml-2 font-medium">Stock mín: {filtroStockMin}</span>}
                {filtroStockMax && <span className="ml-2 font-medium">Stock máx: {filtroStockMax}</span>}
                {filtroEstado !== 'todos' && <span className="ml-2 font-medium">Estado: {filtroEstado}</span>}
                <span className="ml-2 text-blue-600">({inventarioFiltrado.length} productos encontrados)</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock (Millares)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventarioFiltrado.map((item, index) => (
              <tr key={item.producto_id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.producto || 'Producto sin nombre'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-2xl font-bold ${getStockColor(item.stock_millares || 0)}`}>
                    {(item.stock_millares || 0).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    (item.stock_millares || 0) > 100 ? 'bg-green-100 text-green-800' :
                    (item.stock_millares || 0) > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(item.stock_millares || 0) > 100 ? 'Stock Alto' :
                     (item.stock_millares || 0) > 50 ? 'Stock Medio' :
                     'Stock Bajo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onAjustarStock && onAjustarStock(item)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Ajustar stock con conteo físico"
                  >
                    📝 Ajustar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventarioFiltrado.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl">📦</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              {(filtroNombre || filtroAncho || filtroLargo || filtroMicraje || filtroStockMin || filtroStockMax || filtroEstado !== 'todos')
                ? 'No se encontraron productos con esos criterios'
                : 'No hay productos en inventario'}
            </h3>
            <p className="text-gray-500 mt-2">
              {(filtroNombre || filtroAncho || filtroLargo || filtroMicraje || filtroStockMin || filtroStockMax || filtroEstado !== 'todos')
                ? 'Intenta con otros filtros o limpia los filtros actuales'
                : 'Los productos aparecerán aquí una vez que registres movimientos'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventarioCelofanTable;