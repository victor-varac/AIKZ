# Estructura de Carpetas - Sistema de Gestión Industrial

```
AIKZ/
├── public/
│   ├── favicon.ico
│   ├── logo192.png
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBox.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NavItem.jsx
│   │   │   └── UserMenu.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AuthProvider.jsx
│   │   │
│   │   ├── finanzas/
│   │   │   ├── ResumenFinanciero.jsx
│   │   │   ├── IngresosList.jsx
│   │   │   ├── EgresosList.jsx
│   │   │   ├── GastosList.jsx
│   │   │   ├── CuentasPorCobrar.jsx
│   │   │   ├── CuentasPorPagar.jsx
│   │   │   ├── EstadoResultados.jsx
│   │   │   ├── FlujoEfectivo.jsx
│   │   │   ├── PagoForm.jsx
│   │   │   └── GastoForm.jsx
│   │   │
│   │   ├── productos/
│   │   │   ├── ProductosList.jsx
│   │   │   ├── ProductoForm.jsx
│   │   │   ├── ProductoCard.jsx
│   │   │   ├── FiltrosProductos.jsx
│   │   │   └── DetalleProducto.jsx
│   │   │
│   │   ├── pedidos/
│   │   │   ├── PedidosList.jsx
│   │   │   ├── PedidoForm.jsx
│   │   │   ├── NotaVentaForm.jsx
│   │   │   ├── EntregasList.jsx
│   │   │   ├── EntregaForm.jsx
│   │   │   ├── DetallePedido.jsx
│   │   │   └── EstadoPedidos.jsx
│   │   │
│   │   ├── clientes/
│   │   │   ├── ClientesList.jsx
│   │   │   ├── ClienteForm.jsx
│   │   │   ├── ClienteCard.jsx
│   │   │   ├── HistorialCliente.jsx
│   │   │   ├── EstadoCuenta.jsx
│   │   │   └── FiltrosClientes.jsx
│   │   │
│   │   ├── vendedores/
│   │   │   ├── VendedoresList.jsx
│   │   │   ├── VendedorForm.jsx
│   │   │   ├── VendedorCard.jsx
│   │   │   ├── ReporteVentas.jsx
│   │   │   └── ComisionesVendedor.jsx
│   │   │
│   │   ├── produccion/
│   │   │   ├── DashboardProduccion.jsx
│   │   │   ├── ProduccionCelofan.jsx
│   │   │   ├── ProduccionPolietileno.jsx
│   │   │   ├── ProcesoPelletizado.jsx
│   │   │   ├── FormProduccionCelofan.jsx
│   │   │   ├── FormProduccionPolietileno.jsx
│   │   │   ├── FormProcesoPelletizado.jsx
│   │   │   ├── ReporteProduccion.jsx
│   │   │   ├── EficienciaProduccion.jsx
│   │   │   └── CalendarioProduccion.jsx
│   │   │
│   │   ├── almacen/
│   │   │   ├── InventarioCelofan.jsx
│   │   │   ├── InventarioPolietileno.jsx
│   │   │   ├── InventarioMateriaPrima.jsx
│   │   │   ├── MovimientosAlmacen.jsx
│   │   │   ├── ComprasList.jsx
│   │   │   ├── CompraForm.jsx
│   │   │   ├── ProveedoresList.jsx
│   │   │   ├── ProveedorForm.jsx
│   │   │   ├── StockMinimos.jsx
│   │   │   ├── ReporteInventario.jsx
│   │   │   └── TransferenciasStock.jsx
│   │   │
│   │   └── dashboard/
│   │       ├── DashboardMain.jsx
│   │       ├── ResumenGeneral.jsx
│   │       ├── GraficosVentas.jsx
│   │       ├── GraficosProduccion.jsx
│   │       ├── AlertasStock.jsx
│   │       └── NotificacionesSistema.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Finanzas.jsx
│   │   ├── Productos.jsx
│   │   ├── Pedidos.jsx
│   │   ├── Clientes.jsx
│   │   ├── Vendedores.jsx
│   │   ├── Produccion.jsx
│   │   ├── Almacen.jsx
│   │   ├── Usuarios.jsx
│   │   ├── Reportes.jsx
│   │   ├── Configuracion.jsx
│   │   └── NotFound.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSupabase.js
│   │   ├── useLocalStorage.js
│   │   ├── usePagination.js
│   │   ├── useDebounce.js
│   │   ├── useModal.js
│   │   ├── useToast.js
│   │   ├── useProducts.js
│   │   ├── useClientes.js
│   │   ├── useVentas.js
│   │   ├── useProduccion.js
│   │   ├── useInventario.js
│   │   └── useFinanzas.js
│   │
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   ├── ToastContext.js
│   │   └── AppContext.js
│   │
│   ├── services/
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   ├── api/
│   │   │   ├── productos.js
│   │   │   ├── clientes.js
│   │   │   ├── vendedores.js
│   │   │   ├── ventas.js
│   │   │   ├── pedidos.js
│   │   │   ├── produccion.js
│   │   │   ├── almacen.js
│   │   │   ├── finanzas.js
│   │   │   ├── proveedores.js
│   │   │   ├── compras.js
│   │   │   └── reportes.js
│   │   │
│   │   └── utils/
│   │       ├── dataTransform.js
│   │       ├── validation.js
│   │       └── constants.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── dateUtils.js
│   │   ├── calculations.js
│   │   ├── exportUtils.js
│   │   └── permissions.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── animations.css
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── placeholder.jpg
│   │   │   └── icons/
│   │   │
│   │   └── fonts/
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── routes.js
│   │   └── permissions.js
│   │
│   ├── types/
│   │   ├── auth.js
│   │   ├── productos.js
│   │   ├── clientes.js
│   │   ├── ventas.js
│   │   ├── produccion.js
│   │   └── almacen.js
│   │
│   ├── App.jsx
│   ├── index.js
│   └── reportWebVitals.js
│
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Descripción de la Estructura

### 📁 **Components**
- **common/**: Componentes reutilizables (botones, inputs, modales, etc.)
- **layout/**: Componentes de estructura (header, sidebar, navegación)
- **auth/**: Componentes de autenticación y protección de rutas
- **Módulos específicos**: Cada sección del sistema tiene su carpeta con componentes relacionados

### 📁 **Pages**
Páginas principales que corresponden a cada sección del navbar

### 📁 **Hooks**
Custom hooks para lógica reutilizable y manejo de estado

### 📁 **Context**
Contextos de React para estado global (autenticación, tema, notificaciones)

### 📁 **Services**
- **supabase.js**: Configuración de Supabase
- **api/**: Servicios para cada módulo del sistema
- **utils/**: Utilidades para transformación y validación de datos

### 📁 **Utils**
Funciones utilitarias generales del sistema

### 📁 **Config**
Archivos de configuración (rutas, permisos, constantes)

### 📁 **Types**
Definiciones de tipos/interfaces para TypeScript (opcional)

## Navegación Principal

Basándose en tu esquema de base de datos, la navegación incluirá:

1. **Dashboard** - Resumen general
2. **Finanzas** - Reportes financieros, cuentas por cobrar/pagar
3. **Productos** - Catálogo de productos (celofán/polietileno)
4. **Pedidos** - Notas de venta, pedidos, entregas
5. **Clientes** - Gestión de clientes y vendedores
6. **Vendedores** - Gestión de vendedores y comisiones
7. **Producción** - Producción de celofán, polietileno y pelletizado
8. **Almacén** - Inventarios, compras, proveedores, materia prima

## Tecnologías Integradas

- **React.js** con hooks y context
- **Tailwind CSS** para estilos
- **Supabase** para backend y autenticación
- **React Router** para navegación
- Estructura preparada para **TypeScript** (opcional)

Esta estructura es escalable y mantiene una separación clara de responsabilidades, facilitando el mantenimiento y desarrollo colaborativo.