-- =====================================================
-- SISTEMA DE GESTIÓN INDUSTRIAL - ESTRUCTURA DE BASE DE DATOS
-- =====================================================

-- Creación de tipos de datos personalizados (ENUMS)
CREATE TYPE material_type AS ENUM ('celofan', 'polietileno');
CREATE TYPE presentacion_type AS ENUM ('micraje', 'gramaje', 'bobina', 'bolsa');
CREATE TYPE tipo_type AS ENUM ('mordaza', 'lateral', 'pegol', 'cenefa + pegol', '100gr corta', '100gr larga', '150gr', '250gr', '500gr', '1kg', '1.5kg', '2kg', '2.5kg', '3kg', 'negra', 'semi natural', 'virgen', 'color');
CREATE TYPE turno_type AS ENUM ('matutino', 'vespertino', 'nocturno');
CREATE TYPE movimiento_type AS ENUM ('entrada', 'salida');
CREATE TYPE rol_type AS ENUM ('admin', 'operador', 'vendedor', 'supervisor');
CREATE TYPE materia_prima_type AS ENUM ('celofan_rollo', 'resina_virgen_natural', 'resina_virgen_color', 'arana_bolsas', 'pellet_reciclado');
CREATE TYPE unidad_medida_type AS ENUM ('kg', 'litros', 'toneladas', 'metros', 'unidades', 'millares');
CREATE TYPE estado_materia_prima AS ENUM ('crudo', 'procesado', 'listo_produccion');

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de vendedores
CREATE TABLE public.vendedores (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL
);

-- Tabla de usuarios del sistema
CREATE TABLE public.usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    rol rol_type,
    email VARCHAR UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    puesto TEXT,
    contraseña VARCHAR,
    auth_uid UUID,
    CONSTRAINT usuarios_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES auth.users(id)
);

-- Tabla de productos
CREATE TABLE public.productos (
    id SERIAL PRIMARY KEY,
    material material_type,
    presentacion presentacion_type,
    tipo tipo_type,
    ancho_cm DOUBLE PRECISION CHECK (ancho_cm >= 0),
    largo_cm DOUBLE PRECISION CHECK (largo_cm >= 0),
    micraje_um NUMERIC CHECK (micraje_um >= 0),
    nombre TEXT
);

-- Tabla de clientes
CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    nombre_contacto TEXT,
    empresa TEXT,
    correo TEXT,
    telefono TEXT,
    direccion TEXT,
    dias_credito NUMERIC CHECK (dias_credito >= 0),
    estado BOOLEAN,
    vendedores_id INTEGER,
    CONSTRAINT clientes_vendedores_id_fkey FOREIGN KEY (vendedores_id) REFERENCES public.vendedores(id)
);

-- Tabla de proveedores
CREATE TABLE public.proveedores (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    dias_pago NUMERIC CHECK (dias_pago >= 0),
    activo BOOLEAN DEFAULT true
);

-- Catálogo de materias primas
CREATE TABLE public.materias_primas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo materia_prima_type NOT NULL,
    unidad_medida unidad_medida_type NOT NULL,
    requiere_procesamiento BOOLEAN DEFAULT false,
    proceso_asociado TEXT,
    stock_minimo NUMERIC CHECK (stock_minimo >= 0),
    precio_promedio NUMERIC CHECK (precio_promedio >= 0)
);

-- Tabla de compras
CREATE TABLE public.compras (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    proveedor_id INTEGER NOT NULL,
    numero_factura TEXT,
    subtotal NUMERIC CHECK (subtotal >= 0),
    iva NUMERIC CHECK (iva >= 0),
    total NUMERIC CHECK (total >= 0),
    pagada BOOLEAN DEFAULT false,
    fecha_pago DATE,
    CONSTRAINT compras_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);

-- Detalles de compras
CREATE TABLE public.detalle_compras (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL,
    materia_prima_id INTEGER NOT NULL,
    cantidad NUMERIC CHECK (cantidad > 0),
    precio_unitario NUMERIC CHECK (precio_unitario >= 0),
    importe NUMERIC CHECK (importe >= 0),
    CONSTRAINT detalle_compras_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id),
    CONSTRAINT detalle_compras_materia_prima_id_fkey FOREIGN KEY (materia_prima_id) REFERENCES public.materias_primas(id)
);

-- =====================================================
-- TABLAS DE PRODUCCIÓN
-- =====================================================

-- Producción de celofán
CREATE TABLE public.produccion_celofan (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    turno turno_type NOT NULL,
    maquina TEXT,
    productos_id INTEGER NOT NULL,
    millares NUMERIC CHECK (millares >= 0),
    operador TEXT,
    CONSTRAINT produccion_celofan_productos_id_fkey FOREIGN KEY (productos_id) REFERENCES public.productos(id)
);

-- Producción de polietileno
CREATE TABLE public.produccion_polietileno (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    turno turno_type NOT NULL,
    maquina TEXT,
    productos_id INTEGER,
    kilos NUMERIC CHECK (kilos >= 0),
    operador TEXT,
    CONSTRAINT produccion_polietileno_productos_id_fkey FOREIGN KEY (productos_id) REFERENCES public.productos(id)
);

-- Proceso de pelletizado (conversión de araña a pellet)
CREATE TABLE public.proceso_pelletizado (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    turno turno_type NOT NULL,
    arana_kilos_entrada NUMERIC CHECK (arana_kilos_entrada >= 0),
    pellet_kilos_salida NUMERIC CHECK (pellet_kilos_salida >= 0),
    eficiencia_porcentaje NUMERIC CHECK (eficiencia_porcentaje >= 0 AND eficiencia_porcentaje <= 100),
    operador TEXT,
    observaciones TEXT
);

-- =====================================================
-- TABLAS DE VENTAS
-- =====================================================

-- Notas de venta (facturas)
CREATE TABLE public.notas_venta (
    id SERIAL PRIMARY KEY,
    fecha DATE,
    clientes_id INTEGER,
    descuento NUMERIC CHECK (descuento >= 0),
    subtotal NUMERIC CHECK (subtotal >= 0),
    iva NUMERIC CHECK (iva >= 0),
    total NUMERIC CHECK (total >= 0),
    numero_factura VARCHAR,
    CONSTRAINT notas_venta_clientes_id_fkey FOREIGN KEY (clientes_id) REFERENCES public.clientes(id)
);

-- Pedidos (detalles de las notas de venta)
CREATE TABLE public.pedidos (
    id SERIAL PRIMARY KEY,
    notas_venta_id INTEGER,
    productos_id INTEGER,
    cantidad DOUBLE PRECISION CHECK (cantidad > 0),
    precio_kilo_venta NUMERIC,
    precio_unitario_venta DOUBLE PRECISION,
    precio_iva DOUBLE PRECISION,
    importe DOUBLE PRECISION,
    CONSTRAINT pedidos_notas_venta_id_fkey FOREIGN KEY (notas_venta_id) REFERENCES public.notas_venta(id),
    CONSTRAINT pedidos_productos_id_fkey FOREIGN KEY (productos_id) REFERENCES public.productos(id)
);

-- Entregas
CREATE TABLE public.entregas (
    id SERIAL PRIMARY KEY,
    cantidad NUMERIC CHECK (cantidad >= 0),
    unidades TEXT,
    fecha_entrega DATE,
    pedidos_id INTEGER,
    CONSTRAINT entregas_pedidos_id_fkey FOREIGN KEY (pedidos_id) REFERENCES public.pedidos(id)
);

-- =====================================================
-- TABLAS DE ALMACÉN
-- =====================================================

-- Movimientos de almacén - Celofán
CREATE TABLE public.almacen_celofan_movimientos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    producto_id INTEGER,
    millares INTEGER CHECK (millares >= 0),
    movimiento movimiento_type NOT NULL,
    produccion_id INTEGER,
    entrega_id INTEGER,
    CONSTRAINT almacen_celofan_movimientos_entrega_id_fkey FOREIGN KEY (entrega_id) REFERENCES public.entregas(id),
    CONSTRAINT almacen_celofan_movimientos_produccion_id_fkey FOREIGN KEY (produccion_id) REFERENCES public.produccion_celofan(id)
);

-- Movimientos de almacén - Polietileno
CREATE TABLE public.almacen_polietileno_movimientos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    producto_id INTEGER,
    kilos NUMERIC CHECK (kilos >= 0),
    movimiento movimiento_type NOT NULL,
    produccion_id INTEGER,
    entrega_id INTEGER,
    CONSTRAINT almacen_polietileno_movimientos_entrega_id_fkey FOREIGN KEY (entrega_id) REFERENCES public.entregas(id),
    CONSTRAINT almacen_polietileno_movimientos_produccion_id_fkey FOREIGN KEY (produccion_id) REFERENCES public.produccion_polietileno(id)
);

-- Movimientos de almacén - Materia Prima
CREATE TABLE public.almacen_materia_prima_movimientos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    materia_prima_id INTEGER NOT NULL,
    cantidad NUMERIC CHECK (cantidad >= 0),
    movimiento movimiento_type NOT NULL,
    estado_material estado_materia_prima DEFAULT 'crudo',

    -- Referencias según origen/destino
    detalle_compra_id INTEGER,
    proceso_pelletizado_id INTEGER,
    produccion_celofan_id INTEGER,
    produccion_polietileno_id INTEGER,

    costo_unitario NUMERIC,
    observaciones TEXT,

    CONSTRAINT almacen_mp_materia_prima_fkey FOREIGN KEY (materia_prima_id) REFERENCES public.materias_primas(id),
    CONSTRAINT almacen_mp_detalle_compra_fkey FOREIGN KEY (detalle_compra_id) REFERENCES public.detalle_compras(id),
    CONSTRAINT almacen_mp_proceso_pelletizado_fkey FOREIGN KEY (proceso_pelletizado_id) REFERENCES public.proceso_pelletizado(id),
    CONSTRAINT almacen_mp_prod_celofan_fkey FOREIGN KEY (produccion_celofan_id) REFERENCES public.produccion_celofan(id),
    CONSTRAINT almacen_mp_prod_polietileno_fkey FOREIGN KEY (produccion_polietileno_id) REFERENCES public.produccion_polietileno(id)
);

-- =====================================================
-- TABLAS FINANCIERAS
-- =====================================================

-- Pagos
CREATE TABLE public.pagos (
    id SERIAL PRIMARY KEY,
    notas_venta_id INTEGER,
    fecha DATE NOT NULL,
    importe NUMERIC CHECK (importe >= 0),
    foto_comprobante TEXT,
    metodo_pago TEXT,
    CONSTRAINT pagos_notas_venta_id_fkey FOREIGN KEY (notas_venta_id) REFERENCES public.notas_venta(id)
);

-- Gastos
CREATE TABLE public.gastos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    concepto TEXT,
    importe NUMERIC CHECK (importe >= 0),
    categoria TEXT
);

-- =====================================================
-- TABLAS DEL SISTEMA
-- =====================================================

-- Historial de chat
CREATE TABLE public.kz_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR NOT NULL,
    message JSONB NOT NULL
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar rendimiento en consultas frecuentes
CREATE INDEX idx_productos_material ON public.productos(material);
CREATE INDEX idx_notas_venta_fecha ON public.notas_venta(fecha);
CREATE INDEX idx_notas_venta_cliente ON public.notas_venta(clientes_id);
CREATE INDEX idx_produccion_celofan_fecha ON public.produccion_celofan(fecha);
CREATE INDEX idx_produccion_polietileno_fecha ON public.produccion_polietileno(fecha);
CREATE INDEX idx_almacen_celofan_fecha ON public.almacen_celofan_movimientos(fecha);
CREATE INDEX idx_almacen_polietileno_fecha ON public.almacen_polietileno_movimientos(fecha);
CREATE INDEX idx_pagos_fecha ON public.pagos(fecha);
CREATE INDEX idx_gastos_fecha ON public.gastos(fecha);

-- Índices para materia prima
CREATE INDEX idx_materias_primas_tipo ON public.materias_primas(tipo);
CREATE INDEX idx_compras_fecha ON public.compras(fecha);
CREATE INDEX idx_compras_proveedor ON public.compras(proveedor_id);
CREATE INDEX idx_almacen_mp_fecha ON public.almacen_materia_prima_movimientos(fecha);
CREATE INDEX idx_almacen_mp_materia_prima ON public.almacen_materia_prima_movimientos(materia_prima_id);
CREATE INDEX idx_almacen_mp_movimiento ON public.almacen_materia_prima_movimientos(movimiento);
CREATE INDEX idx_proceso_pelletizado_fecha ON public.proceso_pelletizado(fecha);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de inventario actual de celofán
CREATE VIEW vista_inventario_celofan AS
SELECT 
    p.id as producto_id,
    p.nombre as producto,
    COALESCE(SUM(CASE WHEN acm.movimiento = 'entrada' THEN acm.millares ELSE -acm.millares END), 0) as stock_cares
FROM public.productos p
LEFT JOIN public.almacen_celofan_movimientos acm ON p.id = acm.producto_id
WHERE p.material = 'celofan'
GROUP BY p.id, p.nombre;

-- Vista de inventario actual de polietileno
CREATE VIEW vista_inventario_polietileno AS
SELECT 
    p.id as producto_id,
    p.nombre as producto,
    COALESCE(SUM(CASE WHEN apm.movimiento = 'entrada' THEN apm.kilos ELSE -apm.kilos END), 0) as stock_kilos
FROM public.productos p
LEFT JOIN public.almacen_polietileno_movimientos apm ON p.id = apm.producto_id
WHERE p.material = 'polietileno'
GROUP BY p.id, p.nombre;

-- Vista de ventas por cliente
CREATE VIEW vista_ventas_por_cliente AS
SELECT
    c.id as cliente_id,
    c.empresa,
    c.nombre_contacto,
    COUNT(nv.id) as total_facturas,
    SUM(nv.total) as total_vendido
FROM public.clientes c
LEFT JOIN public.notas_venta nv ON c.id = nv.clientes_id
GROUP BY c.id, c.empresa, c.nombre_contacto;

-- Vista de inventario de materia prima
CREATE VIEW vista_inventario_materia_prima AS
SELECT
    mp.id as materia_prima_id,
    mp.nombre,
    mp.tipo,
    mp.unidad_medida,
    mp.stock_minimo,
    COALESCE(SUM(CASE WHEN ampm.movimiento = 'entrada' THEN ampm.cantidad ELSE -ampm.cantidad END), 0) as stock_actual,
    CASE
        WHEN COALESCE(SUM(CASE WHEN ampm.movimiento = 'entrada' THEN ampm.cantidad ELSE -ampm.cantidad END), 0) <= mp.stock_minimo
        THEN 'BAJO'
        ELSE 'OK'
    END as estado_stock
FROM public.materias_primas mp
LEFT JOIN public.almacen_materia_prima_movimientos ampm ON mp.id = ampm.materia_prima_id
GROUP BY mp.id, mp.nombre, mp.tipo, mp.unidad_medida, mp.stock_minimo;

-- Vista de eficiencia del proceso de pelletizado
CREATE VIEW vista_eficiencia_pelletizado AS
SELECT
    DATE_TRUNC('month', fecha) as mes,
    SUM(arana_kilos_entrada) as total_arana_entrada,
    SUM(pellet_kilos_salida) as total_pellet_salida,
    CASE
        WHEN SUM(arana_kilos_entrada) > 0
        THEN ROUND((SUM(pellet_kilos_salida) / SUM(arana_kilos_entrada) * 100)::numeric, 2)
        ELSE 0
    END as eficiencia_promedio
FROM public.proceso_pelletizado
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- =====================================================
-- VISTAS PARA REPORTES CONTABLES
-- =====================================================

-- 1. Reporte de Ingresos (Facturas de Venta Emitidas)
CREATE VIEW reporte_ingresos_mensual AS
SELECT
    nv.fecha,
    nv.numero_factura,
    c.empresa as nombre_cliente,
    c.nombre_contacto,
    nv.subtotal,
    nv.iva,
    nv.total,
    EXTRACT(YEAR FROM nv.fecha) as año,
    EXTRACT(MONTH FROM nv.fecha) as mes
FROM public.notas_venta nv
JOIN public.clientes c ON nv.clientes_id = c.id
ORDER BY nv.fecha DESC;

-- 2. Reporte de Egresos por Compras (Facturas de Proveedores)
CREATE VIEW reporte_egresos_compras_mensual AS
SELECT
    c.fecha,
    c.numero_factura,
    p.nombre as nombre_proveedor,
    p.contacto,
    c.subtotal,
    c.iva,
    c.total,
    EXTRACT(YEAR FROM c.fecha) as año,
    EXTRACT(MONTH FROM c.fecha) as mes
FROM public.compras c
JOIN public.proveedores p ON c.proveedor_id = p.id
ORDER BY c.fecha DESC;

-- 3. Reporte de Gastos Operativos
CREATE VIEW reporte_gastos_operativos_mensual AS
SELECT
    fecha,
    concepto,
    categoria,
    importe,
    EXTRACT(YEAR FROM fecha) as año,
    EXTRACT(MONTH FROM fecha) as mes
FROM public.gastos
ORDER BY fecha DESC;

-- 4. Reporte de Saldos de Clientes (Cuentas por Cobrar)
CREATE VIEW reporte_cuentas_por_cobrar AS
SELECT
    c.id as cliente_id,
    c.empresa as nombre_cliente,
    c.nombre_contacto,
    c.telefono,
    c.dias_credito,
    nv.numero_factura,
    nv.fecha as fecha_factura,
    nv.total as monto_factura,
    COALESCE(SUM(p.importe), 0) as total_pagado,
    (nv.total - COALESCE(SUM(p.importe), 0)) as saldo_pendiente,
    nv.fecha + INTERVAL '1 day' * c.dias_credito as fecha_vencimiento,
    CASE
        WHEN nv.fecha + INTERVAL '1 day' * c.dias_credito < CURRENT_DATE
            AND (nv.total - COALESCE(SUM(p.importe), 0)) > 0
        THEN 'VENCIDA'
        WHEN (nv.total - COALESCE(SUM(p.importe), 0)) > 0
        THEN 'VIGENTE'
        ELSE 'PAGADA'
    END as estado_cuenta,
    CASE
        WHEN nv.fecha + INTERVAL '1 day' * c.dias_credito < CURRENT_DATE
            AND (nv.total - COALESCE(SUM(p.importe), 0)) > 0
        THEN CURRENT_DATE - (nv.fecha + INTERVAL '1 day' * c.dias_credito)
        ELSE NULL
    END as dias_vencido
FROM public.clientes c
JOIN public.notas_venta nv ON c.id = nv.clientes_id
LEFT JOIN public.pagos p ON nv.id = p.notas_venta_id
GROUP BY c.id, c.empresa, c.nombre_contacto, c.telefono, c.dias_credito,
         nv.id, nv.numero_factura, nv.fecha, nv.total
ORDER BY c.empresa, nv.fecha DESC;

-- 5. Reporte de Saldos de Proveedores (Cuentas por Pagar)
CREATE VIEW reporte_cuentas_por_pagar AS
SELECT
    p.id as proveedor_id,
    p.nombre as nombre_proveedor,
    p.contacto,
    p.telefono,
    p.dias_pago,
    c.numero_factura,
    c.fecha as fecha_factura,
    c.total as monto_factura,
    c.pagada,
    c.fecha_pago,
    CASE
        WHEN NOT c.pagada AND c.fecha + INTERVAL '1 day' * p.dias_pago < CURRENT_DATE
        THEN 'VENCIDA'
        WHEN NOT c.pagada
        THEN 'VIGENTE'
        ELSE 'PAGADA'
    END as estado_cuenta,
    CASE
        WHEN NOT c.pagada AND c.fecha + INTERVAL '1 day' * p.dias_pago < CURRENT_DATE
        THEN CURRENT_DATE - (c.fecha + INTERVAL '1 day' * p.dias_pago)
        ELSE NULL
    END as dias_vencido,
    c.fecha + INTERVAL '1 day' * p.dias_pago as fecha_vencimiento
FROM public.proveedores p
JOIN public.compras c ON p.id = c.proveedor_id
ORDER BY p.nombre, c.fecha DESC;

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para calcular el stock actual de un producto
CREATE OR REPLACE FUNCTION obtener_stock_producto(p_producto_id INTEGER, p_material material_type)
RETURNS NUMERIC AS $$
DECLARE
    stock_actual NUMERIC := 0;
BEGIN
    IF p_material = 'celofan' THEN
        SELECT COALESCE(SUM(CASE WHEN movimiento = 'entrada' THEN millares ELSE -millares END), 0)
        INTO stock_actual
        FROM public.almacen_celofan_movimientos
        WHERE producto_id = p_producto_id;
    ELSIF p_material = 'polietileno' THEN
        SELECT COALESCE(SUM(CASE WHEN movimiento = 'entrada' THEN kilos ELSE -kilos END), 0)
        INTO stock_actual
        FROM public.almacen_polietileno_movimientos
        WHERE producto_id = p_producto_id;
    END IF;

    RETURN stock_actual;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular el stock actual de materia prima
CREATE OR REPLACE FUNCTION obtener_stock_materia_prima(p_materia_prima_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    stock_actual NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(CASE WHEN movimiento = 'entrada' THEN cantidad ELSE -cantidad END), 0)
    INTO stock_actual
    FROM public.almacen_materia_prima_movimientos
    WHERE materia_prima_id = p_materia_prima_id;

    RETURN stock_actual;
END;
$$ LANGUAGE plpgsql;

-- Función para validar disponibilidad antes de consumo
CREATE OR REPLACE FUNCTION validar_disponibilidad_materia_prima(
    p_materia_prima_id INTEGER,
    p_cantidad_requerida NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
    stock_disponible NUMERIC;
BEGIN
    stock_disponible := obtener_stock_materia_prima(p_materia_prima_id);
    RETURN stock_disponible >= p_cantidad_requerida;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA AUDITORÍA
-- =====================================================

-- Tabla de auditoría
CREATE TABLE public.auditoria (
    id SERIAL PRIMARY KEY,
    tabla TEXT NOT NULL,
    operacion TEXT NOT NULL,
    usuario TEXT,
    fecha_hora TIMESTAMP DEFAULT NOW(),
    datos_anteriores JSONB,
    datos_nuevos JSONB
);

-- Función para trigger de auditoría
CREATE OR REPLACE FUNCTION trigger_auditoria() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.auditoria(tabla, operacion, usuario, datos_anteriores)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.auditoria(tabla, operacion, usuario, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.auditoria(tabla, operacion, usuario, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoría a tablas críticas
CREATE TRIGGER trigger_auditoria_productos AFTER INSERT OR UPDATE OR DELETE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

CREATE TRIGGER trigger_auditoria_notas_venta AFTER INSERT OR UPDATE OR DELETE ON public.notas_venta
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

CREATE TRIGGER trigger_auditoria_pagos AFTER INSERT OR UPDATE OR DELETE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

-- Triggers de auditoría para materia prima
CREATE TRIGGER trigger_auditoria_materias_primas AFTER INSERT OR UPDATE OR DELETE ON public.materias_primas
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

CREATE TRIGGER trigger_auditoria_compras AFTER INSERT OR UPDATE OR DELETE ON public.compras
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

CREATE TRIGGER trigger_auditoria_almacen_mp AFTER INSERT OR UPDATE OR DELETE ON public.almacen_materia_prima_movimientos
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();

CREATE TRIGGER trigger_auditoria_proceso_pelletizado AFTER INSERT OR UPDATE OR DELETE ON public.proceso_pelletizado
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria();