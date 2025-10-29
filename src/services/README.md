# Documentación de Servicios AIKZ

Esta documentación describe todos los archivos y funciones disponibles en el directorio `src/services/` y `src/services/api/` del sistema AIKZ.

## Estructura de Directorios

```
src/services/
├── README.md              (este archivo)
├── database.js           (Configuración de base de datos SQLite local)
├── supabase.js           (Cliente de Supabase para base de datos en la nube)
└── api/                  (Servicios de API específicos por módulo)
    ├── almacen.js        (Gestión de inventario y movimientos)
    ├── almacenMp.js      (Gestión de materia prima)
    ├── almacenMpPolietileno.js (Gestión específica de polietileno)
    ├── clientes.js       (Gestión de clientes)
    ├── compras.js        (Gestión de compras - vacío)
    ├── cuentasPorPagar.js (Gestión de cuentas por pagar)
    ├── dashboard.js      (Datos para dashboard principal)
    ├── dashboardFinanciero.js (Dashboard financiero)
    ├── finanzas.js       (Módulo de finanzas)
    ├── gastos.js         (Gestión de gastos)
    ├── pedidos.js        (Gestión de pedidos y notas de venta)
    ├── produccion.js     (Gestión de producción - vacío)
    ├── productos.js      (Gestión de productos)
    ├── proveedores.js    (Gestión de proveedores)
    └── vendedores.js     (Gestión de vendedores)
```

---

## 📁 Archivos Base

### `database.js`
**Propósito**: Configuración y gestión de base de datos SQLite local.

**Funciones principales:**
- `initDatabase()` - Inicializa la base de datos local
- `getDatabase()` - Obtiene instancia de la base de datos
- `closeDatabase()` - Cierra conexión a la base de datos
- `createTables()` - Crea todas las tablas necesarias
- `insertSampleData()` - Inserta datos de ejemplo

**Tablas creadas:**
- `clientes` - Información de clientes
- `materias_primas_celofan` - Materias primas de celofán
- `materias_primas_polietileno` - Materias primas de polietileno
- `entradas_mp_celofan/polietileno` - Entradas de materia prima
- `salidas_mp_celofan/polietileno` - Salidas de materia prima
- `productos` - Catálogo de productos
- `notas_venta` - Notas de venta
- `pedidos` - Pedidos de clientes
- `entregas` - Entregas realizadas

**Vistas creadas:**
- `vista_inventario_celofan` - Inventario actual de celofán
- `vista_inventario_polietileno` - Inventario actual de polietileno

### `supabase.js`
**Propósito**: Cliente de Supabase para acceso a base de datos en la nube.

**Configuración:**
- URL: `https://akvxtsihvyezsoaifzkg.supabase.co`
- Utiliza variables de entorno para configuración

---

## 📁 Servicios API

### `almacen.js`
**Propósito**: Gestión completa de inventario para celofán y polietileno.

**Funciones para Celofán:**
- `getInventarioCelofan()` - Obtiene inventario actual
- `getMovimientosCelofan(filtros)` - Obtiene movimientos con filtros
- `createMovimientoCelofan(data)` - Crea nuevo movimiento
- `getProductosCelofan()` - Lista productos de celofán
- `getNotasVentaCelofan()` - Notas de venta de celofán
- `entregarTodo(notaVentaId)` - Entregar todos los productos pendientes
- `registrarEntregasParciales(entregas)` - Registra entregas parciales
- `getEntradasCelofanPorProducto()` - Entradas agrupadas por producto
- `updateMovimientoCelofan(id, data)` - Actualiza movimiento
- `deleteMovimientoCelofan(id)` - Elimina movimiento

**Funciones para Polietileno:**
- `getInventarioPolietileno()` - Obtiene inventario actual
- `getMovimientosPolietileno(filtros)` - Obtiene movimientos con filtros
- `createMovimientoPolietileno(data)` - Crea nuevo movimiento
- `getProductosPolietileno()` - Lista productos de polietileno
- `getNotasVentaPolietileno()` - Notas de venta de polietileno
- `entregarTodoPolietileno(notaVentaId)` - Entregar todos los productos pendientes
- `getEntradasPolietilenoPorProducto()` - Entradas agrupadas por producto
- `updateMovimientoPolietileno(id, data)` - Actualiza movimiento
- `deleteMovimientoPolietileno(id)` - Elimina movimiento

**Funciones de Gestión de Entregas:**
- `actualizarEntrega(id, datos)` - Actualiza entrega específica
- `eliminarEntrega(id)` - Elimina entrega y movimiento asociado
- `procesarCambiosEntregas(cambios)` - Procesa múltiples cambios

### `almacenMp.js`
**Propósito**: Gestión específica de materia prima.

**Funciones principales:**
- `getInventarioMateriaPrima(tipo)` - Inventario por tipo de materia prima
- `getMateriasPrimasCelofan()` - Lista materias primas de celofán
- `createMovimientoMateriaPrima(data)` - Crea movimiento de MP
- `getMovimientosMateriaPrima(filtros)` - Movimientos con filtros

### `almacenMpPolietileno.js`
**Propósito**: Gestión específica de materia prima de polietileno.

**Funciones principales:**
- `getMateriasPrimasPolietileno()` - Lista materias primas
- `getInventarioPolietileno()` - Inventario actual
- `createEntradaPolietileno(data)` - Nueva entrada
- `createSalidaPolietileno(data)` - Nueva salida
- `getMovimientosPolietileno(filtros)` - Historial de movimientos

### `clientes.js`
**Propósito**: Gestión completa de clientes.

**Funciones principales:**
- `getClientes(params)` - Lista paginada de clientes con filtros
- `getClientesCount(filtros)` - Conteo de clientes
- `createCliente(data)` - Crea nuevo cliente
- `updateCliente(id, data)` - Actualiza cliente
- `deleteCliente(id)` - Elimina cliente
- `getClienteDetalle(id)` - Detalle completo con estadísticas
- `getVendedores()` - Lista de vendedores
- `getClienteEstadisticas(id)` - Estadísticas específicas

**Características del detalle de cliente:**
- Estadísticas financieras completas
- Historial de compras y pagos
- Análisis de crédito y facturas vencidas
- Productos más comprados
- Historial mensual (últimos 12 meses)
- Estado de riesgo crediticio

### `cuentasPorPagar.js`
**Propósito**: Gestión de cuentas por pagar y obligaciones financieras.

**Funciones principales:**
- `getCuentasPorPagar(filtros)` - Lista de cuentas pendientes
- `createCuentaPorPagar(data)` - Nueva cuenta por pagar
- `updateCuentaPorPagar(id, data)` - Actualiza cuenta
- `pagarCuenta(id, data)` - Registra pago de cuenta
- `getEstadisticasCuentasPorPagar()` - Estadísticas generales

### `dashboard.js`
**Propósito**: Datos para el dashboard principal del sistema.

**Funciones principales:**
- `getDashboardData(temporalidad)` - Todos los datos del dashboard
- `getKPIs()` - Indicadores clave de rendimiento
- `getSalesChartData(temporalidad)` - Datos de gráfico de ventas
- `getInventoryStatus()` - Estado del inventario
- `getRecentOrders()` - Órdenes recientes
- `getTopClients()` - Mejores clientes
- `getVendedorPerformance()` - Performance de vendedores
- `getEstadisticasRapidas()` - Estadísticas rápidas

**KPIs incluidos:**
- Ventas del mes vs mes anterior
- Órdenes activas vs completadas
- Top productos vendidos
- Estado de inventario crítico

### `dashboardFinanciero.js`
**Propósito**: Dashboard específico para datos financieros.

**Funciones principales:**
- `getDashboardFinanciero()` - Todos los datos financieros
- `getResumenFinanciero()` - Resumen general
- `getFlujoCaja(periodo)` - Flujo de caja por período
- `getCuentasPorCobrar()` - Cuentas por cobrar pendientes
- `getCuentasPorPagar()` - Cuentas por pagar pendientes
- `getGraficosFinancieros(periodo)` - Gráficos financieros
- `getEstadisticasPagos()` - Estadísticas de pagos
- `getAnalisisMensual()` - Análisis mensual detallado

**Métricas financieras:**
- Ingresos vs egresos
- Saldo actual
- Proyecciones de flujo
- Análisis de vencimientos
- Comparativas mensuales

### `finanzas.js`
**Propósito**: Módulo general de finanzas.

**Funciones principales:**
- `getEstadoFinanciero()` - Estado financiero general
- `getFlujoCaja(filtros)` - Flujo de caja detallado
- `getIngresosPorPeriodo(periodo)` - Ingresos por período
- `getGastosPorPeriodo(periodo)` - Gastos por período
- `getBalanceGeneral()` - Balance general
- `getEstadoResultados(periodo)` - Estado de resultados

### `gastos.js`
**Propósito**: Gestión de gastos operativos.

**Funciones principales:**
- `getGastos(filtros)` - Lista de gastos con filtros
- `createGasto(data)` - Crea nuevo gasto
- `updateGasto(id, data)` - Actualiza gasto
- `deleteGasto(id)` - Elimina gasto
- `getCategorias()` - Categorías de gastos
- `getEstadisticasGastos(periodo)` - Estadísticas por período

### `pedidos.js`
**Propósito**: Gestión de pedidos y notas de venta.

**Funciones principales:**
- `getNotasVentaPaginadas(params)` - Notas de venta paginadas
- `getNotasVentaCount(filtros)` - Conteo de notas
- `createNotaVenta(data)` - Crea nueva nota de venta
- `updateNotaVenta(id, data)` - Actualiza nota
- `deleteNotaVenta(id)` - Elimina nota
- `getNotaVentaDetalle(id)` - Detalle completo con pedidos
- `createPedido(data)` - Crea pedido individual
- `updatePedido(id, data)` - Actualiza pedido
- `deletePedido(id)` - Elimina pedido

**Características:**
- Manejo de estado de entrega (pendiente, parcial, completo)
- Cálculo automático de totales, IVA, descuentos
- Relación con clientes y productos
- Historial completo de cambios

### `productos.js`
**Propósito**: Gestión del catálogo de productos.

**Funciones principales:**
- `getProductos(filtros)` - Lista de productos con filtros
- `createProducto(data)` - Crea nuevo producto
- `updateProducto(id, data)` - Actualiza producto
- `deleteProducto(id)` - Elimina producto
- `getProductoDetalle(id)` - Detalle con inventario
- `getCategorias()` - Categorías disponibles

**Tipos de productos soportados:**
- Celofán (medido en millares)
- Polietileno (medido en kilos)

### `proveedores.js`
**Propósito**: Gestión de proveedores.

**Funciones principales:**
- `getProveedores(filtros)` - Lista de proveedores
- `createProveedor(data)` - Crea nuevo proveedor
- `updateProveedor(id, data)` - Actualiza proveedor
- `deleteProveedor(id)` - Elimina proveedor
- `getProveedorDetalle(id)` - Detalle con estadísticas
- `getEstadisticasProveedor(id)` - Estadísticas de compras

### `vendedores.js`
**Propósito**: Gestión de vendedores.

**Funciones principales:**
- `getVendedores(params)` - Lista paginada de vendedores
- `getVendedoresCount(filtros)` - Conteo de vendedores
- `createVendedor(data)` - Crea nuevo vendedor
- `updateVendedor(id, data)` - Actualiza vendedor
- `deleteVendedor(id)` - Elimina vendedor
- `getVendedorDetalle(id)` - Detalle con performance
- `getEstadisticasVendedor(id)` - Estadísticas de ventas

---

## 🔧 Archivos Vacíos / En Desarrollo

### `compras.js`
**Estado**: Vacío - Pendiente de implementación
**Propósito previsto**: Gestión de compras a proveedores

### `produccion.js`
**Estado**: Vacío - Pendiente de implementación
**Propósito previsto**: Gestión de órdenes de producción

---

## 📊 Convenciones y Patrones

### Patrones de Nomenclatura
- **Funciones GET**: `get{Entidad}(filtros)` - Obtiene lista
- **Funciones CREATE**: `create{Entidad}(data)` - Crea nuevo registro
- **Funciones UPDATE**: `update{Entidad}(id, data)` - Actualiza registro
- **Funciones DELETE**: `delete{Entidad}(id)` - Elimina registro
- **Funciones de DETALLE**: `get{Entidad}Detalle(id)` - Detalle completo
- **Funciones de ESTADÍSTICAS**: `getEstadisticas{Entidad}()` - Métricas

### Estructura de Respuestas Paginadas
```javascript
{
  data: [...],           // Array de registros
  count: number,         // Total de registros
  hasMore: boolean       // Si hay más páginas
}
```

### Parámetros Comunes
```javascript
params = {
  offset: 0,            // Desplazamiento para paginación
  limit: 15,            // Límite de registros por página
  filtros: {            // Objeto con filtros específicos
    fechaDesde: 'YYYY-MM-DD',
    fechaHasta: 'YYYY-MM-DD',
    // ... otros filtros según módulo
  }
}
```

### Manejo de Errores
- Todas las funciones lanzan errores usando `throw error`
- Los errores se capturan en los componentes React
- Se incluyen logs detallados con `console.error()`

### Base de Datos
- **Local**: SQLite usando `better-sqlite3`
- **Remota**: Supabase (PostgreSQL)
- **ORM**: Queries directas con Supabase client

---

## 🚀 Uso Típico

### Importación
```javascript
// Importar servicio específico
import { getClientes, createCliente } from '../services/api/clientes';

// Importar cliente Supabase directamente
import { supabase } from '../services/supabase';
```

### Llamadas Típicas
```javascript
// Obtener datos paginados
const clientes = await getClientes({
  offset: 0,
  limit: 20,
  filtros: { estado: true }
});

// Crear registro
const nuevoCliente = await createCliente({
  nombre: 'Empresa ABC',
  contacto: 'Juan Pérez',
  email: 'contacto@empresa.com'
});

// Obtener detalle completo
const detalle = await getClienteDetalle(1);
```

---

## 📝 Notas de Desarrollo

1. **Consistencia**: Todos los servicios siguen patrones similares
2. **Escalabilidad**: Estructura preparada para crecimiento
3. **Mantenibilidad**: Separación clara de responsabilidades
4. **Testing**: Preparado para pruebas unitarias
5. **Documentación**: Cada función incluye propósito y parámetros

---

*Última actualización: $(new Date().toLocaleDateString('es-MX'))*
*Versión: 2.0*