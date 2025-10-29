// Datos de prueba para el módulo de finanzas
// Estos datos simulan lo que vendría de la base de datos

export const mockCuentasPorCobrar = [
  {
    cliente_id: 1,
    nombre_cliente: "Distribuidora Los Pinos SA",
    nombre_contacto: "Juan Pérez",
    telefono: "(555) 123-4567",
    dias_credito: 30,
    numero_factura: "FAC-001",
    fecha_factura: "2024-01-15",
    monto_factura: 15000.00,
    total_pagado: 5000.00,
    saldo_pendiente: 10000.00,
    fecha_vencimiento: "2024-02-14",
    estado_cuenta: "VIGENTE",
    dias_vencido: null
  },
  {
    cliente_id: 2,
    nombre_cliente: "Empacadora Central",
    nombre_contacto: "María González",
    telefono: "(555) 987-6543",
    dias_credito: 15,
    numero_factura: "FAC-002",
    fecha_factura: "2024-01-10",
    monto_factura: 25000.00,
    total_pagado: 0.00,
    saldo_pendiente: 25000.00,
    fecha_vencimiento: "2024-01-25",
    estado_cuenta: "VENCIDA",
    dias_vencido: 15
  },
  {
    cliente_id: 3,
    nombre_cliente: "Plastificados del Norte",
    nombre_contacto: "Carlos Ruiz",
    telefono: "(555) 456-7890",
    dias_credito: 45,
    numero_factura: "FAC-003",
    fecha_factura: "2024-02-01",
    monto_factura: 8500.00,
    total_pagado: 0.00,
    saldo_pendiente: 8500.00,
    fecha_vencimiento: "2024-03-17",
    estado_cuenta: "VIGENTE",
    dias_vencido: null
  }
];

export const mockResumenCuentasPorCobrar = {
  totalPorCobrar: 43500.00,
  vigentes: {
    monto: 18500.00,
    cantidad: 2
  },
  vencidas: {
    monto: 25000.00,
    cantidad: 1
  },
  totalFacturas: 3
};