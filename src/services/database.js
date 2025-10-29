import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Ruta de la base de datos en el directorio de usuario
const dbPath = process.env.NODE_ENV === 'development'
  ? path.join(process.cwd(), 'aikz_local.db')
  : path.join(app.getPath('userData'), 'aikz_local.db');

let db = null;

export const initDatabase = () => {
  try {
    db = new Database(dbPath);

    // Habilitar claves foráneas
    db.pragma('foreign_keys = ON');

    // Crear tablas si no existen
    createTables();

    console.log('✅ Base de datos local inicializada en:', dbPath);
    return db;
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
};

const createTables = () => {
  // Ejecutar el script de creación de tablas
  const createTablesSQL = `
    -- Tabla de clientes
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      email TEXT,
      rfc TEXT,
      activo BOOLEAN DEFAULT true
    );

    -- Tabla de materias primas celofán
    CREATE TABLE IF NOT EXISTS materias_primas_celofan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      tipo_material TEXT CHECK (tipo_material = 'celofan_rollo') NOT NULL,
      proveedor TEXT,
      activo BOOLEAN DEFAULT true
    );

    -- Tabla de materias primas polietileno
    CREATE TABLE IF NOT EXISTS materias_primas_polietileno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      tipo_material TEXT CHECK (tipo_material IN ('resina_virgen_natural', 'resina_virgen_color', 'arana_bolsas', 'pellet_reciclado')) NOT NULL,
      proveedor TEXT,
      activo BOOLEAN DEFAULT true
    );

    -- Tabla de entradas celofán
    CREATE TABLE IF NOT EXISTS entradas_mp_celofan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_prima_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      cantidad_cares INTEGER NOT NULL,
      precio_unitario DECIMAL(10,2),
      factura TEXT,
      proveedor TEXT,
      observaciones TEXT,
      FOREIGN KEY (materia_prima_id) REFERENCES materias_primas_celofan(id)
    );

    -- Tabla de salidas celofán
    CREATE TABLE IF NOT EXISTS salidas_mp_celofan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_prima_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      cantidad_cares INTEGER NOT NULL,
      destino TEXT,
      orden_produccion TEXT,
      observaciones TEXT,
      FOREIGN KEY (materia_prima_id) REFERENCES materias_primas_celofan(id)
    );

    -- Tabla de entradas polietileno
    CREATE TABLE IF NOT EXISTS entradas_mp_polietileno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_prima_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      cantidad_kilos DECIMAL(10,2) NOT NULL,
      precio_unitario DECIMAL(10,2),
      factura TEXT,
      proveedor TEXT,
      observaciones TEXT,
      FOREIGN KEY (materia_prima_id) REFERENCES materias_primas_polietileno(id)
    );

    -- Tabla de salidas polietileno
    CREATE TABLE IF NOT EXISTS salidas_mp_polietileno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_prima_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      cantidad_kilos DECIMAL(10,2) NOT NULL,
      destino TEXT,
      orden_produccion TEXT,
      observaciones TEXT,
      FOREIGN KEY (materia_prima_id) REFERENCES materias_primas_polietileno(id)
    );

    -- Tabla de productos
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      material TEXT CHECK (material IN ('celofan', 'polietileno')) NOT NULL,
      precio DECIMAL(10,2),
      activo BOOLEAN DEFAULT true
    );

    -- Tabla de notas de venta
    CREATE TABLE IF NOT EXISTS notas_venta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio TEXT NOT NULL UNIQUE,
      fecha DATE NOT NULL,
      clientes_id INTEGER NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      iva DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      estado TEXT DEFAULT 'activa',
      observaciones TEXT,
      FOREIGN KEY (clientes_id) REFERENCES clientes(id)
    );

    -- Tabla de pedidos
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notas_venta_id INTEGER NOT NULL,
      productos_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (notas_venta_id) REFERENCES notas_venta(id),
      FOREIGN KEY (productos_id) REFERENCES productos(id)
    );

    -- Tabla de entregas
    CREATE TABLE IF NOT EXISTS entregas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedidos_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      cantidad INTEGER NOT NULL,
      observaciones TEXT,
      FOREIGN KEY (pedidos_id) REFERENCES pedidos(id)
    );

    -- Vistas para inventario
    CREATE VIEW IF NOT EXISTS vista_inventario_celofan AS
    SELECT
      mp.id,
      mp.descripcion,
      mp.tipo_material,
      COALESCE(SUM(e.cantidad_cares), 0) as entradas_cares,
      COALESCE(SUM(s.cantidad_cares), 0) as salidas_cares,
      (COALESCE(SUM(e.cantidad_cares), 0) - COALESCE(SUM(s.cantidad_cares), 0)) as stock_cares
    FROM materias_primas_celofan mp
    LEFT JOIN entradas_mp_celofan e ON mp.id = e.materia_prima_id
    LEFT JOIN salidas_mp_celofan s ON mp.id = s.materia_prima_id
    WHERE mp.activo = true
    GROUP BY mp.id, mp.descripcion, mp.tipo_material;

    CREATE VIEW IF NOT EXISTS vista_inventario_polietileno AS
    SELECT
      mp.id,
      mp.descripcion,
      mp.tipo_material,
      COALESCE(SUM(e.cantidad_kilos), 0) as entradas_kilos,
      COALESCE(SUM(s.cantidad_kilos), 0) as salidas_kilos,
      (COALESCE(SUM(e.cantidad_kilos), 0) - COALESCE(SUM(s.cantidad_kilos), 0)) as stock_kilos
    FROM materias_primas_polietileno mp
    LEFT JOIN entradas_mp_polietileno e ON mp.id = e.materia_prima_id
    LEFT JOIN salidas_mp_polietileno s ON mp.id = s.materia_prima_id
    WHERE mp.activo = true
    GROUP BY mp.id, mp.descripcion, mp.tipo_material;
  `;

  db.exec(createTablesSQL);

  // Insertar datos de ejemplo si las tablas están vacías
  insertSampleData();
};

const insertSampleData = () => {
  const clienteCount = db.prepare('SELECT COUNT(*) as count FROM clientes').get();

  if (clienteCount.count === 0) {
    const insertClientes = db.prepare(`
      INSERT INTO clientes (nombre, direccion, telefono, email, rfc)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertClientes.run('AIKZ Cliente Demo', 'Dirección Demo', '555-0123', 'demo@aikz.com', 'DEMO123456789');
    insertClientes.run('Cliente Ejemplo 2', 'Otra Dirección', '555-0124', 'ejemplo@test.com', 'EJEM987654321');

    console.log('✅ Datos de ejemplo insertados');
  }
};

export const getDatabase = () => {
  if (!db) {
    initDatabase();
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};