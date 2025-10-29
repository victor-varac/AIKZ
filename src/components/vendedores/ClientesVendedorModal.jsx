import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getClientes } from '../../services/api/clientes';
import { useNavigate } from 'react-router-dom';

const ClientesVendedorModal = ({ isOpen, onClose, vendedorId, vendedorNombre }) => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(''); // '', true (activos), false (inactivos)
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && vendedorId) {
      loadClientes();
    }
  }, [isOpen, vendedorId, filtroEstado]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros = {
        vendedor_id: vendedorId
      };

      if (filtroEstado !== '') {
        filtros.estado = filtroEstado === 'activos';
      }

      const result = await getClientes({
        filtros,
        limit: 100 // Obtener todos los clientes del vendedor
      });

      setClientes(result.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const handleClienteClick = (clienteId) => {
    navigate(`/clientes/${clienteId}`);
    onClose();
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.empresa?.toLowerCase().includes(searchLower) ||
      cliente.nombre_contacto?.toLowerCase().includes(searchLower) ||
      cliente.correo?.toLowerCase().includes(searchLower) ||
      cliente.telefono?.includes(searchTerm)
    );
  });

  // Contar clientes activos e inactivos
  const clientesActivos = clientes.filter(c => c.estado).length;
  const clientesInactivos = clientes.filter(c => !c.estado).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👥 Clientes de ${vendedorNombre}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-800">{clientes.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Activos</p>
            <p className="text-2xl font-bold text-green-800">{clientesActivos}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Inactivos</p>
            <p className="text-2xl font-bold text-gray-800">{clientesInactivos}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Buscar por empresa, contacto, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="activos">Solo Activos</option>
            <option value="inactivos">Solo Inactivos</option>
          </select>
        </div>

        {/* Lista de clientes */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadClientes}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-yellow-800 font-medium">
              {searchTerm ? 'No se encontraron clientes con esos criterios' : 'Este vendedor no tiene clientes asignados'}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo / Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crédito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleClienteClick(cliente.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.empresa}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cliente.nombre_contacto || 'Sin contacto'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div>{cliente.correo || 'Sin correo'}</div>
                        <div className="text-xs">{cliente.telefono || 'Sin teléfono'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {cliente.dias_credito} días
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.estado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cliente.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ClientesVendedorModal;