import UserMenu from './UserMenu';
import UpdateButton from './UpdateButton';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">AIKZ</h1>
          <span className="text-sm text-gray-500">Sistema de Gestión Industrial</span>
        </div>
        <div className="flex items-center space-x-4">
          <UpdateButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}