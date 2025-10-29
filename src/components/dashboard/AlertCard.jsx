const AlertCard = ({ alerta }) => {
  const obtenerEstilos = (tipo, prioridad) => {
    const base = {
      error: {
        fondo: 'bg-red-50',
        borde: 'border-red-200',
        icono: 'text-red-600',
        titulo: 'text-red-800',
        texto: 'text-red-700',
        acento: 'bg-red-500'
      },
      warning: {
        fondo: 'bg-yellow-50',
        borde: 'border-yellow-200',
        icono: 'text-yellow-600',
        titulo: 'text-yellow-800',
        texto: 'text-yellow-700',
        acento: 'bg-yellow-500'
      },
      info: {
        fondo: 'bg-blue-50',
        borde: 'border-blue-200',
        icono: 'text-blue-600',
        titulo: 'text-blue-800',
        texto: 'text-blue-700',
        acento: 'bg-blue-500'
      },
      success: {
        fondo: 'bg-green-50',
        borde: 'border-green-200',
        icono: 'text-green-600',
        titulo: 'text-green-800',
        texto: 'text-green-700',
        acento: 'bg-green-500'
      }
    };

    const estilos = base[tipo] || {
      fondo: 'bg-gray-50',
      borde: 'border-gray-200',
      icono: 'text-gray-600',
      titulo: 'text-gray-800',
      texto: 'text-gray-700',
      acento: 'bg-gray-500'
    };

    // Agregar intensidad basada en prioridad
    if (prioridad === 'critica') {
      estilos.animacion = 'animate-pulse';
      estilos.sombra = 'shadow-lg';
    } else if (prioridad === 'alta') {
      estilos.sombra = 'shadow-md';
    } else {
      estilos.sombra = 'shadow-sm';
    }

    return estilos;
  };

  const obtenerIcono = (tipo, iconoCustom) => {
    if (iconoCustom) return iconoCustom;

    switch (tipo) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const obtenerEtiquetaPrioridad = (prioridad) => {
    const etiquetas = {
      critica: { texto: 'CRÍTICO', color: 'bg-red-100 text-red-800' },
      alta: { texto: 'ALTA', color: 'bg-orange-100 text-orange-800' },
      media: { texto: 'MEDIA', color: 'bg-yellow-100 text-yellow-800' },
      baja: { texto: 'BAJA', color: 'bg-blue-100 text-blue-800' }
    };
    return etiquetas[prioridad] || etiquetas.media;
  };

  const formatearMoneda = (monto) => {
    if (!monto || monto === 0) return '$0';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const estilos = obtenerEstilos(alerta.tipo, alerta.prioridad);
  const etiquetaPrioridad = obtenerEtiquetaPrioridad(alerta.prioridad);

  return (
    <div className={`bg-white rounded-lg border-l-4 ${estilos.borde} ${estilos.sombra} overflow-hidden ${estilos.animacion || ''}`}>
      {/* Barra de estado lateral */}
      <div className={`w-1 h-full ${estilos.acento} absolute left-0 top-0`}></div>

      <div className="p-6">
        {/* Header con prioridad */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {obtenerIcono(alerta.tipo, alerta.icono)}
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${estilos.titulo} mb-1`}>
                {alerta.titulo}
              </h3>
              {alerta.prioridad && (
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${etiquetaPrioridad.color}`}>
                  {etiquetaPrioridad.texto}
                </span>
              )}
            </div>
          </div>

          {/* Área opcional */}
          {alerta.area && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {alerta.area}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="space-y-3">
          <div className={`text-sm ${estilos.texto}`}>
            <p>{alerta.mensaje}</p>
          </div>

          {/* Monto si existe */}
          {alerta.monto && (
            <div className={`text-lg font-bold ${estilos.titulo} bg-gray-50 px-3 py-2 rounded-md`}>
              {formatearMoneda(alerta.monto)}
            </div>
          )}

          {/* Acciones recomendadas */}
          {alerta.accionRecomendada && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-2 border-gray-300">
              <div className="text-xs font-medium text-gray-600 mb-1">Acción recomendada:</div>
              <div className="text-xs text-gray-700">{alerta.accionRecomendada}</div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span>Detectado: {new Date().toLocaleTimeString('es-MX')}</span>
            {alerta.prioridad === 'critica' && (
              <span className="text-red-600 font-medium">⚡ Atención inmediata</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;