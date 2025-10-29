import React from 'react';

const ResumenCuentasPorCobrar = ({ resumen, formatCurrency }) => {
  if (!resumen) return null;

  const tarjetas = [
    {
      titulo: "Total por Cobrar",
      valor: resumen.totalPorCobrar,
      icono: "💰",
      color: "blue"
    },
    {
      titulo: "Cuentas Vigentes",
      valor: resumen.vigentes.monto,
      subtitulo: `${resumen.vigentes.cantidad} facturas`,
      icono: "✅",
      color: "green"
    },
    {
      titulo: "Cuentas Vencidas",
      valor: resumen.vencidas.monto,
      subtitulo: `${resumen.vencidas.cantidad} facturas`,
      icono: "⚠️",
      color: "red"
    },
    {
      titulo: "Total Facturas",
      valor: resumen.totalFacturas,
      icono: "📊",
      color: "gray",
      esNumero: true
    }
  ];

  const getColorClasses = (color) => {
    const colores = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", value: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600", value: "text-green-600" },
      red: { bg: "bg-red-100", text: "text-red-600", value: "text-red-600" },
      gray: { bg: "bg-gray-100", text: "text-gray-600", value: "text-gray-900" }
    };
    return colores[color] || colores.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {tarjetas.map((tarjeta, index) => {
        const colors = getColorClasses(tarjeta.color);

        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-2 ${colors.bg} rounded-md`}>
                <span className={`${colors.text} text-xl`}>
                  {tarjeta.icono}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{tarjeta.titulo}</p>
                <p className={`text-2xl font-bold ${colors.value}`}>
                  {tarjeta.esNumero ? tarjeta.valor : formatCurrency(tarjeta.valor)}
                </p>
                {tarjeta.subtitulo && (
                  <p className="text-xs text-gray-500">{tarjeta.subtitulo}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResumenCuentasPorCobrar;