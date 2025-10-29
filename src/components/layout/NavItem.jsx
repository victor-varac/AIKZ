import { Link, useLocation } from 'react-router-dom';

export default function NavItem({ name, href, icon }) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
        ${isActive
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{name}</span>
    </Link>
  );
}