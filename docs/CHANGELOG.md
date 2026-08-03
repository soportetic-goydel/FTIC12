# Changelog

## 2026-07-31
### Corregido
- Ajustada la carga de centros de costo (`CECO`) para comparar la empresa seleccionada con `RAZON SOCIAL` usando aliases normalizados, evitando el descalce entre valores como `TDEM`/`TDEMSRL` y `GOYDEL`/`GOYDEL SAC`/`GOYDELSAC`.
- Mejorado `ReporteClient.html` para mostrar un mensaje claro cuando la empresa seleccionada no devuelve centros de costo activos, en lugar de dejar el selector vacio sin contexto.
- Endurecida la normalizacion del DNI y de campos numericos en frontend y backend para tolerar mejor pegados con espacios/guiones, teclados moviles y variantes numericas no ASCII, evitando falsos errores de longitud.
- Ajustado el flujo del campo `DNI` para navegadores moviles: inputs `tel`, sincronizacion previa al buscar/enviar y busqueda programada en `blur`/`change`/`compositionend`, evitando que el ultimo digito quede sin asentarse al tocar `Buscar`.
- Corregida la validacion de longitud en cliente para `DNI` y `MOVIL`: los valores de `CONFIG.VALIDATION` ahora se fuerzan a numero en HtmlService, evitando falsos negativos por comparaciones estrictas entre `8` y `'8'`.
- Publicada una nueva implementacion Web App (`@12`) para evitar que la URL anterior siguiera sirviendo una version antigua del cliente con diagnostico `DNI-DIAG-20260731-v9`.
- Corregida la lectura del catalogo `CECO`: la hoja tiene filas de titulo antes de los encabezados reales, por lo que ahora el servicio detecta dinamicamente la fila con `RAZON SOCIAL`, `CECO`, `CENTRO DE COSTO`, `PROYECTO` y `ESTADO` antes de filtrar centros activos.
- Reforzada la lectura de `CECO` usando la estructura real fija de la hoja (datos desde fila 4, columnas A:E) y protegido el selector del formulario para que no quede en `Cargando...` cuando una consulta falla o llega fuera de orden.
- Corregido el guardado de reportes: el encabezado `PERIODO_AÑO` estaba mal codificado en el codigo y no coincidia con la hoja real `MC-F-TIC-12`.
- Blindado el cifrado opcional de `ANYDESK_PASSWORD`: si falta la Script Property de cifrado, el reporte ya no se bloquea; se omite ese campo y se registra el error tecnico.

### Mejorado
- La consulta del DNI contra el padron ahora se dispara automaticamente al completar los 8 digitos, con debounce corto y reutilizando la misma logica del boton `Buscar` para mantener el respaldo manual.

## 2026-07-30
### Mejorado
- UI/UX del portal más dinámica e interactiva (sin cambios de backend/estructura de datos): transiciones animadas entre vistas, hero con fondo animado sutil, tarjetas de inicio con íconos SVG y entrada escalonada, timeline visual de 3 pasos (Registrado / En atención / Resuelto) en el seguimiento de ticket, botón de copiar número de ticket (con confirmación por toast), barra de progreso en vivo en el formulario de reporte, destello visual en campos autocompletados desde el padrón, búsqueda de DNI con spinner inline en vez de overlay de pantalla completa, toasts con variantes e íconos (error/ok/info), y accesibilidad reforzada (`:focus-visible`, `aria-live`, `aria-label`, `prefers-reduced-motion`).
- Archivos tocados: `src/ui/GlobalStyles.html`, `src/ui/GlobalClient.html`, `src/ui/PortalView.html`, `src/ui/PortalStyles.html`, `src/ui/PortalClient.html`, `src/modules/reporte/ReporteView.html`, `src/modules/reporte/ReporteStyles.html`, `src/modules/reporte/ReporteClient.html`.
- Documentado en `docs/04_GUIA_DISENO_UI.md` (nueva sección "Interacción y motion").

### Desplegado
- `clasp push --force` (24 archivos) + `clasp deploy -i AKfycbxP7EFuOq4gv5GD9nfDkmF17C_lUWBq4N5dh16hN6-mdx5Ab8h0P_QWlgvL7opza1x2` → implementación existente actualizada a la **versión 2** ("UI dinamica portal - hero animado, timeline de estado, progreso de formulario"). Se reutilizó el mismo `deploymentId` (misma URL de Web App) en vez de crear una implementación nueva.
- Nota: al revisar el estado real del proyecto se encontró que la implementación **@1 (versión 1) ya existía y estaba publicada como Web App desde antes**, contradiciendo lo indicado en `RESUMEN_SESION.md` ("clasp deploy aún no se ha hecho, no hay URL pública funcionando"). Ese archivo quedó desactualizado en ese punto — no se corrigió porque es un volcado histórico de sesión (fecha de corte 2026-07-17), no un documento vivo.
- **Pendiente detectado (no resuelto en esta sesión):** no se pudo confirmar si la Script Property `ANYDESK_CIPHER_SECRET` está configurada ni si `configurarProyecto()` ya se ejecutó — ambos son anteriores a este cambio de UI, pero siguen bloqueando el guardado de reportes con AnyDesk y el log de eventos/errores respectivamente. Verificar en el editor de Apps Script.

## 2026-07-24
### Corregido
- Alineado el formulario de intake y la persistencia con la matriz real `MC-F-TIC-12`: el campo obligatorio del solicitante es `MOVIL_SOLICITANTE`, no `AREA_SOLICITANTE`.
- Ajustados `Config.gs`, `ReporteMapper.gs`, `ReporteValidator.gs`, `ReporteDataService.gs`, `ReporteView.html` y `ReporteClient.html` para respetar el formato `F-TIC-12`, `DICC-F-TIC-12` y la hoja real.
- Incorporadas validaciones centralizadas en `CONFIG.VALIDATION` para DNI de 8 digitos y movil de 9 digitos.

### Agregado
- Nueva carcasa de portal en HtmlService con inicio, registro, consulta publica y acceso administrativo guiado.
- `ReporteService_obtenerSeguimientoPublico(payload)` para seguimiento por `ID_REGISTRO + DNI`.
- `PortalView.html`, `PortalClient.html` y `PortalStyles.html` como capa visual del portal.
- Polling controlado para refrescar el estado del ticket mientras no este en estado terminal.

### Documentado
- Actualizadas `01_GUIA_GENERAL.md`, `02_GUIA_TECNICA.md` y `03_GUIA_OPERATIVA_Y_GOBIERNO.md` para reflejar la estructura real de `MC-F-TIC-12` y el intake corregido.

## 2026-07-17
### Agregado (Fase 1 - greenfield)
- Arquitectura modular completa: `src/config`, `src/core`, `src/services`, `src/modules/reporte`, `src/ui`, `src/setup`.
- `CONFIG` como unica fuente de verdad con IDs reales de `MC-F-TIC-12` y del padron unico.
- Modulo **reporte** de Fase 1 con busqueda de personal por DNI, selector de CECO, validacion server-side completa, generacion de `ID_REGISTRO` correlativo e insercion en `MC-F-TIC-12` con `ESTADO_REGISTRO=Abierto`.
- `PadronService`, `SheetsService`, `LogService`, cifrado reversible simple para `ANYDESK_PASSWORD` y UI HtmlService por `include()`.
- `configurarProyecto()` / `validarEstructuraProyecto()` como setup tecnico idempotente.

### Configurado
- `appsscript.json`: `webapp` (`executeAs USER_DEPLOYING`, `access ANYONE`) + scope unico `spreadsheets`.
- `.claspignore`: excluye `docs/`, `docs_base/`, `node_modules`, `*.md`, etc.

### Despliegue
- `.clasp.json` creado con el `scriptId` provisto por el usuario.
- Primer `clasp push --force` realizado con confirmacion explicita.
- `clasp deploy` aun pendiente de confirmacion explicita.

### Riesgos / Pendientes
- Configurar la Script Property `ANYDESK_CIPHER_SECRET`.
- Ejecutar `configurarProyecto()` en la hoja real y revisar `validarEstructuraProyecto()`.
- Fase 2 pendiente: vista tecnica, PDF, Drive y nomenclatura final de subcarpetas NIVEL III.
