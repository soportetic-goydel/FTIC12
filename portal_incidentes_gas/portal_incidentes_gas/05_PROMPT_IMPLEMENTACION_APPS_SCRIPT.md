# Prompt de Implementacion Apps Script

## Prompt maestro

```text
Actua como arquitecto senior y desarrollador experto en Google Apps Script, clasp, HtmlService, HTML/CSS/JS, Google Sheets como base de datos liviana, Google Drive, MailApp/GmailApp, seguridad en Apps Script, UI/UX de formularios y documentacion viva.

Necesito construir un proyecto greenfield llamado "Portal de Incidentes GAS" basado en la plantilla PlantillaProjectGAS_UIUX_Vs01.

OBJETIVO
Crear una Web App donde un usuario pueda reportar un incidente, adjuntar evidencia, recibir un folio unico y consultar el seguimiento del caso. Tambien debe existir un panel administrativo para gestionar incidentes, asignar responsables, cambiar estados, agregar comentarios, enviar notificaciones y consultar metricas.

ANTES DE IMPLEMENTAR
Lee primero:
1. docs_base/00_ESTANDAR_TRABAJO_LOCAL_GAS_CLASP.md
2. docs_base/01_ESTANDAR_GOOGLE_SHEETS_COMO_BD_Y_FORMULARIOS.md
3. docs_base/02_ESTANDAR_ESTRUCTURA_GREENFIELD_SRC.md
4. docs_base/03_ESTANDAR_UI_UX_FORMULARIOS_HTMLSERVICE.md
5. docs_base/04_ESTANDAR_CORREOS_HTML_GAS.md
6. docs_base/05_ESTANDAR_AUTH_LOGIN_SEGURIDAD.md
7. docs_base/06_ESTANDAR_LOGS_AUDITORIA_ERRORES.md
8. docs_base/07_ESTANDAR_DOCUMENTACION_VIVA_GOBIERNO.md
9. docs_base/08_PROMPTS_BASE_CODEX_CHAT.md
10. docs_base/09_CHECKLIST_GREENFIELD.md
11. docs/portal_incidentes_gas/01_GUIA_GENERAL.md
12. docs/portal_incidentes_gas/02_GUIA_TECNICA.md
13. docs/portal_incidentes_gas/03_GUIA_OPERATIVA_Y_GOBIERNO.md
14. docs/portal_incidentes_gas/04_MODELO_DATOS_SHEETS.md
15. docs/portal_incidentes_gas/DECISIONES.md

REGLAS ARQUITECTONICAS
- CONFIG es la unica fuente de verdad para IDs, nombres de hojas, encabezados, estados, roles, colores, correos y parametros.
- No hardcodear IDs, carpetas, rutas, correos ni nombres de hojas fuera de CONFIG.
- Usar estructura modular en src/.
- Mantener Index.html liviano y ensamblado con include().
- Usar google.script.run para comunicacion frontend-backend.
- No usar fetch('/api/...').
- No usar WebSockets nativos en Apps Script.
- Implementar seguimiento con polling cada 15 segundos.
- Detener polling cuando el estado sea Resuelto, Cerrado o Cancelado.
- Todas las funciones publicas devuelven { ok, result, message }.
- Las funciones internas terminan con guion bajo _.
- Leer y escribir Sheets por encabezado, nunca por indice fijo.
- Usar LockService al crear folios.
- Registrar logs de eventos, errores, correos y auditoria.
- Separar plantillas HTML de correos en src/templates/email/.
- Validar permisos en backend, no solo en frontend.
- No hacer clasp push, version, deploy ni redeploy sin confirmacion explicita.

ESTRUCTURA A GENERAR
Genera o adapta:
- src/config/Config.gs
- src/config/Constants.gs
- src/core/WebApp.gs
- src/core/HtmlIncludes.gs
- src/core/ResponseService.gs
- src/core/Utils.gs
- src/services/SheetsService.gs
- src/services/ReportsService.gs
- src/services/HistoryService.gs
- src/services/CommentsService.gs
- src/services/AttachmentsService.gs
- src/services/UsersService.gs
- src/services/AuthService.gs
- src/services/EmailService.gs
- src/services/LogService.gs
- src/services/DashboardService.gs
- src/ui/GlobalStyles.html
- src/ui/GlobalClient.html
- src/ui/Layout.html
- src/ui/HomeView.html
- src/ui/ReportFormView.html
- src/ui/TrackingView.html
- src/ui/AdminView.html
- src/ui/DashboardView.html
- src/templates/email/EmailLayout.html
- src/templates/email/EmailStyles.html
- src/templates/email/ReportCreatedEmail.html
- src/templates/email/StatusChangedEmail.html
- src/templates/email/InfoRequestedEmail.html
- src/templates/email/ReportResolvedEmail.html
- Index.html
- appsscript.json
- .claspignore

HOJAS REQUERIDAS
Implementa setupDatabase() para crear o validar:
- Reports
- StatusHistory
- Comments
- Attachments
- Users
- Catalogs
- SlaRules
- LogEventos
- LogErrores
- LogCorreos
- AuditLog

Usa exactamente los encabezados documentados en docs/portal_incidentes_gas/04_MODELO_DATOS_SHEETS.md, salvo que expliques y documentes una mejora.

FUNCIONES PUBLICAS MINIMAS
- doGet(e)
- setupDatabase()
- createReport(payload)
- getReportPublicStatus(folio, email)
- listReports(filters)
- getReportAdminDetail(folio)
- updateReportStatus(payload)
- assignReport(folio, assignedTo)
- addComment(payload)
- getDashboardMetrics(filters)
- getCatalogs()
- getCurrentUser()

FLUJO DE REGISTRO
1. Mostrar formulario de nuevo incidente.
2. Validar datos obligatorios.
3. Convertir adjuntos a payload controlado.
4. En backend validar nuevamente.
5. Generar folio con formato INC-YYYYMMDD-0001.
6. Crear carpeta Drive por folio.
7. Guardar adjuntos.
8. Guardar fila en Reports.
9. Guardar historial inicial en StatusHistory.
10. Registrar evento.
11. Enviar correo de confirmacion.
12. Devolver folio y URL de seguimiento.

FLUJO DE SEGUIMIENTO
1. Usuario ingresa folio y correo.
2. Backend valida coincidencia.
3. Devuelve datos publicos del incidente.
4. Devuelve historial y comentarios publicos.
5. Frontend actualiza cada 15 segundos mientras el caso este abierto.

FLUJO ADMINISTRATIVO
1. Backend obtiene usuario actual.
2. Valida rol en Users.
3. Lista incidentes con filtros.
4. Permite ver detalle.
5. Permite asignar responsable.
6. Permite actualizar estado con transicion valida.
7. Permite agregar comentarios internos o publicos.
8. Registra auditoria antes/despues.
9. Envia correo si el cambio es publico.

UI/UX
- Usar el kit visual de la plantilla.
- Interfaz responsive.
- Vista inicial con acciones claras: Nuevo incidente y Consultar incidente.
- Formularios divididos por secciones.
- Estados con badges de color.
- Timeline para seguimiento.
- Tabla administrativa con filtros.
- Panel lateral o modal de detalle.
- Indicadores de carga.
- Toasts de exito/error.
- Textos claros y breves.
- No crear landing page de marketing.

CORREOS
Crear plantillas para:
- Incidente creado.
- Cambio de estado.
- Solicitud de informacion.
- Incidente resuelto.

Cada correo debe incluir:
- Folio.
- Estado.
- Resumen.
- Enlace de seguimiento.
- Fecha y hora.
- Footer institucional.

SEGURIDAD
- No exponer comentarios internos al reportante.
- No exponer IDs Drive si no hace falta.
- Validar rol en backend.
- Sanitizar entradas.
- Limitar tamano y tipos de adjuntos.
- Registrar errores sin mostrar stack al usuario final.
- Documentar scopes en appsscript.json y docs.

CRITERIOS DE ACEPTACION
La implementacion estara completa cuando:
1. Un usuario pueda crear un incidente.
2. El sistema genere folio unico.
3. El incidente se guarde en Reports.
4. Los adjuntos se guarden en Drive.
5. Se envie correo de confirmacion.
6. El usuario pueda consultar seguimiento por folio y correo.
7. El seguimiento tenga polling controlado.
8. El administrador pueda listar, filtrar y actualizar incidentes.
9. Cada cambio de estado quede en StatusHistory.
10. Los comentarios publicos aparezcan en seguimiento.
11. Los comentarios internos solo aparezcan en admin.
12. Los correos queden registrados.
13. Los errores queden registrados.
14. Los cambios criticos queden en AuditLog.
15. La UI funcione en desktop y mobile.
16. La documentacion viva quede actualizada.

ENTREGA
Antes de escribir codigo, responde:
- tipo de cambio,
- archivos a crear/modificar,
- hojas involucradas,
- scopes requeridos,
- riesgos,
- plan corto,
- validaciones.

Luego implementa los archivos y no ejecutes clasp push ni deploy sin confirmacion explicita.
```

## Prompt corto para una iteracion posterior

```text
Trabaja sobre el Portal de Incidentes GAS. Lee docs_base y docs/portal_incidentes_gas antes de modificar.

Implementa la siguiente mejora: [DESCRIBIR MEJORA].

Respeta CONFIG como fuente de verdad, google.script.run, include(), lectura por encabezado, logs, auditoria y documentacion viva. No hagas clasp push ni deploy sin confirmacion explicita.
```

