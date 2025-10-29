# Documentación de React Hooks AIKZ

Esta documentación describe todos los hooks personalizados disponibles en el directorio `src/hooks/` del sistema AIKZ.

## Estructura de Directorio

```
src/hooks/
├── README.md                (este archivo)
├── useClientesData.js      (Hook para gestión de datos de clientes)
├── useNotasVenta.js        (Hook para gestión de notas de venta)
├── useProductos.js         (Hook para gestión de productos por material)
├── useUpdater.js           (Hook para sistema de actualizaciones Tauri)
└── useVendedoresData.js    (Hook para gestión de datos de vendedores)
```

---

## 🔧 Hooks de Gestión de Datos

### `useClientesData.js`
**Propósito**: Hook personalizado para la gestión completa de datos de clientes con paginación, filtros y carga incremental.

**Importación:**
```javascript
import { useClientesData } from '../hooks/useClientesData';
```

**Uso:**
```javascript
const {
  clientes,
  loading,
  hasMore,
  error,
  totalCount,
  filtros,
  loadMore,
  applyFilters,
  resetFilters,
  refresh
} = useClientesData();
```

**Estados manejados:**
- `clientes` (Array): Lista de clientes cargados
- `loading` (Boolean): Estado de carga
- `hasMore` (Boolean): Si hay más datos para cargar
- `error` (String|null): Mensaje de error si existe
- `totalCount` (Number): Total de registros disponibles
- `filtros` (Object): Filtros aplicados actualmente

**Funciones disponibles:**
- `loadMore()`: Carga más registros (paginación infinita)
- `applyFilters(newFiltros)`: Aplica nuevos filtros y resetea datos
- `resetFilters()`: Limpia todos los filtros
- `refresh()`: Recarga todos los datos desde el inicio

**Configuración:**
- **LIMIT**: 15 registros por página
- **Servicio**: `getClientes` de `../services/api/clientes`

### `useNotasVenta.js`
**Propósito**: Hook para la gestión de notas de venta con funcionalidades idénticas al hook de clientes.

**Importación:**
```javascript
import { useNotasVenta } from '../hooks/useNotasVenta';
```

**Uso:**
```javascript
const {
  notas,
  loading,
  hasMore,
  error,
  totalCount,
  filtros,
  loadMore,
  applyFilters,
  resetFilters,
  refresh
} = useNotasVenta();
```

**Estados manejados:**
- `notas` (Array): Lista de notas de venta cargadas
- Resto de estados idénticos a useClientesData

**Funciones disponibles:**
- Idénticas a useClientesData

**Configuración:**
- **LIMIT**: 15 registros por página
- **Servicio**: `getNotasVentaPaginadas` de `../services/api/pedidos`

### `useProductos.js`
**Propósito**: Hook especializado para gestión de productos filtrados por material (celofán/polietileno).

**Importación:**
```javascript
import { useProductos } from '../hooks/useProductos';
```

**Uso:**
```javascript
const {
  productos,
  loading,
  hasMore,
  error,
  totalCount,
  filtros,
  loadMore,
  applyFilters,
  resetFilters,
  refresh
} = useProductos(material); // material: 'celofan' | 'polietileno'
```

**Parámetros:**
- `material` (String): Tipo de material ('celofan' o 'polietileno')

**Estados manejados:**
- `productos` (Array): Lista de productos del material especificado
- Resto de estados idénticos a otros hooks

**Características especiales:**
- **Dependencia del material**: Solo carga datos cuando se especifica un material
- **Reset automático**: Al cambiar material, resetea todos los datos
- **Validación**: No ejecuta llamadas si no hay material definido

**Configuración:**
- **LIMIT**: 15 registros por página
- **Servicio**: `getProductosPorMaterial` de `../services/api/productos`

### `useVendedoresData.js`
**Propósito**: Hook para gestión de datos de vendedores con funcionalidades estándar de paginación.

**Importación:**
```javascript
import { useVendedoresData } from '../hooks/useVendedoresData';
```

**Uso:**
```javascript
const {
  vendedores,
  loading,
  hasMore,
  error,
  totalCount,
  filtros,
  loadMore,
  applyFilters,
  resetFilters,
  refresh
} = useVendedoresData();
```

**Estados manejados:**
- `vendedores` (Array): Lista de vendedores cargados
- Resto de estados idénticos a otros hooks

**Configuración:**
- **LIMIT**: 15 registros por página
- **Servicio**: `getVendedores` de `../services/api/vendedores`

---

## 🔄 Hook de Sistema

### `useUpdater.js`
**Propósito**: Hook especializado para el sistema de actualizaciones automáticas de la aplicación Tauri.

**Importación:**
```javascript
import { useUpdater } from '../hooks/useUpdater';
```

**Uso:**
```javascript
const {
  updateAvailable,
  updateInfo,
  isUpdating,
  downloadProgress,
  error,
  checkForUpdates,
  downloadAndInstall,
  dismissUpdate,
  isTauri
} = useUpdater();
```

**Estados manejados:**
- `updateAvailable` (Boolean): Si hay actualización disponible
- `updateInfo` (Object|null): Información de la actualización
- `isUpdating` (Boolean): Si está en proceso de actualización
- `downloadProgress` (Number): Progreso de descarga (0-100)
- `error` (String|null): Errores durante el proceso
- `isTauri` (Boolean): Si está ejecutándose en entorno Tauri de producción

**Funciones disponibles:**
- `checkForUpdates()`: Verifica manualmente actualizaciones disponibles
- `downloadAndInstall()`: Descarga e instala la actualización
- `dismissUpdate()`: Descarta la notificación de actualización

**Características especiales:**
- **Detección de entorno**: Solo funciona en Tauri de producción
- **Verificación automática**: Verifica actualizaciones cada 30 minutos
- **Progreso de descarga**: Tracking en tiempo real del progreso
- **Reinicio automático**: Reinicia la app después de actualizar
- **Importación dinámica**: Carga módulos Tauri solo cuando es necesario

**Eventos de descarga manejados:**
- `Started`: Inicio de descarga (progreso = 0)
- `Progress`: Progreso de descarga con cálculo de porcentaje
- `Finished`: Descarga completada (progreso = 100)

**Configuración de verificación:**
- **Intervalo**: 30 minutos (30 * 60 * 1000 ms)
- **Condiciones**: Solo en Tauri + Producción
- **Auto-inicio**: Verifica al montar el componente

---

## 📋 Patrón Común de Hooks de Datos

Los hooks `useClientesData`, `useNotasVenta`, y `useVendedoresData` siguen un patrón común:

### Estados Compartidos
```typescript
interface DataHookState<T> {
  data: T[];              // Array de datos cargados
  loading: boolean;       // Estado de carga
  hasMore: boolean;       // Si hay más datos disponibles
  error: string | null;   // Error actual si existe
  totalCount: number;     // Total de registros
  filtros: object;        // Filtros aplicados
  offset: number;         // Offset interno para paginación
}
```

### Funciones Compartidas
```typescript
interface DataHookActions {
  loadMore: () => void;                    // Carga página siguiente
  applyFilters: (filtros: object) => void; // Aplica filtros
  resetFilters: () => void;                // Limpia filtros
  refresh: () => void;                     // Recarga desde inicio
}
```

### Comportamientos Comunes
1. **Paginación infinita**: Carga incremental de 15 registros
2. **Reset automático**: Al aplicar filtros, resetea offset y datos
3. **Manejo de errores**: Captura y expone errores de API
4. **Loading states**: Estados de carga granulares
5. **useCallback**: Optimización de re-renders
6. **useEffect**: Carga automática al cambiar filtros

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Lista de Clientes con Paginación Infinita
```jsx
import React from 'react';
import { useClientesData } from '../hooks/useClientesData';

const ClientesList = () => {
  const {
    clientes,
    loading,
    hasMore,
    error,
    loadMore,
    applyFilters
  } = useClientesData();

  const handleFilterChange = (newFilters) => {
    applyFilters(newFilters);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {clientes.map(cliente => (
        <div key={cliente.id}>{cliente.empresa}</div>
      ))}

      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
};
```

### Ejemplo 2: Productos por Material
```jsx
import React, { useState } from 'react';
import { useProductos } from '../hooks/useProductos';

const ProductosList = () => {
  const [material, setMaterial] = useState('celofan');
  const { productos, loading, refresh } = useProductos(material);

  return (
    <div>
      <select value={material} onChange={(e) => setMaterial(e.target.value)}>
        <option value="celofan">Celofán</option>
        <option value="polietileno">Polietileno</option>
      </select>

      <button onClick={refresh}>Actualizar</button>

      {loading ? (
        <div>Cargando productos...</div>
      ) : (
        productos.map(producto => (
          <div key={producto.id}>{producto.nombre}</div>
        ))
      )}
    </div>
  );
};
```

### Ejemplo 3: Sistema de Actualizaciones
```jsx
import React from 'react';
import { useUpdater } from '../hooks/useUpdater';

const UpdateNotification = () => {
  const {
    updateAvailable,
    updateInfo,
    isUpdating,
    downloadProgress,
    downloadAndInstall,
    dismissUpdate,
    isTauri
  } = useUpdater();

  if (!isTauri || !updateAvailable) return null;

  return (
    <div className="update-notification">
      <h3>Nueva actualización disponible</h3>
      <p>Versión {updateInfo?.version}</p>

      {isUpdating ? (
        <div>
          <p>Actualizando... {downloadProgress}%</p>
          <progress value={downloadProgress} max="100" />
        </div>
      ) : (
        <div>
          <button onClick={downloadAndInstall}>Actualizar ahora</button>
          <button onClick={dismissUpdate}>Más tarde</button>
        </div>
      )}
    </div>
  );
};
```

---

## ⚡ Optimizaciones y Buenas Prácticas

### useCallback y useMemo
- Todos los hooks utilizan `useCallback` para funciones expuestas
- Evita re-renders innecesarios en componentes hijos
- Dependencias optimizadas para máximo rendimiento

### Manejo de Estados
- Estados iniciales consistentes entre hooks
- Reset de estados apropiado en cambios de filtros
- Estados de error granulares y informativos

### Paginación Eficiente
- Límite consistente de 15 registros
- Offset interno manejado automáticamente
- Indicadores de "hasMore" precisos

### Compatibilidad con Tauri
- Detección automática del entorno
- Importaciones dinámicas para evitar errores en desarrollo
- Verificaciones de compatibilidad robustas

---

## 🔧 Configuración Global

### Constantes Compartidas
```javascript
const LIMIT = 15;  // Registros por página
```

### Dependencias Requeridas
```json
{
  "react": "^18.x",
  "@tauri-apps/plugin-updater": "^2.x",
  "@tauri-apps/api": "^2.x"
}
```

### Servicios API Requeridos
- `../services/api/clientes`
- `../services/api/pedidos`
- `../services/api/productos`
- `../services/api/vendedores`

---

## 📝 Notas de Desarrollo

1. **Consistencia**: Todos los hooks de datos siguen el mismo patrón
2. **Extensibilidad**: Fácil creación de nuevos hooks siguiendo el patrón
3. **Mantenibilidad**: Separación clara de responsabilidades
4. **Performance**: Optimizaciones con useCallback y manejo eficiente de estados
5. **Compatibilidad**: Soporte completo para entornos web y Tauri

---

*Última actualización: $(new Date().toLocaleDateString('es-MX'))*
*Versión: 2.0*