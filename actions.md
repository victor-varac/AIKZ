# AIKZ - Registro de Acciones

Este archivo documenta las acciones realizadas por agentes de IA y desarrolladores en el proyecto.

---

## 2025-12-11 - Claude (Opus 4.5)

### Sesión: Fix Bug - Productos no aparecen completos en selector de pedidos

**Contexto:** El cliente reporta que al entrar a la pantalla Pedidos (Notas de venta), seleccionar un pedido y querer agregar un producto, no aparecen todos los productos registrados (709 total: 600 celofán + 109 polietileno).

**Causa Raíz Identificada:**
- `PedidoForm.jsx`: Solo cargaba 50 productos por material (100 total de 709)
- `NotaVentaForm.jsx`: Usaba función `getProductos()` sin paginación adecuada

**Archivos Modificados:**

1. **`src/components/pedidos/PedidoForm.jsx`** (líneas 58-62)
   - Cambio: `limit: 50` → `limit: 1000` para ambos materiales
   - Ahora carga todos los productos disponibles

2. **`src/components/pedidos/NotaVentaForm.jsx`** (líneas 2-3, 68-96)
   - Cambio de import: Removido `getProductos`, agregado `getProductosPorMaterial`
   - Función `loadInitialData`: Ahora carga productos de ambos materiales con límite 1000

**Estado:** Completado

---
