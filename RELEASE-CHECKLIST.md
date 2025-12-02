# 📋 Checklist Rápido para Crear un Release

## Antes del Primer Release

1. **Generar claves de firma** (solo una vez):
   ```bash
   npm run tauri signer generate -- -w ~/.tauri/aikz-gestion.key
   ```

2. **Actualizar `src-tauri/tauri.conf.json`**:
   - Agregar la clave pública en el campo `pubkey`
   - Actualizar el endpoint con tu usuario y repositorio de GitHub

## Para Cada Nuevo Release

### 1️⃣ Preparar la Versión

- [ ] Incrementar versión en `src-tauri/tauri.conf.json`
- [ ] Incrementar versión en `src-tauri/Cargo.toml`
- [ ] Asegurarte de que las versiones coincidan
- [ ] Commit y push de los cambios

### 2️⃣ Construir

- [ ] Ejecutar: `npm run tauri build`
- [ ] Esperar a que termine (puede tomar varios minutos)
- [ ] Verificar que se generaron los archivos en `src-tauri/target/release/bundle/`

### 3️⃣ Firmar

**Windows:**
```bash
npm run tauri signer sign "src-tauri/target/release/bundle/msi/AIKZ Sistema de Gestión_X.X.X_x64_es-MX.msi.zip" -k ~/.tauri/aikz-gestion.key
```

- [ ] Se generó el archivo `.sig`
- [ ] Abrir el archivo `.sig` y copiar su contenido completo

### 4️⃣ Crear latest.json

Crear archivo `latest.json`:

```json
{
  "version": "X.X.X",
  "notes": "Descripción de los cambios",
  "pub_date": "2025-12-01T10:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "PEGAR_CONTENIDO_DEL_ARCHIVO_SIG_AQUI",
      "url": "https://github.com/USUARIO/REPO/releases/download/vX.X.X/AIKZ.Sistema.de.Gestion_X.X.X_x64_es-MX.msi.zip"
    }
  }
}
```

- [ ] Versión actualizada
- [ ] Firma del archivo `.sig` pegada
- [ ] URL correcta con la nueva versión
- [ ] Fecha actual en formato ISO
- [ ] Notas de la versión

### 5️⃣ Crear Release en GitHub

1. - [ ] Ir a GitHub → Releases → "Draft a new release"
2. - [ ] Tag: `vX.X.X` (crear nuevo tag)
3. - [ ] Release title: `vX.X.X`
4. - [ ] Escribir descripción de cambios
5. - [ ] Arrastrar estos archivos:
   - `AIKZ Sistema de Gestión_X.X.X_x64_es-MX.msi.zip`
   - `AIKZ Sistema de Gestión_X.X.X_x64_es-MX.msi.zip.sig`
   - `latest.json`
6. - [ ] Renombrar archivos (eliminar espacios):
   - `AIKZ.Sistema.de.Gestion_X.X.X_x64_es-MX.msi.zip`
   - `AIKZ.Sistema.de.Gestion_X.X.X_x64_es-MX.msi.zip.sig`
   - `latest.json` (no cambiar)
7. - [ ] Click en "Publish release"

### 6️⃣ Verificar

- [ ] Acceder a: `https://github.com/USUARIO/REPO/releases/latest/download/latest.json`
- [ ] Verificar que el JSON se muestre correctamente
- [ ] Probar la actualización en una máquina con versión anterior

## ✅ Archivos Necesarios para Cada Release

```
GitHub Release Assets:
├── AIKZ.Sistema.de.Gestion_X.X.X_x64_es-MX.msi.zip
├── AIKZ.Sistema.de.Gestion_X.X.X_x64_es-MX.msi.zip.sig
└── latest.json
```

## 🎯 URLs Importantes

- **Endpoint configurado**: `https://github.com/USUARIO/REPO/releases/latest/download/latest.json`
- **Releases**: `https://github.com/USUARIO/REPO/releases`
- **Latest release**: `https://github.com/USUARIO/REPO/releases/latest`

## 🚨 Errores Comunes

1. **Versión no coincide**: Verificar `tauri.conf.json` y `Cargo.toml`
2. **Firma inválida**: Asegurarse de firmar con la clave correcta
3. **URL incorrecta en latest.json**: Verificar nombre del archivo (sin espacios)
4. **Espacios en nombres de archivos**: Renombrar en GitHub antes de publicar

## 💡 Tips

- Usa versionado semántico: `MAJOR.MINOR.PATCH`
  - MAJOR: Cambios incompatibles con versiones anteriores
  - MINOR: Nueva funcionalidad compatible
  - PATCH: Correcciones de bugs

- Siempre prueba la actualización en una máquina con la versión anterior
- Mantén backups de tu clave privada en un lugar seguro
- No borres releases antiguos inmediatamente (espera al menos una semana)

## 🔐 Seguridad

- ✅ Clave privada guardada en: `~/.tauri/aikz-gestion.key`
- ✅ Clave privada en GitHub Secrets: `TAURI_SIGNING_PRIVATE_KEY`
- ❌ NUNCA subir la clave privada al repositorio
- ❌ NUNCA compartir la clave privada

---

**Tiempo estimado por release**: 15-20 minutos (después del build)
