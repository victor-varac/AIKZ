import { useState } from 'react';
import { useUpdater } from '../../hooks/useUpdater';

export default function UpdateButton() {
  const {
    updateAvailable,
    updateInfo,
    isUpdating,
    downloadProgress,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
    isTauri
  } = useUpdater();

  const [checking, setChecking] = useState(false);
  const [showNoUpdateMessage, setShowNoUpdateMessage] = useState(false);

  // Force render for debugging
  // if (!isTauri) {
  //   return null;
  // }

  const handleCheckUpdate = async () => {
    setChecking(true);
    setShowNoUpdateMessage(false);

    await checkForUpdates();

    setChecking(false);

    // Si no hay actualización, mostrar mensaje temporal
    setTimeout(() => {
      if (!updateAvailable) {
        setShowNoUpdateMessage(true);
        setTimeout(() => setShowNoUpdateMessage(false), 3000);
      }
    }, 500);
  };

  const formatVersion = (version) => {
    return version ? `v${version}` : '';
  };

  return (
    <div className="relative">
      {/* Botón de actualización */}
      {!updateAvailable && (
        <button
          onClick={handleCheckUpdate}
          disabled={checking}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${checking
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          title="Buscar actualizaciones"
        >
          <svg
            className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{checking ? 'Verificando...' : 'Buscar Actualizaciones'}</span>
        </button>
      )}

      {/* Modal de actualización disponible */}
      {updateAvailable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Actualización Disponible
                </h3>
                <p className="text-sm text-gray-600">
                  Nueva versión {formatVersion(updateInfo?.version)} disponible para descargar
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {isUpdating && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                  <span>Descargando actualización...</span>
                  <span className="font-medium">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  La aplicación se reiniciará automáticamente al finalizar
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={downloadAndInstall}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar Ahora'}
              </button>
              <button
                onClick={dismissUpdate}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Más Tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de "ya está actualizado" */}
      {showNoUpdateMessage && (
        <div className="absolute top-full mt-2 right-0 bg-green-50 border border-green-200 rounded-md px-4 py-2 shadow-lg">
          <p className="text-sm text-green-700 whitespace-nowrap">
            ✓ Ya tienes la última versión
          </p>
        </div>
      )}
    </div>
  );
}
