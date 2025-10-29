import React, { useState, useEffect } from 'react';
import { getMateriasPrimasPolietileno, createMateriaPrimaPolietileno, updateMateriaPrimaPolietileno, deleteMateriaPrimaPolietileno } from '../../services/api/almacenMpPolietileno';
import MateriaPrimaPolietilenForm from './MateriaPrimaPolietilenForm';

const MateriaPrimaPolietilenList = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadMateriasPrimas();
  }, []);

  const loadMateriasPrimas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMateriasPrimasPolietileno();
      setMateriasPrimas(data);
    } catch (err) {
      console.error('Error al cargar materias primas de polietileno:', err);
      setError(err.message || 'Error al cargar las materias primas de polietileno');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la materia prima "${item.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      setLoading(true);
      await deleteMateriaPrimaPolietileno(item.id);
      await loadMateriasPrimas();
      alert(`✅ Materia prima "${item.nombre}" eliminada exitosamente`);
    } catch (err) {
      console.error('Error al eliminar materia prima:', err);
      alert(`❌ Error al eliminar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateMateriaPrimaPolietileno(editingItem.id, formData);
        alert(`✅ Materia prima "${formData.nombre}" actualizada exitosamente`);
      } else {
        await createMateriaPrimaPolietileno(formData);
        alert(`✅ Materia prima "${formData.nombre}" creada exitosamente`);
      }

      setShowForm(false);
      setEditingItem(null);
      await loadMateriasPrimas();
    } catch (err) {
      console.error('Error al guardar materia prima:', err);
      throw err; // Re-lanzar para que el formulario lo maneje
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  const getTipoDisplayName = (tipo) => {
    const tipos = {
      'resina_virgen_natural': 'Resina Virgen Natural',
      'resina_virgen_color': 'Resina Virgen Color',
      'arana_bolsas': 'Araña para Bolsas',
      'pellet_reciclado': 'Pellet Reciclado'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      'resina_virgen_natural': '🔹',
      'resina_virgen_color': '🎨',
      'arana_bolsas': '🕷️',
      'pellet_reciclado': '♻️'
    };
    return iconos[tipo] || '🛢️';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <span className="text-red-500 text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error al cargar las materias primas</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={loadMateriasPrimas}
              className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">🛢️ Catálogo de Materias Primas - Polietileno</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona el catálogo de materias primas de polietileno
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            ➕ Nueva Materia Prima
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : materiasPrimas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">🛢️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materias primas de polietileno registradas</h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primera materia prima de polietileno.
          </p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            ➕ Crear Primera Materia Prima
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad de Medida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requiere Procesamiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materiasPrimas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.nombre}
                      </div>
                      {item.proceso_asociado && (
                        <div className="text-sm text-gray-500">
                          Proceso: {item.proceso_asociado}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getTipoIcon(item.tipo)} {getTipoDisplayName(item.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.stock_minimo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.precio_promedio ? formatCurrency(item.precio_promedio) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.requiere_procesamiento
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.requiere_procesamiento ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Total de materias primas: {materiasPrimas.length}
              </span>
              <div className="flex space-x-4">
                <span className="text-green-600">
                  Sin procesamiento: {materiasPrimas.filter(item => !item.requiere_procesamiento).length}
                </span>
                <span className="text-yellow-600">
                  Requiere procesamiento: {materiasPrimas.filter(item => item.requiere_procesamiento).length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal para crear/editar materia prima */}
      <MateriaPrimaPolietilenForm
        isOpen={showForm}
        materiaPrima={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    </div>
  );
};

export default MateriaPrimaPolietilenList;