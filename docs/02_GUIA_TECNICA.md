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
  services/ SheetsService.gs · PadronService.gs · LogService.gs · FormatoService.gs · NotificacionService.gs · ActivosService.gs
  modules/reporte/  ReporteService.gs · ReporteDataService.gs · ReporteMapper.gs · ReporteValidator.gs
                    ReporteView.html · ReporteClient.html · ReporteStyles.html
  ui/       GlobalStyles.html · GlobalClient.html · PortalView.html · PortalClient.html · PortalStyles.html
  templates/pdf/ FTic12PdfTemplate.html
  setup/    Setup.gs
```

Nota de `clasp`: se usa `rootDir: ""`, por eso los includes apuntan a rutas completas tipo `src/ui/GlobalStyles`.

## CONFIG (`src/config/Config.gs`)
- `SPREADSHEETS.MAIN` = `1oruTWcOGtNptt9AmlSZDgaOROFdG8fhrQxk13SuA554`.
- `SPREADSHEETS.PADRON_PERSONAL` = `123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc`.
- `DRIVE.FOLDER_RG_F_TIC_12` es la carpeta destino del PDF F-TIC-12.
- `FORMATOS.F_TIC_12_TEMPLATE_HTML` apunta a `src/templates/pdf/FTic12PdfTemplate`.
- `PADRON.SHEETS_EMPRESAS` = `{ TDEM: 'TDEMSRL', GOYDEL: 'GOYDELSAC' }`.
- `PADRON.EMPRESAS_CECO_ALIASES` define equivalencias para cruzar la empresa del formulario con `RAZON SOCIAL` del catalogo `CECO`.
- `PADRON.SHEET_CECO` = `CECO`.
- `HEADERS.REGISTROS` contiene las columnas reales de `MC-F-TIC-12`.
- `VALIDATION.DNI_LENGTH = 8` y `VALIDATION.MOVIL_LENGTH = 9`.
- `SEGURIDAD.ANYDESK_CIPHER_PROPERTY` define la Script Property del secreto de cifrado.

## Google Sheets

### `MC-F-TIC-12`
| Pestana | Contenido |
|---|---|
| `MC-F-TIC-12` | Matriz principal de tickets |
| `LOG_EVENTOS` | Log funcional |
| `LOG_ERRORES` | Log tecnico |
| `DICC-F-TIC-12` | Diccionario de campos y reglas |
| `TAGS-F-TIC-12` | Mapeo historico del formato/documentacion |

En tickets nuevos creados por el solicitante nacen vacios los campos de gestion TIC (`SLA_APLICADO`, `DIAGNOSTICO_TIC`, `ACCION_TOMADA`, `ESTADO_FINAL`, `TECNICO_RESPONSABLE`, `FECHA_HORA_CIERRE`, `LINK_PDF_REPORTE`, `HASH_SHA256_PDF`, etc.); se completan durante la atencion administrativa y el PDF se genera al cierre.

### `[DB] PERSONAL GRUPO ECONOMICO`
| Pestana | Encabezados |
|---|---|
| `TDEMSRL` / `GOYDELSAC` | `DNI`, `APELLIDOS Y NOMBRES`, `CARGO`, `PROYECTO` |
| `CECO` | `RAZON SOCIAL`, `CECO`, `CENTRO DE COSTO`, `PROYECTO`, `ESTADO` |

Regla: estas hojas solo se leen desde `PadronService`; nunca se escriben ni se duplican localmente. La pestana `CECO` tiene filas de titulo previas; el servicio lee los datos reales desde la fila 4.

## Servicios GAS
- **SheetsService** - `open_`, `getSheet_`, `getHeaderMap_`, `readObjects_`, `appendObject_`, `findRowByValue_`, `validateHeaders_`.
- **PadronService** - `buscarPorDni(dni)` y `listarCecoActivos(empresa)`.
- **LogService** - `evento_`, `error_`. No debe interrumpir el flujo principal.
- **FormatoService** - construye el view-model del ticket, evalua `templates/pdf/FTic12PdfTemplate.html` con HtmlService y convierte el resultado a PDF (`HtmlOutput.getAs(MimeType.PDF)`), guardandolo en Drive y registrando `LINK_PDF_REPORTE` + `HASH_SHA256_PDF`.
- **ReporteMapper / ReporteValidator / ReporteDataService / ReporteService** - sanitizan, validan, exigen `MOVIL_SOLICITANTE` de 9 digitos, generan `ID_REGISTRO` correlativo anual bajo `LockService`, insertan la fila en la matriz real, exponen seguimiento publico por `ID_REGISTRO + DNI` y disparan la generacion documental al cierre.

## HtmlService
`doGet(e)` renderiza `Index.html`, que ensambla `GlobalStyles`, `PortalStyles`, `ReporteStyles`, `PortalView`, `GlobalClient`, `PortalClient` y `ReporteClient` via `include()`.

La plantilla del PDF ya no depende de un spreadsheet externo: el formato se arma con `FTic12PdfTemplate.html`, sin grilla de Google Sheets ni recursos `resources/...`.

## Funciones publicas (`google.script.run`)
- `ReporteService_obtenerCatalogos()`
- `PadronService_buscarPorDni(dni)`
- `PadronService_listarCecoActivos(empresa)`
- `ReporteService_crearReporte(payload)`
- `ReporteService_obtenerSeguimientoPublico(payload)`
- `configurarProyecto()`
- `validarEstructuraProyecto()`

## Scopes
- `https://www.googleapis.com/auth/spreadsheets` - lectura/escritura operativa.
- `https://www.googleapis.com/auth/drive` - generacion y guardado del PDF F-TIC-12.
- `https://www.googleapis.com/auth/script.send_mail` - envio del correo resumen al cierre.
- Publicacion: `executeAs: USER_DEPLOYING`, `access: ANYONE`.

## Triggers
Ninguno.

## Flujo con `clasp`
1. `clasp status`
2. `clasp push --force` solo con confirmacion explicita
3. `clasp version` y luego `clasp deploy` / `clasp redeploy` solo con confirmacion explicita
4. Reautorizar si cambian scopes

## Validaciones
- `validarEstructuraProyecto()` revisa headers de `MC-F-TIC-12`, existencia de `LOG_EVENTOS` / `LOG_ERRORES`, existencia de `TDEMSRL`, `GOYDELSAC`, `CECO`, la Script Property del cifrado, acceso a la carpeta Drive destino y evaluacion correcta de la plantilla HTML del PDF.
- `ReporteValidator_validar_` revisa DNI de 8 digitos, movil de 9 digitos, campos obligatorios y enums definidos.
- `ReporteService_obtenerSeguimientoPublico(payload)` valida `ID_REGISTRO + DNI` antes de exponer datos controlados del ticket.

## Riesgos tecnicos
- `ANYDESK_PASSWORD` usa cifrado reversible simple (XOR + Base64) con secreto en Script Properties; es un control minimo, no criptografia fuerte.
- El padron no tiene pestana `METRIN`; si el solicitante no aparece en `TDEMSRL` ni `GOYDELSAC`, completa sus datos manualmente.
- `MC-F-TIC-12` es la hoja real de produccion; toda escritura debe seguir protegida por `LockService`.
