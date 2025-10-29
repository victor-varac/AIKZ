#!/bin/bash

# Script de construcción para distribución al cliente
# AIKZ Sistema de Gestión

echo "🚀 Construyendo AIKZ para distribución..."
echo "======================================"

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf src-tauri/target/release/bundle
rm -rf dist/

# Construir la aplicación
echo "🔨 Construyendo aplicación de escritorio..."
npm run tauri:build

# Verificar si el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente!"
    echo ""
    echo "📁 Archivos generados en:"
    echo "   - macOS: src-tauri/target/release/bundle/macos/"
    echo "   - Windows: src-tauri/target/release/bundle/msi/"
    echo "   - Linux: src-tauri/target/release/bundle/deb/"
    echo ""
    echo "🎉 ¡Aplicación lista para entregar al cliente!"
    echo ""
    echo "📋 Instrucciones para el cliente:"
    echo "   1. Descomprimir el archivo"
    echo "   2. Ejecutar el instalador"
    echo "   3. La aplicación aparecerá en el escritorio"
    echo "   4. ¡Listo para usar con datos en la nube!"
else
    echo "❌ Error en el build. Revisar los logs anteriores."
    exit 1
fi