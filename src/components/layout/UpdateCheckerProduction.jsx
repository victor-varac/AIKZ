import React from 'react';
import { useUpdater } from '../../hooks/useUpdater';

const UpdateCheckerProduction = () => {
  const {
    updateAvailable,
    updateInfo,
    isUpdating,
    downloadProgress,
    error,
    downloadAndInstall,
    dismissUpdate
  } = useUpdater();

  const formatVersion = (version) => {
    return version ? `v${version}` : '';
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mx-4 my-2">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">⬆️</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-blue-900">
              Actualización Disponible
            </h4>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {formatVersion(updateInfo?.version)}
            </span>
          </div>

          <p className="text-xs text-blue-700 mb-2">
            Nueva versión del sistema disponible
          </p>

          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              Error: {error}
            </div>
          )}

          {isUpdating && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>Descargando...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={downloadAndInstall}
              disabled={isUpdating}
              className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                isUpdating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUpdating ? 'Actualizando...' : 'Actualizar Ahora'}
            </button>

            <button
              onClick={dismissUpdate}
              disabled={isUpdating}
              className="text-xs px-3 py-1 border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
            >
              Más Tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCheckerProduction;