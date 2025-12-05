import { useState, useEffect } from 'react';

// Verificar si estamos en un entorno Tauri
const isTauri = () => {
  // Always return true to force attempts for debugging
  return true;
};

// Verificar si estamos en modo desarrollo
const isDevelopment = () => {
  return import.meta.env.DEV;
};

export const useUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  const checkForUpdates = async () => {
    try {
      // Importar dinámicamente solo si estamos en Tauri de producción
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update?.available) {
        setUpdateAvailable(true);
        setUpdateInfo(update);
        console.log('Actualización disponible:', update.version);
      } else {
        setUpdateAvailable(false);
        setUpdateInfo(null);
      }
    } catch (err) {
      console.error('Error al verificar actualizaciones:', err);
      // DEBUG: Mostrar alerta con el error
      alert(`Error al buscar actualizaciones: ${err.message}`);
      setError(err.message);
    }
  };

  const downloadAndInstall = async () => {
    if (!updateInfo) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Importar dinámicamente
      const { relaunch } = await import('@tauri-apps/plugin-process');

      // Descargar e instalar la actualización con progreso
      await updateInfo.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            setDownloadProgress(0);
            break;
          case 'Progress':
            const progress = Math.round((event.data.chunkLength / event.data.contentLength) * 100);
            setDownloadProgress(progress);
            break;
          case 'Finished':
            setDownloadProgress(100);
            break;
        }
      });

      // Reiniciar la aplicación después de la actualización
      await relaunch();
    } catch (err) {
      console.error('Error durante la actualización:', err);
      alert(`Error durante la actualización: ${err.message}`);
      setError(err.message);
      setIsUpdating(false);
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    setUpdateInfo(null);
    setError(null);
  };

  useEffect(() => {
    // Verificar actualizaciones al montar el componente
    checkForUpdates();

    // Verificar actualizaciones cada 30 minutos
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    updateAvailable,
    updateInfo,
    isUpdating,
    downloadProgress,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
    isTauri: true // Force true for debugging
  };
};