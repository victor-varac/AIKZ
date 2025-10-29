import NavItem from './NavItem';
import ExpandableNavItem from './ExpandableNavItem';
import UpdateChecker from './UpdateChecker';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Pedidos', href: '/pedidos', icon: '📝' },
    { name: 'Clientes', href: '/clientes', icon: '👥' },
    { name: 'Vendedores', href: '/vendedores', icon: '🤝' },
  ];

  const finanzasSubItems = [
    /*{ name: 'Dashboard Financiero', href: '/finanzas/dashboard', icon: '📊' }*/,
    { name: 'Cuentas por Cobrar', href: '/finanzas/cuentas-por-cobrar', icon: '💰' },
    { name: 'Cuentas por Pagar', href: '/finanzas/cuentas-por-pagar', icon: '💸' },
    /*{ name: 'Reportes Contables', href: '/finanzas/reportes', icon: '📈'}*/,
  ];

  const productosSubItems = [
    { name: 'Celofán', href: '/productos/celofan', icon: '📄' },
    { name: 'Polietileno', href: '/productos/polietileno', icon: '🛢️' },
  ];

  const produccionSubItems = [
    { name: 'Celofán', href: '/produccion/celofan', icon: '📄' },
    { name: 'Polietileno', href: '/produccion/polietileno', icon: '🛢️' },
  ];

  const almacenSubItems = [
    { name: 'Celofán', href: '/almacen/celofan', icon: '📄' },
    { name: 'Polietileno', href: '/almacen/polietileno', icon: '🛢️' },
  ];

  const almacenMpSubItems = [
    { name: 'Celofán', href: '/almacen-mp/celofan', icon: '📄' },
    /*{ name: 'Polietileno', href: '/almacen-mp/polietileno', icon: '🛢️' }*/,
  ];

  const proveedoresSubItems = [
    { name: 'Celofán', href: '/proveedores/celofan', icon: '📄' },
    { name: 'Polietileno', href: '/proveedores/polietileno', icon: '🛢️' },
    { name: 'Otros', href: '/proveedores/otros', icon: '📦' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col">
      {/* Verificador de actualizaciones */}
      <UpdateChecker />

      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <NavItem key={item.name} {...item} />
        ))}

        {/* Finanzas expandible */}
        <ExpandableNavItem
          name="Finanzas"
          icon="💰"
          children={finanzasSubItems}
        />

        {/* Productos expandible */}
        <ExpandableNavItem
          name="Productos"
          icon="📦"
          children={productosSubItems}
        />

        {/* Producción expandible 
        <ExpandableNavItem
          name="Producción"
          icon="🏭"
          children={produccionSubItems}
        />
        */}

        {/* Almacén expandible */}
        <ExpandableNavItem
          name="Almacén PR"
          icon="📋"
          children={almacenSubItems}
        />

        {/* Almacén MP expandible */}
        <ExpandableNavItem
          name="Almacén MP"
          icon="🏪"
          children={almacenMpSubItems}
        />

        {/* Proveedores expandible 
        <ExpandableNavItem
          name="Proveedores"
          icon="🏢"
          children={proveedoresSubItems}
        />
        */}
      </nav>
    </aside>
  );
}