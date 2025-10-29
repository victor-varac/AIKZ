import React from 'react';

const ReportesContables = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📈 Reportes Contables
          </h1>
          <p className="text-gray-600 mt-1">
            Estados financieros y reportes para contabilidad
          </p>
        </div>

        {/* Mensaje de próximamente */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <span className="text-6xl">🚧</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Módulo adicional a cotización
          </h2>

          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            El módulo de Reportes Contables generará automáticamente los principales
            estados financieros requeridos para la contabilidad de tu empresa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Estados Financieros</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Estado de Resultados (P&L)</li>
                <li>• Balance General</li>
                <li>• Estado de Flujo de Efectivo</li>
                <li>• Estado de Cambios en el Patrimonio</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">📈 Reportes de Ingresos</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Ventas por período</li>
                <li>• Análisis por cliente</li>
                <li>• Comparativas mensuales/anuales</li>
                <li>• Proyecciones de ingresos</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">💸 Reportes de Egresos</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Compras a proveedores</li>
                <li>• Gastos operativos por categoría</li>
                <li>• Análisis de costos</li>
                <li>• Control presupuestario</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🏦 Reportes Fiscales</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Cálculo automático de IVA</li>
                <li>• Retenciones e impuestos</li>
                <li>• Reportes para SAT</li>
                <li>• Declaraciones mensuales</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">📋 Reportes Personalizados</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Filtros por fechas y categorías</li>
                <li>• Exportación a Excel/PDF</li>
                <li>• Reportes programados</li>
                <li>• Dashboards personalizables</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">🔄 Integración Contable</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Exportación a sistemas contables</li>
                <li>• Formato de pólizas contables</li>
                <li>• Catálogo de cuentas</li>
                <li>• Conciliaciones automáticas</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center p-4 bg-gray-100 rounded-lg">
              <span className="text-2xl mr-3">🗃️</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Vistas Disponibles en BD</p>
                <p className="text-sm text-gray-600">
                  Ya tienes las vistas <code>reporte_ingresos_mensual</code>,
                  <code>reporte_egresos_compras_mensual</code> y
                  <code>reporte_gastos_operativos_mensual</code> listas para generar reportes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
            <p className="text-yellow-800 text-sm">
              <span className="font-semibold">💡 Mientras tanto:</span>
              Puedes usar el módulo de <strong>Cuentas por Cobrar</strong> que ya está disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesContables;