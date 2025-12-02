# 🔄 Sistema de Actualizaciones Automáticas - AIKZ

Esta documentación explica cómo configurar y usar el sistema de actualizaciones automáticas implementado en el ERP AIKZ.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Generar Claves de Firma](#generar-claves-de-firma)
3. [Configurar GitHub Repository](#configurar-github-repository)
4. [Crear el Primer Release](#crear-el-primer-release)
5. [Publicar Actualizaciones Futuras](#publicar-actualizaciones-futuras)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🚀 Configuración Inicial

### 1. Generar Claves de Firma

Las claves de firma son **CRÍTICAS** para la seguridad. Permiten verificar que las actualizaciones provienen de ti y no han sido alteradas.

#### Paso 1: Generar las claves

Ejecuta el siguiente comando en la terminal (en la raíz del proyecto):

```bash
npm run tauri signer generate -- -w ~/.tauri/aikz-gestion.key
```

O alternativamente:

```bash
npx @tauri-apps/cli@latest signer generate -w ~/.tauri/aikz-gestion.key
```

Este comando generará:
- **Clave privada**: Guardada en `~/.tauri/aikz-gestion.key` (mantén esto en secreto)
- **Clave pública**: Se mostrará en la consola (necesitas copiarla)

#### Paso 2: Copiar la clave pública

La salida se verá así:

```
Your keypair was generated successfully
Private: C:\Users\TuUsuario\.tauri\aikz-gestion.key (Keep this private!)
Public: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFBQUFBQUFBQUFBQUE...
```

Copia **TODA** la línea que comienza con "dW50..." (será mucho más larga).

#### Paso 3: Actualizar tauri.conf.json

Abre `src-tauri/tauri.conf.json` y reemplaza:

```json
"pubkey": "AQUI_IRA_TU_CLAVE_PUBLICA_GENERADA"
```

Por tu clave pública real:

```json
"pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFBQUFBQUFBQUFBQUE..."
```

### 2. Configurar GitHub Repository

#### Paso 1: Identificar tu repositorio

Necesitas saber el nombre de tu repositorio de GitHub. Por ejemplo:
- Usuario: `tu-usuario-github`
- Repositorio: `aikz-erp`

#### Paso 2: Actualizar tauri.conf.json

En el mismo archivo `src-tauri/tauri.conf.json`, reemplaza:

```json
"endpoints": [
  "https://github.com/USUARIO/REPOSITORIO/releases/latest/download/latest.json"
]
```

Por tus datos reales:

```json
"endpoints": [
  "https://github.com/tu-usuario-github/aikz-erp/releases/latest/download/latest.json"
]
```

### 3. Configurar Variables de Entorno para CI/CD (Opcional pero Recomendado)

Si planeas usar GitHub Actions para automatizar los builds:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Crea un secreto llamado `TAURI_SIGNING_PRIVATE_KEY`
5. Pega el contenido del archivo `~/.tauri/aikz-gestion.key`

---

## 📦 Crear el Primer Release

### Paso 1: Incrementar la Versión

Antes de crear un release, actualiza la versión en:

**`src-tauri/tauri.conf.json`:**
```json
{
  "productName": "AIKZ Sistema de Gestión",
  "version": "1.0.1",  // Incrementar aquí
  ...
}
```

**`src-tauri/Cargo.toml`:**
```toml
[package]
name = "aikz-gestion"
version = "1.0.1"  # Incrementar aquí también
```

### Paso 2: Hacer Build de Producción

Ejecuta el comando de build:

```bash
npm run tauri build
```

Este proceso tomará varios minutos y generará:

**Windows:**
- `src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi`
- `src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi.zip`
- `src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi.zip.sig`

**macOS (si aplica):**
- `src-tauri/target/release/bundle/macos/AIKZ Sistema de Gestión.app.tar.gz`
- `src-tauri/target/release/bundle/macos/AIKZ Sistema de Gestión.app.tar.gz.sig`

### Paso 3: Firmar el Instalador

El instalador debe firmarse con tu clave privada:

**Windows:**
```bash
npm run tauri signer sign "src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi.zip" -k ~/.tauri/aikz-gestion.key
```

Esto generará el archivo `.sig` necesario.

### Paso 4: Crear el archivo latest.json

Crea un archivo llamado `latest.json` con el siguiente contenido:

```json
{
  "version": "1.0.1",
  "notes": "Correcciones de errores y mejoras de rendimiento",
  "pub_date": "2025-12-01T10:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "CONTENIDO_DEL_ARCHIVO_SIG",
      "url": "https://github.com/tu-usuario/aikz-erp/releases/download/v1.0.1/AIKZ.Sistema.de.Gestion_1.0.1_x64_es-MX.msi.zip"
    }
  }
}
```

**Para obtener la firma:**
- Abre el archivo `.sig` con un editor de texto
- Copia TODO el contenido
- Pégalo en el campo `signature` (en una sola línea)

### Paso 5: Crear el Release en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Releases** → **Draft a new release**
3. En **Choose a tag**, escribe `v1.0.1` y click en **Create new tag**
4. En **Release title**, escribe `v1.0.1`
5. En **Description**, describe los cambios:
   ```markdown
   ## 🎉 Nueva versión 1.0.1

   ### ✨ Mejoras
   - Sistema de actualizaciones automáticas
   - Mejoras en el rendimiento

   ### 🐛 Correcciones
   - Corrección de errores menores
   ```

6. **Arrastra y suelta** estos archivos en la sección de assets:
   - ✅ `AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi.zip`
   - ✅ `AIKZ Sistema de Gestión_1.0.1_x64_es-MX.msi.zip.sig`
   - ✅ `latest.json`

7. ⚠️ **IMPORTANTE**: Renombra los archivos en GitHub para que no tengan espacios:
   - `AIKZ.Sistema.de.Gestion_1.0.1_x64_es-MX.msi.zip`
   - `AIKZ.Sistema.de.Gestion_1.0.1_x64_es-MX.msi.zip.sig`
   - `latest.json` (este no cambiar)

8. Click en **Publish release**

### Paso 6: Verificar la URL del latest.json

La URL de tu archivo `latest.json` debe ser:
```
https://github.com/tu-usuario/aikz-erp/releases/latest/download/latest.json
```

Verifica que puedas acceder a esta URL en tu navegador.

---

## 🔄 Publicar Actualizaciones Futuras

Para cada nueva versión:

### 1. Incrementar la Versión

Actualiza la versión en:
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### 2. Commit y Push

```bash
git add .
git commit -m "chore: bump version to 1.0.2"
git push origin main
```

### 3. Hacer Build

```bash
npm run tauri build
```

### 4. Firmar el Instalador

```bash
npm run tauri signer sign "src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_1.0.2_x64_es-MX.msi.zip" -k ~/.tauri/aikz-gestion.key
```

### 5. Actualizar latest.json

Actualiza el archivo `latest.json` con:
- Nueva versión
- Nueva firma (del archivo `.sig`)
- Nueva URL (con el nuevo número de versión)
- Nueva fecha
- Nuevas notas

### 6. Crear Nuevo Release en GitHub

Repite el proceso del Paso 5 de "Crear el Primer Release" con la nueva versión.

### 7. ¡Listo!

Los usuarios que tengan la aplicación instalada:
- Recibirán una notificación automática de actualización (banner)
- O pueden hacer clic en "Buscar Actualizaciones" en el header
- La aplicación descargará e instalará la actualización automáticamente

---

## 🎯 Cómo Funciona el Sistema

### Para los Usuarios

1. **Notificación Automática**: La app verifica actualizaciones cada 30 minutos
2. **Botón Manual**: Los usuarios pueden hacer clic en "Buscar Actualizaciones" cuando quieran
3. **Descarga Automática**: Al confirmar, la actualización se descarga en segundo plano
4. **Instalación**: La app se cierra, instala y reinicia automáticamente

### Para el Desarrollador

1. Incrementas la versión en los archivos de configuración
2. Haces el build de producción
3. Firmas el instalador con tu clave privada
4. Creas un GitHub Release con los archivos
5. Los usuarios reciben la actualización automáticamente

---

## 🔧 Solución de Problemas

### Error: "Failed to verify signature"

**Causa**: La firma no coincide con la clave pública configurada.

**Solución**:
- Verifica que la clave pública en `tauri.conf.json` sea correcta
- Asegúrate de haber firmado el instalador con la clave privada correcta
- El contenido del archivo `.sig` debe estar completo en el `latest.json`

### Error: "Network error" al buscar actualizaciones

**Causa**: No se puede acceder al endpoint de GitHub.

**Solución**:
- Verifica que el URL en `tauri.conf.json` sea correcto
- Asegúrate de que el release sea público
- Verifica que el archivo `latest.json` exista en el release

### La actualización no se detecta

**Causa**: La versión en `latest.json` no es mayor que la actual.

**Solución**:
- Verifica que la versión en `latest.json` sea mayor que la instalada
- El formato de versión debe ser semántico (ej: 1.0.1, 1.1.0, 2.0.0)

### Error: "Permission denied" al instalar

**Causa**: Windows requiere permisos de administrador.

**Solución**:
- Configura `installMode` en `tauri.conf.json`:
  ```json
  "windows": {
    "installMode": "passive"
  }
  ```

### El botón no aparece en desarrollo

**Causa**: El sistema de actualizaciones solo funciona en builds de producción.

**Solución**:
- El botón y las notificaciones solo aparecen en la versión compilada (`.msi`)
- En modo desarrollo (`npm run tauri:dev`) no se muestran

---

## 📚 Recursos Adicionales

- [Documentación oficial de Tauri Updater](https://tauri.app/plugin/updater/)
- [Guía de firma de código](https://tauri.app/distribute/sign/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## 🔐 Seguridad

### ⚠️ NUNCA COMPARTAS TU CLAVE PRIVADA

- ❌ NO la subas a GitHub
- ❌ NO la compartas por email o chat
- ❌ NO la incluyas en el código
- ✅ Guárdala en un lugar seguro (ej: `~/.tauri/`)
- ✅ Haz backups encriptados en un lugar seguro
- ✅ Usa GitHub Secrets para CI/CD

### Cómo hacer backup de la clave privada

```bash
# Copiar a un USB o carpeta segura
cp ~/.tauri/aikz-gestion.key /ruta/segura/backup/aikz-gestion.key.backup

# O crear un backup encriptado
tar -czf aikz-keys-backup.tar.gz ~/.tauri/aikz-gestion.key
```

---

## ✅ Checklist de Implementación

Usa este checklist para asegurarte de que todo está configurado correctamente:

- [ ] Generar claves de firma con `tauri signer generate`
- [ ] Copiar la clave pública a `src-tauri/tauri.conf.json`
- [ ] Actualizar el endpoint en `tauri.conf.json` con tu repositorio de GitHub
- [ ] Incrementar la versión en `tauri.conf.json` y `Cargo.toml`
- [ ] Hacer el build de producción con `npm run tauri build`
- [ ] Firmar el instalador con la clave privada
- [ ] Crear el archivo `latest.json` con la firma y URL correctas
- [ ] Crear el release en GitHub con los archivos necesarios
- [ ] Renombrar los archivos en GitHub para eliminar espacios
- [ ] Verificar que la URL del `latest.json` sea accesible
- [ ] Probar la actualización en una máquina con la versión anterior instalada

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección de [Solución de Problemas](#solución-de-problemas)
2. Verifica los logs de la aplicación
3. Consulta la documentación oficial de Tauri
4. Crea un issue en el repositorio con detalles del error

---

**¡Listo!** 🎉 Ahora tienes un sistema de actualizaciones automáticas completamente funcional.
