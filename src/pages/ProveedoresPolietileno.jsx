import React, { useState, useEffect } from 'react';
import { getProveedoresByMaterial, toggleProveedorStatus, createProveedor, updateProveedor } from '../services/api/proveedores';
import ProveedorForm from '../components/proveedores/ProveedorForm';

const ProveedoresPolietileno = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);

  // Datos simulados por ahora - luego implementaremos API
  const mockProveedores = [
    {
      id: 4,
      nombre: 'Polímeros y Resinas del Bajío',
      contacto: 'Ana Ruiz',
      telefono: '(477) 2345-6789',
      email: 'ventas@poliresbajio.com',
      direccion: 'Parque Industrial León, GTO',
      dias_pago: 30,
      activo: true,
      materiales: ['polietileno'],
      productos_principales: ['Resina virgen natural', 'Resina reciclada', 'Pellets industriales']
    },
    {
      id: 5,
      nombre: 'Distribuidora de Polietilenos MX',
      contacto: 'Carlos Hernández',
      telefono: '(81) 8765-4321',
      email: 'contacto@poliemx.com',
      direccion: 'Zona Industrial Apodaca, NL',
      dias_pago: 15,
      activo: true,
      materiales: ['polietileno'],
      productos_principales: ['Polietileno alta densidad', 'Polietileno baja densidad', 'Aditivos']
    },
    {
      id: 6,
      nombre: 'Petroquímica Industrial del Centro',
      contacto: 'Miguel Torres',
      telefono: '(55) 1234-9876',
      email: 'ventas@petroquimicacentro.mx',
      direccion: 'Complejo Industrial Tula, HGO',
      dias_pago: 45,
      activo: true,
      materiales: ['polietileno'],
      productos_principales: ['Resina virgen color', 'Compuestos especiales', 'Masterbatch']
    },
    {
      id: 7,
      nombre: 'Reciclados Polietileno Verde',
      contacto: 'Laura Jiménez',
      telefono: '(33) 5555-7890',
      email: 'info@polietilenoverde.com',
      direccion: 'Eco-parque Guadalajara, JAL',
      dias_pago: 20,
      activo: false,
      materiales: ['polietileno'],
      productos_principales: ['Pellet reciclado', 'Material post-consumo', 'Soluciones sustentables']
    }
  ];

  useEffect(() => {
    cargarProveedores();
  }, [searchTerm]);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const data = await getProveedoresByMaterial('polietileno', {
        search: searchTerm || undefined
      });
      setProveedores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeProveedores = proveedores.filter(p => p.activo);
  const inactiveProveedores = proveedores.filter(p => !p.activo);

  const handleToggleStatus = async (id) => {
    try {
      await toggleProveedorStatus(id);
      cargarProveedores();
    } catch (err) {
      alert('Error al cambiar el estado del proveedor: ' + err.message);
    }
  };

  const handleSaveProveedor = async (proveedorData) => {
    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, proveedorData);
      } else {
        await createProveedor(proveedorData);
      }
      cargarProveedores();
      setShowForm(false);
      setEditingProveedor(null);
    } catch (err) {
      throw new Error('Error al guardar el proveedor: ' + err.message);
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProveedor(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🛢️ Proveedores de Polietileno
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de proveedores especializados en polietileno y resinas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Proveedor</span>
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <span className="text-blue-600 text-xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Proveedores</p>
                <p className="text-2xl font-bold text-gray-900">{proveedores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeProveedores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-md">
                <span className="text-red-600 text-xl">⏸️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{inactiveProveedores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-md">
                <span className="text-orange-600 text-xl">🛢️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Especialidad</p>
                <p className="text-lg font-bold text-orange-600">Polietileno</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proveedores por nombre, contacto o productos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de proveedores activos */}
        {activeProveedores.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                ✅ Proveedores Activos ({activeProveedores.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {activeProveedores.map((proveedor) => (
                <div key={proveedor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {proveedor.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        👤 {proveedor.contacto}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Activo
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📞</span>
                      <span>{proveedor.telefono}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">✉️</span>
                      <span className="truncate">{proveedor.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📍</span>
                      <span className="truncate">{proveedor.direccion}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">💰</span>
                      <span>{proveedor.dias_pago} días de crédito</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        🛢️ Especialista en Polietileno
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {proveedor.id}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleEdit(proveedor)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de proveedores inactivos */}
        {inactiveProveedores.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                ⏸️ Proveedores Inactivos ({inactiveProveedores.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {inactiveProveedores.map((proveedor) => (
                <div key={proveedor.id} className="border border-gray-200 rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        {proveedor.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">
                        👤 {proveedor.contacto}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Inactivo
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📞</span>
                      <span>{proveedor.telefono}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">✉️</span>
                      <span className="truncate">{proveedor.email}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(proveedor.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Reactivar
                    </button>
                    <button
                      onClick={() => handleEdit(proveedor)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {proveedores.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl">🏢</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              No se encontraron proveedores
            </h3>
            <p className="text-gray-500 mt-2">
              {searchTerm
                ? 'No hay proveedores que coincidan con tu búsqueda'
                : 'Aún no tienes proveedores de polietileno registrados'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Agregar Primer Proveedor
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar proveedores</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de proveedor */}
        <ProveedorForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSave={handleSaveProveedor}
          proveedor={editingProveedor}
          material="polietileno"
        />
      </div>
    </div>
  );
};

export default ProveedoresPolietileno;