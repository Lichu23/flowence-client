# 📷 Guía de Logs del Scanner

## 🎯 Logs Implementados

He agregado logs detallados en todo el flujo del scanner para facilitar el debugging. Los logs usan emojis para fácil identificación visual.

## 🔍 Componentes con Logs

### 1. **BarcodeScanner.tsx** (Core del Scanner)

#### Inicialización
```
⏳ [Scanner] Waiting 100ms for DOM to be ready...
🚀 [Scanner] DOM ready, initializing scanner
🔧 [Scanner] Initializing scanner...
   { facingMode: 'environment', width: 400, height: 300 }
✅ [Scanner] Scanner initialized successfully
▶️ [Scanner] Scanner started
👂 [Scanner] Detection handler registered
```

#### Detección de Código de Barras
```
📷 [Scanner] Barcode detected:
   { code: '7501234567890', format: 'ean_13', confidence: 0.02, length: 13 }
✅ [Scanner] Valid barcode accepted: 7501234567890
⏸️ [Scanner] Scanner paused for processing
📤 [Scanner] Sending code to parent handler: 7501234567890
🔓 [Scanner] Cooldown period ended, ready for next scan
▶️ [Scanner] Scanner resumed
```

#### Detecciones Duplicadas/Inválidas
```
⚠️ [Scanner] Invalid code detected - too short: 123
🔄 [Scanner] Duplicate detection ignored: 7501234567890
```

#### Control de Estado
```
▶️ [Scanner] Activating scanner
✅ [Scanner] Scanner started successfully
⏸️ [Scanner] Deactivating scanner
✅ [Scanner] Scanner paused successfully
```

#### Cleanup
```
🧹 [Scanner] Cleanup triggered
⏹️ [Scanner] Detection timeout cleared
⏹️ [Scanner] Scanner stopped and cleaned up
```

#### Errores
```
❌ [Scanner] QuaggaJS initialization error: NotAllowedError
❌ [Scanner] Error message: Camera access denied. Please allow camera permissions.
❌ [Scanner] Error pausing scanner: [error details]
```

---

### 2. **ScannerModal.tsx** (Modal Container)

#### Apertura/Cierre
```
📱 [ScannerModal] Modal opened
📱 [ScannerModal] Modal closed
```

#### Flujo de Datos
```
📥 [ScannerModal] Barcode received from scanner: 7501234567890
🔍 [ScannerModal] Searching product in store: abc-123-store-id
✅ [ScannerModal] Product found, notifying parent: { id: '...', name: 'Coca Cola' }
```

#### Entrada Manual
```
⌨️ [ScannerModal] Manual entry submitted: 7501234567890
🔍 [ScannerModal] Searching product in store: abc-123-store-id
```

#### Manejo de Errores
```
❌ [ScannerModal] Scanner error received: Camera access denied
⏰ [ScannerModal] Switching to manual mode in 1 second...
🔄 [ScannerModal] Switched to manual mode
```

#### Toggle de Modo
```
🔄 [ScannerModal] Mode toggle: scanner → manual
🔄 [ScannerModal] Retrying scanner...
```

---

### 3. **useBarcodeSearch.ts** (Hook de Búsqueda)

#### Inicio de Búsqueda
```
🔍 [useBarcodeSearch] Starting search: { storeId: 'abc-123', barcode: '7501234567890' }
✅ [useBarcodeSearch] Barcode format valid, making API request...
📡 [useBarcodeSearch] API URL: /api/stores/abc-123/products/search/barcode/7501234567890
```

#### Respuesta Exitosa
```
📨 [useBarcodeSearch] API Response: { success: true, data: { product: {...} } }
✅ [useBarcodeSearch] Product found:
   { id: 'prod-123', name: 'Coca Cola', barcode: '7501234567890', price: 15 }
🏁 [useBarcodeSearch] Search completed
```

#### Errores de Validación
```
⚠️ [useBarcodeSearch] Missing required parameters: { storeId: '', barcode: '123' }
⚠️ [useBarcodeSearch] Invalid barcode format: 123
```

#### Errores de API
```
❌ [useBarcodeSearch] Search error:
   { error: Error, message: 'No product found', barcode: '7501234567890', storeId: 'abc-123' }
🏁 [useBarcodeSearch] Search completed
```

#### Limpieza
```
🧹 [useBarcodeSearch] Clearing search results
```

---

## 🎨 Leyenda de Emojis

| Emoji | Significado |
|-------|-------------|
| 📷 | Detección de barcode |
| ✅ | Operación exitosa |
| ❌ | Error |
| ⚠️ | Advertencia |
| 🔍 | Búsqueda |
| 📱 | Modal |
| 📡 | Petición API |
| 📨 | Respuesta API |
| 📥 | Entrada de datos |
| 📤 | Salida de datos |
| ⌨️ | Entrada manual |
| 🔧 | Configuración/Inicialización |
| 🚀 | Inicio |
| ▶️ | Activación/Start |
| ⏸️ | Pausa |
| ⏹️ | Stop |
| 🔄 | Cambio de estado |
| 🔓 | Desbloqueo/Ready |
| 🧹 | Cleanup |
| ⏳ | Espera/Delay |
| 👂 | Listener registrado |
| 🏁 | Finalización |

---

## 🔍 Cómo Usar los Logs para Debugging

### Escenario 1: Scanner No Detecta Códigos

**Verifica en la consola:**
1. ¿Se inicializó correctamente?
   ```
   ✅ [Scanner] Scanner initialized successfully
   ```

2. ¿Está activo?
   ```
   ▶️ [Scanner] Scanner started
   ```

3. ¿Hay detecciones pero se rechazan?
   ```
   📷 [Scanner] Barcode detected: { code: '123', ... }
   ⚠️ [Scanner] Invalid code detected - too short: 123
   ```

### Escenario 2: Producto No Se Encuentra

**Sigue el flujo:**
```
📷 [Scanner] Barcode detected: { code: '7501234567890' }
✅ [Scanner] Valid barcode accepted
📤 [Scanner] Sending code to parent handler
📥 [ScannerModal] Barcode received from scanner
🔍 [useBarcodeSearch] Starting search
📡 [useBarcodeSearch] API URL: /api/...
📨 [useBarcodeSearch] API Response: { success: false }
❌ [useBarcodeSearch] Search error: No product found
```

### Escenario 3: Permisos de Cámara Denegados

**Busca:**
```
❌ [Scanner] QuaggaJS initialization error: NotAllowedError
❌ [Scanner] Error message: Camera access denied
❌ [ScannerModal] Scanner error received
⏰ [ScannerModal] Switching to manual mode in 1 second...
```

### Escenario 4: Detecciones Múltiples del Mismo Código

**Normal (sistema funcionando correctamente):**
```
📷 [Scanner] Barcode detected: 7501234567890
✅ [Scanner] Valid barcode accepted
📷 [Scanner] Barcode detected: 7501234567890
🔄 [Scanner] Duplicate detection ignored
```

### Escenario 5: Scanner No Se Limpia Correctamente

**Al cerrar el modal, deberías ver:**
```
📱 [ScannerModal] Modal closed
🧹 [Scanner] Cleanup triggered
⏹️ [Scanner] Detection timeout cleared
⏹️ [Scanner] Scanner stopped and cleaned up
```

---

## 📊 Flujo Completo Exitoso

Cuando todo funciona correctamente, verás este flujo:

```
1. Abrir Modal
   📱 [ScannerModal] Modal opened

2. Inicializar Scanner
   ⏳ [Scanner] Waiting 100ms for DOM to be ready...
   🚀 [Scanner] DOM ready, initializing scanner
   🔧 [Scanner] Initializing scanner...
   ✅ [Scanner] Scanner initialized successfully
   ▶️ [Scanner] Scanner started
   👂 [Scanner] Detection handler registered

3. Detectar Código
   📷 [Scanner] Barcode detected: { code: '7501234567890', ... }
   ✅ [Scanner] Valid barcode accepted: 7501234567890
   ⏸️ [Scanner] Scanner paused for processing
   📤 [Scanner] Sending code to parent handler: 7501234567890

4. Buscar Producto
   📥 [ScannerModal] Barcode received from scanner: 7501234567890
   🔍 [ScannerModal] Searching product in store: abc-123
   🔍 [useBarcodeSearch] Starting search
   ✅ [useBarcodeSearch] Barcode format valid
   📡 [useBarcodeSearch] API URL: /api/...
   📨 [useBarcodeSearch] API Response: { success: true, ... }
   ✅ [useBarcodeSearch] Product found: { name: 'Coca Cola', ... }
   🏁 [useBarcodeSearch] Search completed

5. Notificar y Cerrar
   ✅ [ScannerModal] Product found, notifying parent
   📱 [ScannerModal] Modal closed

6. Cleanup
   🧹 [Scanner] Cleanup triggered
   ⏹️ [Scanner] Scanner stopped and cleaned up
```

---

## 🛠️ Tips de Debugging

1. **Filtra por componente** en la consola del navegador:
   - `[Scanner]` - Componente principal del scanner
   - `[ScannerModal]` - Modal contenedor
   - `[useBarcodeSearch]` - Hook de búsqueda

2. **Busca errores primero**: Filtra por `❌` o `⚠️`

3. **Verifica el flujo completo**: Sigue los números del flujo exitoso arriba

4. **Monitorea el estado**: Los logs de activación/pausa te dicen si el scanner está activo

5. **Revisa timings**: Los logs con ⏳ muestran delays intencionales

---

## 📝 Notas

- Los logs solo aparecen en **development mode**
- Para producción, considera usar un logger configurable que puedas desactivar
- Los logs incluyen **datos completos** de objetos para debugging profundo
- El **cooldown period** de 2 segundos previene detecciones duplicadas

---

**Fecha de Implementación**: 15 de Octubre, 2025  
**Última Actualización**: 15 de Octubre, 2025

