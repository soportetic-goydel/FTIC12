# Guia Tecnica - F-TIC-12 Reporte de Incidencias y Fallas Tecnicas

## Arquitectura
Google Apps Script (V8) + HtmlService, desplegado con `clasp`. Frontend por `include()` y `google.script.run`; backend modular por servicios. `CONFIG` es la unica fuente de verdad. Las funciones internas terminan en `_`; las publicas devuelven `{ ok, result, message }`.

## Estructura local
```text
Index.html                         # template liviano (ensambla por includes)
appsscript.json                    # webapp + scopes
.claspignore                       # excluye docs/, docs_base/, node_modules, *.md, etc.
src/
  config/   Config.gs · Constants.gs
  core/     WebApp.gs · HtmlIncludes.gs · ResponseService.gs · Utils.gs
  services/ SheetsService.gs · PadronService.gs · LogService.gs
  modules/reporte/  ReporteService.gs · ReporteDataService.gs · ReporteMapper.gs · ReporteValidator.gs
                    ReporteView.html · ReporteClient.html · ReporteStyles.html
  ui/       GlobalStyles.html · GlobalClient.html · PortalView.html · PortalClient.html · PortalStyles.html
  setup/    Setup.gs
```

Nota de `clasp`: se usa `rootDir: ""`, por eso los includes apuntan a rutas completas tipo `src/ui/GlobalStyles`.

## CONFIG (`src/config/Config.gs`)
- `SPREADSHEETS.MAIN` = `1oruTWcOGtNptt9AmlSZDgaOROFdG8fhrQxk13SuA554`.
- `SPREADSHEETS.PADRON_PERSONAL` = `123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc`.
- `DRIVE.FOLDER_REGISTROS_UNITARIZADOS` / `DRIVE.FOLDER_RG_F_TIC_12` quedan reservados para la futura fase de PDF.
- `PADRON.SHEETS_EMPRESAS` = `{ TDEM: 'TDEMSRL', GOYDEL: 'GOYDELSAC' }`.
- `PADRON.EMPRESAS_CECO_ALIASES` define equivalencias para cruzar la empresa del formulario con `RAZON SOCIAL` del catalogo `CECO` (por ejemplo `GOYDEL`, `GOYDEL SAC`, `GOYDELSAC`).
- `PADRON.SHEET_CECO` = `CECO`.
- `HEADERS.REGISTROS` contiene las 38 columnas exactas de `MC-F-TIC-12`.
- `VALIDATION.DNI_LENGTH = 8` y `VALIDATION.MOVIL_LENGTH = 9`.
- `TRACKING.POLLING_MS = 15000` y `TRACKING.TERMINAL_STATUSES = ['Resuelto', 'Cerrado', 'Anulado']`.
- `SEGURIDAD.ANYDESK_CIPHER_PROPERTY` define la Script Property del secreto de cifrado.

## Google Sheets

### `MC-F-TIC-12` (spreadsheet de control, 5 pestañas reales)
| Pestana | Contenido |
|---|---|
| `MC-F-TIC-12` | Matriz principal de 38 columnas |
| `LOG_EVENTOS` | Log funcional del formulario |
| `LOG_ERRORES` | Log tecnico del formulario |
| `DICC-F-TIC-12` | Diccionario de campos y reglas |
| `TAGS-F-TIC-12` | Mapeo de tags para la futura generacion de PDF |

Campos que Fase 1 deja vacios: `SLA_APLICADO`, `DIAGNOSTICO_TIC`, `ACCION_TOMADA`, `ESTADO_FINAL`, `TECNICO_RESPONSABLE`, `FECHA_HORA_CIERRE`, `MTTR_HORAS`, `CUMPLIO_SLA`, `APORTA_I_O_27`, `APORTA_I_O_45`, `LINK_PDF_REPORTE`, `HASH_SHA256_PDF`, `LINK_BITACORA_F_TIC_10`, `LINK_INVENTARIO_F_TIC_05`, `URL_EVIDENCIA_ADICIONAL`, `DIAS_DESDE_REPORTE`, `FLAG_DENTRO_SLA`.

### `[DB] PERSONAL GRUPO ECONOMICO` (padron unico, solo lectura)
| Pestana | Encabezados |
|---|---|
| `TDEMSRL` / `GOYDELSAC` | `DNI`, `APELLIDOS Y NOMBRES`, `CARGO`, `PROYECTO` |
| `CECO` | `RAZON SOCIAL`, `CECO`, `CENTRO DE COSTO`, `PROYECTO`, `ESTADO` |

Regla: estas hojas solo se leen desde `PadronService`; nunca se escriben ni se duplican localmente.
Nota: la pestaña `CECO` tiene dos filas de título antes del encabezado real; `PadronService_readCecoObjects_` lee los datos reales desde la fila 4, columnas A:E (`RAZON SOCIAL`, `CECO`, `CENTRO DE COSTO`, `PROYECTO`, `ESTADO`).

## Servicios GAS
- **SheetsService** - `open_`, `getSheet_`, `getHeaderMap_`, `readObjects_`, `appendObject_`, `findRowByValue_`, `validateHeaders_`. Lectura por nombre de encabezado.
- **PadronService** - `buscarPorDni(dni)` y `listarCecoActivos(empresa)`, con lectura especifica de la estructura real de `CECO` y comparacion normalizada entre empresa y `RAZON SOCIAL` para tolerar variantes como `TDEM`/`TDEMSRL` y `GOYDEL`/`GOYDEL SAC`.
- **LogService** - `evento_`, `error_`. No debe interrumpir el flujo principal.
- **ReporteMapper / ReporteValidator / ReporteDataService / ReporteService** - sanitizan, validan, exigen `MOVIL_SOLICITANTE` de 9 digitos, generan `ID_REGISTRO` correlativo anual bajo `LockService`, insertan la fila en la matriz real y exponen seguimiento publico por `ID_REGISTRO + DNI`.

## HtmlService
`doGet(e)` renderiza `Index.html`, que ensambla `GlobalStyles`, `PortalStyles`, `ReporteStyles`, `PortalView`, `GlobalClient`, `PortalClient` y `ReporteClient` via `include()`. La app sigue siendo de una sola pagina, pero ahora con vistas de inicio, registro, exito, consulta publica y acceso administrativo guiado.

## Funciones publicas (`google.script.run`)
- `ReporteService_obtenerCatalogos()`
- `PadronService_buscarPorDni(dni)`
- `PadronService_listarCecoActivos(empresa)`
- `ReporteService_crearReporte(payload)`
- `ReporteService_obtenerSeguimientoPublico(payload)`
- `configurarProyecto()`
- `validarEstructuraProyecto()`

## Scopes
- `https://www.googleapis.com/auth/spreadsheets` - unico scope necesario en Fase 1.
- Publicacion: `executeAs: USER_DEPLOYING`, `access: ANYONE`.
- Aun no se pide scope de Drive ni correo; se agregaran cuando se implemente PDF + Drive.

## Triggers
Ninguno en Fase 1.1.

## Flujo con `clasp`
1. `clasp status`
2. `clasp push --force` solo con confirmacion explicita
3. `clasp version` y luego `clasp deploy` / `clasp redeploy` solo con confirmacion explicita
4. Reautorizar si cambian scopes

## Validaciones
- `validarEstructuraProyecto()` revisa headers de `MC-F-TIC-12`, existencia de `LOG_EVENTOS` / `LOG_ERRORES`, existencia de `TDEMSRL`, `GOYDELSAC`, `CECO`, y la Script Property del cifrado.
- `ReporteValidator_validar_` revisa DNI de 8 digitos, movil de 9 digitos, campos obligatorios y enums definidos.
- `ReporteService_obtenerSeguimientoPublico(payload)` valida `ID_REGISTRO + DNI` antes de exponer datos controlados del ticket.

## Riesgos tecnicos
- `ANYDESK_PASSWORD` usa cifrado reversible simple (XOR + Base64) con secreto en Script Properties; es un control minimo, no criptografia fuerte.
- El padron no tiene pestaña `METRIN`; si el solicitante no aparece en `TDEMSRL` ni `GOYDELSAC`, completa sus datos manualmente.
- `MC-F-TIC-12` es la hoja real de produccion; toda escritura debe seguir protegida por `LockService`.
