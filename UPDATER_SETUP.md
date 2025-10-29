# 🔄 Sistema de Actualizaciones Automáticas AIKZ

Este documento explica cómo configurar y usar el sistema de actualizaciones automáticas del ERP AIKZ.

## 📋 Configuración Inicial

### 1. Generar claves de firma (Solo una vez)

```bash
# Instalar tauri-cli si no lo tienes
npm install -g @tauri-apps/cli

# Generar par de claves para firmar actualizaciones
tauri signer generate -w ~/.tauri/myapp.key
```

Esto generará:
- `~/.tauri/myapp.key` (clave privada - MANTENER SECRETA)
- Una clave pública que debes copiar al `tauri.conf.json`

### 2. Actualizar tauri.conf.json

Reemplaza la `pubkey` en el archivo `src-tauri/tauri.conf.json` con tu clave pública generada:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": false,
      "pubkey": "TU_CLAVE_PUBLICA_AQUI",
      "endpoints": [
        "https://tu-servidor.com/updates/{{target}}/{{arch}}/{{current_version}}"
      ]
    }
  }
}
```

## 🚀 Flujo de Publicación de Actualizaciones

### 1. Compilar nueva versión

```bash
# Cambiar versión en package.json y tauri.conf.json
# Ejemplo: "1.0.0" -> "1.1.0"

# Compilar la aplicación
npm run tauri build
```

### 2. Firmar los archivos de actualización

```bash
# Firmar el archivo de actualización (en el directorio de salida)
tauri signer sign ~/.tauri/myapp.key target/release/bundle/YOUR_APP.app.tar.gz
```

### 3. Crear archivo de manifiesto

Crear un archivo JSON con la información de la actualización:

```json
{
  "version": "1.1.0",
  "notes": "Nuevas funcionalidades: Gestión de gastos mejorada",
  "pub_date": "2025-01-15T12:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "FIRMA_GENERADA_POR_TAURI_SIGNER",
      "url": "https://tu-servidor.com/releases/aikz-1.1.0-x64.app.tar.gz"
    },
    "darwin-aarch64": {
      "signature": "FIRMA_GENERADA_POR_TAURI_SIGNER",
      "url": "https://tu-servidor.com/releases/aikz-1.1.0-arm64.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "FIRMA_GENERADA_POR_TAURI_SIGNER",
      "url": "https://tu-servidor.com/releases/aikz-1.1.0-x64.msi.zip"
    }
  }
}
```

## 🌐 Configuración del Servidor

### Estructura de directorios recomendada:

```
tu-servidor.com/
├── updates/
│   ├── darwin/
│   │   ├── x86_64/
│   │   │   └── 1.0.0 (archivo JSON con info de actualización)
│   │   └── aarch64/
│   │       └── 1.0.0
│   └── windows/
│       └── x86_64/
│           └── 1.0.0
└── releases/
    ├── aikz-1.1.0-x64.app.tar.gz
    ├── aikz-1.1.0-arm64.app.tar.gz
    └── aikz-1.1.0-x64.msi.zip
```

### Endpoint del servidor:

La aplicación buscará actualizaciones en:
`https://tu-servidor.com/updates/{target}/{arch}/{current_version}`

Donde:
- `{target}`: darwin, windows, linux
- `{arch}`: x86_64, aarch64, i686
- `{current_version}`: versión actual de la app

## ✅ Funcionalidades Implementadas

### En el Sidebar:
- ✅ Notificación visual cuando hay actualización disponible
- ✅ Botón "Actualizar Ahora" para descarga e instalación inmediata
- ✅ Botón "Más Tarde" para posponer la actualización
- ✅ Barra de progreso durante la descarga
- ✅ Manejo de errores con mensajes informativos

### Verificación Automática:
- ✅ Verifica actualizaciones al iniciar la aplicación
- ✅ Verifica cada 30 minutos automáticamente
- ✅ Solo funciona en builds de producción (no en desarrollo)

### Proceso de Actualización:
1. 🔍 Verifica si hay actualización disponible
2. 📥 Descarga la nueva versión en segundo plano
3. ✅ Verifica la firma criptográfica
4. 🔄 Instala y reinicia automáticamente

## 🚨 Notas Importantes

1. **Seguridad**: Las actualizaciones están firmadas criptográficamente
2. **Desarrollo**: El updater solo funciona en builds de producción
3. **Compatibilidad**: Funciona en Windows, macOS y Linux
4. **Servidor**: Necesitas configurar tu propio servidor de actualizaciones
5. **Versiones**: Sigue versionado semántico (major.minor.patch)

## 🔧 Comandos Útiles

```bash
# Compilar para producción
npm run tauri build

# Compilar y firmar automáticamente
npm run tauri build --config src-tauri/tauri.conf.json

# Verificar configuración del updater
tauri info

# Generar nuevas claves de firma
tauri signer generate -w ~/.tauri/myapp.key --force
```

## 📦 Ejemplo de Implementación Simple

Para una implementación básica, puedes usar GitHub Releases como servidor:

1. Configura el endpoint en `tauri.conf.json`:
```json
"endpoints": [
  "https://api.github.com/repos/tu-usuario/aikz-erp/releases/latest"
]
```

2. Publica releases en GitHub con los archivos firmados
3. La aplicación verificará automáticamente las nuevas releases

¡Listo! Tu ERP AIKZ ahora tiene actualizaciones automáticas. 🎉