import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ExpandableNavItem = ({ name, icon, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Verificar si algún hijo está activo
  const isAnyChildActive = children?.some(child => location.pathname === child.href);

  // Auto-expandir si algún hijo está activo
  React.useEffect(() => {
    if (isAnyChildActive) {
      setIsExpanded(true);
    }
  }, [isAnyChildActive]);

  return (
    <div>
      {/* Item padre */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200
          ${isAnyChildActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{name}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items hijos */}
      {isExpanded && children && (
        <div className="ml-6 mt-1 space-y-1">
          {children.map((child, index) => (
            <Link
              key={index}
              to={child.href}
              className={`
                flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                ${location.pathname === child.href
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700 ml-2'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="text-lg">{child.icon}</span>
              <span className="text-sm font-medium">{child.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpandableNavItem;