import React, { useState, useEffect } from 'react';
import { getMateriasPrimas, createMateriaPrima, updateMateriaPrima, deleteMateriaPrima, validateMateriaPrimaForDeletion } from '../../services/api/almacenMp';
import MateriaPrimaForm from './MateriaPrimaForm';

const MateriaPrimaList = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [materiasConMovimientos, setMateriasConMovimientos] = useState(new Set());

  useEffect(() => {
    loadMateriasPrimas();
  }, []);

  const loadMateriasPrimas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMateriasPrimas();
      setMateriasPrimas(data);

      // Verificar cuáles materias primas tienen movimientos
      const materiasConMov = new Set();
      for (const materia of data) {
        try {
          const validation = await validateMateriaPrimaForDeletion(materia.id);
          if (validation.hasMovements) {
            materiasConMov.add(materia.id);
          }
        } catch (err) {
          console.error(`Error al validar materia prima ${materia.id}:`, err);
        }
      }
      setMateriasConMovimientos(materiasConMov);

    } catch (err) {
      console.error('Error al cargar materias primas:', err);
      setError(err.message || 'Error al cargar las materias primas');
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
    try {
      setLoading(true);

      // Primero validar si se puede eliminar
      const validation = await validateMateriaPrimaForDeletion(item.id);

      if (!validation.canDelete) {
        alert(
          `❌ No se puede eliminar "${item.nombre}"\n\n` +
          `Esta materia prima tiene movimientos registrados en el almacén (entradas y/o salidas).\n\n` +
          `Para eliminarla, primero debes:\n` +
          `1. Ir a la pestaña "Inventario Actual"\n` +
          `2. Verificar que no tenga stock\n` +
          `3. Eliminar todos los movimientos asociados\n\n` +
          `Alternativamente, considera dejar la materia prima inactiva en lugar de eliminarla.`
        );
        setLoading(false);
        return;
      }

      // Si se puede eliminar, pedir confirmación
      const confirmacion = window.confirm(
        `¿Estás seguro de eliminar la materia prima "${item.nombre}"?\n\n` +
        `Esta acción no se puede deshacer.`
      );

      if (!confirmacion) {
        setLoading(false);
        return;
      }

      await deleteMateriaPrima(item.id);
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
        await updateMateriaPrima(editingItem.id, formData);
        alert(`✅ Materia prima "${formData.nombre}" actualizada exitosamente`);
      } else {
        await createMateriaPrima(formData);
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
            <h3 className="text-lg font-medium text-gray-900">📋 Catálogo de Materias Primas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona el catálogo de materias primas de celofán
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materias primas registradas</h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primera materia prima de celofán.
          </p>
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
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
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.nombre}
                          </div>
                          {item.proceso_asociado && (
                            <div className="text-sm text-gray-500">
                              Proceso: {item.proceso_asociado}
                            </div>
                          )}
                        </div>
                        {materiasConMovimientos.has(item.id) && (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                            title="Esta materia prima tiene movimientos registrados y no puede ser eliminada"
                          >
                            📊 En uso
                          </span>
                        )}
                      </div>
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
                        className={`${
                          materiasConMovimientos.has(item.id)
                            ? 'text-gray-400 hover:text-gray-600 cursor-help'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={
                          materiasConMovimientos.has(item.id)
                            ? 'No se puede eliminar porque tiene movimientos registrados'
                            : 'Eliminar materia prima'
                        }
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
      <MateriaPrimaForm
        isOpen={showForm}
        materiaPrima={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    </div>
  );
};

export default MateriaPrimaList;