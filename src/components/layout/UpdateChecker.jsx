import React, { lazy, Suspense } from 'react';

// Lazy load del componente de producción
const UpdateCheckerProduction = lazy(() => import('./UpdateCheckerProduction'));

const UpdateChecker = () => {
  // Solo mostrar en builds de producción de Tauri
  const isTauri = typeof window !== 'undefined' && window.__TAURI__;
  const isDevelopment = import.meta.env.DEV;

  if (!isTauri || isDevelopment) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <UpdateCheckerProduction />
    </Suspense>
  );
};

export default UpdateChecker;