import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotaVentaForm from '../pedidos/NotaVentaForm';
import ClienteForm from '../clientes/ClienteForm';
import ProductoForm from '../productos/ProductoForm';

const QuickActions = ({ dashboardData }) => {
  const navigate = useNavigate();

  // Estados para controlar la apertura de modales
  const [showNotaVentaModal, setShowNotaVentaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);

  const quickActions = [
    {
      title: 'Registrar Cliente',
      description: 'Agregar un nuevo cliente',
      icon: '👤',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => setShowClienteModal(true)
    },
    {
      title: 'Nuevo Producto',
      description: 'Añadir producto al catálogo',
      icon: '📦',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => setShowProductoModal(true)
    },
    {
      title: 'Nueva Nota de Venta',
      description: 'Crear una nueva orden de pedido',
      icon: '📝',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => setShowNotaVentaModal(true)
    },
    {
      title: 'Movimiento Almacén',
      description: 'Registrar entrada/salida',
      icon: '📋',
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => navigate('/almacen/celofan')
    }
  ];

  // Manejadores para los modales
  const handleNotaVentaSuccess = () => {
    setShowNotaVentaModal(false);
    alert('✅ Nota de venta creada exitosamente');
  };

  const handleClienteCreated = () => {
    setShowClienteModal(false);
    alert('✅ Cliente registrado exitosamente');
  };

  const handleProductoSuccess = () => {
    setShowProductoModal(false);
    alert('✅ Producto creado exitosamente');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          ⚡ Acciones Rápidas
        </h3>
        <p className="text-sm text-gray-500">
          Acceso directo a funciones principales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} text-white rounded-lg p-4 text-left transition-colors hover:shadow-md group`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <span className="text-white/80 group-hover:text-white">
                →
              </span>
            </div>

            <h4 className="font-medium text-white mb-1">
              {action.title}
            </h4>

            <p className="text-sm text-white/80">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Estadísticas rápidas adicionales */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Hoy</div>
            <div className="text-gray-600">
              {dashboardData?.estadisticasRapidas?.pedidosHoy || 0} pedidos
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Esta semana</div>
            <div className="text-gray-600">
              {dashboardData?.estadisticasRapidas?.entregasSemana || 0} entregas
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Este mes</div>
            <div className="text-gray-600">
              {dashboardData?.estadisticasRapidas?.clientesNuevosMes || 0} clientes nuevos
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Pendientes</div>
            <div className="text-gray-600">
              {dashboardData?.estadisticasRapidas?.pendientesRevisar || 0} por revisar
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <NotaVentaForm
        isOpen={showNotaVentaModal}
        onClose={() => setShowNotaVentaModal(false)}
        onSuccess={handleNotaVentaSuccess}
      />

      <ClienteForm
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onClienteCreated={handleClienteCreated}
      />

      <ProductoForm
        isOpen={showProductoModal}
        onClose={() => setShowProductoModal(false)}
        onSuccess={handleProductoSuccess}
        material="celofan"
      />
    </div>
  );
};

export default QuickActions;