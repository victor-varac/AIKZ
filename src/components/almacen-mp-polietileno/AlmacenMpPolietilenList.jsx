import React, { useState, useEffect } from 'react';
import { getInventarioMateriaPrimaPolietileno, getMovimientosMateriaPrimaPolietileno, createMovimientoMateriaPrimaPolietileno } from '../../services/api/almacenMpPolietileno';
import InventarioMpPolietilenTable from './InventarioMpPolietilenTable';
import EntradaMpPolietilenForm from './EntradaMpPolietilenForm';
import SalidaMpPolietilenForm from './SalidaMpPolietilenForm';
import MateriaPrimaPolietilenList from './MateriaPrimaPolietilenList';
import EntradaMpPolietilenCards from './EntradaMpPolietilenCards';
import SalidaMpPolietilenCards from './SalidaMpPolietilenCards';

const AlmacenMpPolietilenList = () => {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('materia-prima'); // 'materia-prima' | 'entrada' | 'inventario' | 'salida'
  const [showEntradaForm, setShowEntradaForm] = useState(false);
  const [showSalidaForm, setShowSalidaForm] = useState(false);
  const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] = useState(null);

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (view === 'inventario' || view === 'entrada' || view === 'salida') {
        // Cargar inventario de materia prima tipo polietileno
        const data = await getInventarioMateriaPrimaPolietileno();
        setInventario(data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMovimientoCreated = (nuevoMovimiento) => {
    // Recargar datos después de crear un movimiento
    loadData();
    setShowEntradaForm(false);
    setShowSalidaForm(false);
    setMateriaPrimaSeleccionada(null);
  };

  const handleNuevaEntrada = (materiaPrima) => {
    setMateriaPrimaSeleccionada(materiaPrima);
    setShowEntradaForm(true);
  };

  const handleNuevaSalida = (materiaPrima) => {
    setMateriaPrimaSeleccionada(materiaPrima);
    setShowSalidaForm(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar los datos</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🛢️ Almacén MP - Polietileno
              </h1>
              <p className="mt-2 text-gray-600">
                Gestión de inventario y movimientos de materia prima de polietileno
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {view === 'entrada' && (
                <button
                  onClick={() => setShowEntradaForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  📥 Nueva Entrada
                </button>
              )}
              {view === 'salida' && (
                <button
                  onClick={() => setShowSalidaForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  📤 Nueva Salida
                </button>
              )}
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setView('materia-prima')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'materia-prima'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Materia Prima
              </button>
              <button
                onClick={() => setView('entrada')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'entrada'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📥 Entrada
              </button>
              <button
                onClick={() => setView('inventario')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'inventario'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Inventario Actual
              </button>
              <button
                onClick={() => setView('salida')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'salida'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📤 Salida
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según vista */}
        {view === 'materia-prima' && (
          <MateriaPrimaPolietilenList />
        )}

        {view === 'inventario' && (
          <InventarioMpPolietilenTable
            inventario={inventario}
            loading={loading}
          />
        )}

        {view === 'entrada' && (
          <EntradaMpPolietilenCards
            materiasPrimas={inventario}
            loading={loading}
            onNuevaEntrada={handleNuevaEntrada}
          />
        )}

        {view === 'salida' && (
          <SalidaMpPolietilenCards
            materiasPrimas={inventario}
            loading={loading}
            onNuevaSalida={handleNuevaSalida}
          />
        )}

        {/* Modal para registrar entrada */}
        <EntradaMpPolietilenForm
          isOpen={showEntradaForm}
          onCancel={() => {
            setShowEntradaForm(false);
            setMateriaPrimaSeleccionada(null);
          }}
          onMovimientoCreated={handleMovimientoCreated}
          materiaPrimaPreseleccionada={materiaPrimaSeleccionada}
        />

        {/* Modal para registrar salida */}
        <SalidaMpPolietilenForm
          isOpen={showSalidaForm}
          onCancel={() => {
            setShowSalidaForm(false);
            setMateriaPrimaSeleccionada(null);
          }}
          onMovimientoCreated={handleMovimientoCreated}
          inventario={inventario}
          materiaPrimaPreseleccionada={materiaPrimaSeleccionada}
        />
      </div>
    </div>
  );
};

export default AlmacenMpPolietilenList;