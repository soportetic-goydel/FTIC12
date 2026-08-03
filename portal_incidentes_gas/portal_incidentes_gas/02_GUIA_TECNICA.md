# Guia Tecnica

## Arquitectura

El sistema se construye como una Web App de Google Apps Script con HtmlService.

Componentes:

- Frontend: HTML, CSS y JavaScript modular ensamblado con `include()`.
- Backend: servicios `.gs` organizados por dominio.
- Persistencia: Google Sheets como base de datos liviana.
- Archivos: Google Drive para adjuntos por incidente.
- Correos: MailApp o GmailApp con plantillas HTML.
- Seguridad: validacion backend, roles en hoja `Users` y logs.
- Sincronia de seguimiento: polling con `google.script.run`.

## Restriccion de tiempo real

Apps Script no debe tratarse como servidor WebSocket. No mantiene conexiones persistentes de backend para WebSockets.

Decision para la primera version:

- Usar polling controlado desde el cliente cada 15 segundos.
- Detener polling cuando el estado sea `Resuelto`, `Cerrado` o `Cancelado`.
- Evitar intervalos agresivos para proteger cuotas.

Alternativas si se requiere tiempo real real:

- Firebase Realtime Database.
- Firestore con listener desde frontend.
- Cloud Run con WebSockets o Server-Sent Events.
- Apps Script como integrador de Sheets, Drive y correo, no como canal persistente.

## Estructura local recomendada

```text
src/
  config/
    Config.gs
    Constants.gs
  core/
    WebApp.gs
    HtmlIncludes.gs
    ResponseService.gs
    Utils.gs
  services/
    SheetsService.gs
    ReportsService.gs
    HistoryService.gs
    CommentsService.gs
    AttachmentsService.gs
    UsersService.gs
    AuthService.gs
    EmailService.gs
    LogService.gs
    DashboardService.gs
  ui/
    GlobalStyles.html
    GlobalClient.html
    Layout.html
    HomeView.html
    ReportFormView.html
    TrackingView.html
    AdminView.html
    DashboardView.html
  templates/
    email/
      EmailLayout.html
      EmailStyles.html
      ReportCreatedEmail.html
      StatusChangedEmail.html
      InfoRequestedEmail.html
      ReportResolvedEmail.html
Index.html
appsscript.json
.claspignore
docs/
```

## CONFIG

`CONFIG` debe concentrar:

- Nombre de aplicacion.
- Zona horaria.
- ID de Spreadsheet principal.
- ID de carpeta Drive raiz.
- Nombres de hojas.
- Encabezados esperados.
- Estados permitidos.
- Prioridades.
- Categorias si no se leen desde catalogo.
- Parametros de correo.
- Configuracion de UI.
- Parametros de polling.
- Reglas de SLA.
- Auth y roles.

No deben existir IDs, nombres de hojas, correos de sistema, colores o reglas criticas hardcodeadas fuera de `CONFIG`.

## Google Sheets

Hojas principales:

- `Reports`.
- `StatusHistory`.
- `Comments`.
- `Attachments`.
- `Users`.
- `Catalogs`.
- `SlaRules`.
- `LogEventos`.
- `LogErrores`.
- `LogCorreos`.
- `AuditLog`.

Reglas:

- Leer y escribir por encabezado.
- Validar estructura al iniciar con `setupDatabase()`.
- Usar `LockService` para crear folios y evitar duplicados.
- No borrar registros criticos; usar campos `active`, `closedAt` o estado.
- Registrar cambios relevantes en `AuditLog`.

## Servicios GAS

### WebApp.gs

Responsable de:

- `doGet(e)`.
- Seleccion de vista inicial.
- Carga de template principal.
- Configuracion de titulo, favicon y parametros publicos.

### ReportsService.gs

Responsable de:

- Crear incidentes.
- Generar folios.
- Validar payload.
- Consultar detalle publico.
- Consultar detalle administrativo.
- Listar con filtros.
- Actualizar prioridad, estado y responsable.

### HistoryService.gs

Responsable de:

- Registrar cada cambio de estado.
- Exponer historial publico.
- Exponer historial interno.

### CommentsService.gs

Responsable de:

- Crear comentarios publicos e internos.
- Listar comentarios por folio.
- Validar permisos de visibilidad.

### AttachmentsService.gs

Responsable de:

- Crear carpeta por folio.
- Guardar adjuntos en Drive.
- Registrar metadata de archivos.
- Devolver URLs segun permisos.

### UsersService.gs

Responsable de:

- Obtener usuario actual.
- Consultar rol.
- Validar permisos.
- Listar gestores activos.

### AuthService.gs

Responsable de:

- Encapsular reglas de acceso.
- Permitir Auth desactivado en version inicial.
- Preparar validacion por sesion si el proyecto escala.

### EmailService.gs

Responsable de:

- Enviar confirmaciones.
- Enviar cambios de estado visibles.
- Registrar envios y errores.
- Renderizar plantillas HTML separadas.

### DashboardService.gs

Responsable de:

- Calcular metricas.
- Agrupar por estado, prioridad, categoria, responsable y vencimiento.

### LogService.gs

Responsable de:

- Registrar eventos.
- Registrar errores.
- Registrar correos.
- Registrar cambios criticos.

## HtmlService

Reglas:

- `Index.html` debe ser liviano.
- Usar `include()` para ensamblar vistas y estilos.
- Usar `google.script.run` para llamadas al backend.
- Cada llamada debe tener success handler y failure handler.
- No usar `fetch('/api/...')`.
- No exponer datasets completos si no son necesarios.

## Funciones publicas

Funciones esperadas para frontend:

- `createReport(payload)`.
- `getReportPublicStatus(folio, email)`.
- `listReports(filters)`.
- `getReportAdminDetail(folio)`.
- `updateReportStatus(payload)`.
- `assignReport(folio, assignedTo)`.
- `addComment(payload)`.
- `getDashboardMetrics(filters)`.
- `getCatalogs()`.
- `getCurrentUser()`.

Todas deben devolver un objeto controlado:

```javascript
{ ok: true, result: {}, message: 'Operacion completada' }
```

o

```javascript
{ ok: false, result: null, message: 'Mensaje seguro para usuario' }
```

## Funciones internas

Las funciones internas deben terminar con guion bajo `_`.

Ejemplos:

- `validateReportPayload_(payload)`.
- `generateFolio_()`.
- `mapReportRow_(row)`.
- `assertAdmin_(email)`.
- `buildTrackingUrl_(folio)`.

## Scopes

Scopes probables:

```json
[
  "https://www.googleapis.com/auth/script.external_request",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/script.send_mail",
  "https://www.googleapis.com/auth/userinfo.email"
]
```

Ajustar segun implementacion real.

## Triggers

Triggers opcionales:

- Revision diaria de incidentes vencidos.
- Envio de resumen diario a supervisores.
- Cierre automatico de casos resueltos despues de N dias.
- Limpieza o archivado de logs antiguos.

## clasp

Reglas:

- No ejecutar `clasp push` sin confirmacion explicita.
- Validar `.claspignore`.
- Confirmar `.clasp.json` antes de push.
- Crear version antes de deploy.
- Documentar cada despliegue en `CHANGELOG.md`.

## Validaciones

Frontend:

- Campos requeridos.
- Formato de correo.
- Tamano maximo de adjuntos.
- Tipos de archivo permitidos.
- Longitud minima de descripcion.

Backend:

- Repetir validaciones criticas.
- Validar estado permitido.
- Validar transiciones de estado.
- Validar permisos por rol.
- Validar folio y correo para consulta publica.
- Validar que no se excedan limites de Apps Script.

## Riesgos tecnicos

- Cuotas de Apps Script por uso intensivo de polling.
- Limites de tamano en adjuntos base64.
- Lentitud de Google Sheets si crece demasiado.
- Permisos de Drive mal configurados.
- Exposicion de datos internos en seguimiento publico.
- Cambios manuales en Apps Script no sincronizados con clasp.
- Hardcodeo de IDs fuera de `CONFIG`.

