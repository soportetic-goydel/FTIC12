# Checklist Greenfield Portal de Incidentes

## Proyecto

- [ ] Existe `README.md` del proyecto.
- [ ] Existe `docs_base/`.
- [ ] Existe `docs/portal_incidentes_gas/`.
- [ ] Existe `src/`.
- [ ] Existe `appsscript.json`.
- [ ] Existe `.claspignore`.
- [ ] Existe `.clasp.json` y apunta al proyecto correcto.

## CONFIG

- [ ] `CONFIG.APP.NAME` definido.
- [ ] `CONFIG.APP.TIMEZONE` definido como `America/Lima` salvo decision distinta.
- [ ] `CONFIG.SPREADSHEETS.MAIN` definido.
- [ ] `CONFIG.DRIVE.ROOT_FOLDER_ID` definido.
- [ ] Hojas declaradas en `CONFIG.SHEETS`.
- [ ] Encabezados declarados en `CONFIG.HEADERS`.
- [ ] Estados declarados en `CONFIG.INCIDENTS.STATUSES`.
- [ ] Roles declarados en `CONFIG.AUTH.ROLES`.
- [ ] Parametros de polling declarados en `CONFIG.UI` o `CONFIG.TRACKING`.
- [ ] Correos declarados en `CONFIG.EMAIL`.
- [ ] Colores y logo declarados en `CONFIG.UI`.
- [ ] No hay IDs hardcodeados fuera de `CONFIG`.

## Google Sheets

- [ ] Existe hoja `Reports`.
- [ ] Existe hoja `StatusHistory`.
- [ ] Existe hoja `Comments`.
- [ ] Existe hoja `Attachments`.
- [ ] Existe hoja `Users`.
- [ ] Existe hoja `Catalogs`.
- [ ] Existe hoja `SlaRules`.
- [ ] Existe hoja `LogEventos`.
- [ ] Existe hoja `LogErrores`.
- [ ] Existe hoja `LogCorreos`.
- [ ] Existe hoja `AuditLog`.
- [ ] Encabezados coinciden con `04_MODELO_DATOS_SHEETS.md`.
- [ ] Lectura por encabezado.
- [ ] Escritura por encabezado o mapper controlado.
- [ ] `setupDatabase()` valida estructura.
- [ ] `LockService` protege generacion de folio.

## Backend

- [ ] Existe `ReportsService.gs`.
- [ ] Existe `HistoryService.gs`.
- [ ] Existe `CommentsService.gs`.
- [ ] Existe `AttachmentsService.gs`.
- [ ] Existe `UsersService.gs`.
- [ ] Existe `AuthService.gs`.
- [ ] Existe `EmailService.gs`.
- [ ] Existe `DashboardService.gs`.
- [ ] Existe `LogService.gs`.
- [ ] Funciones publicas devuelven `{ ok, result, message }`.
- [ ] Funciones internas terminan con `_`.
- [ ] Validaciones criticas ocurren en backend.
- [ ] Transiciones de estado se validan.
- [ ] Permisos se validan en backend.
- [ ] Errores se registran y no exponen stack al usuario.

## Frontend

- [ ] `Index.html` es liviano.
- [ ] Usa `include()`.
- [ ] Usa `GlobalStyles.html`.
- [ ] Usa `GlobalClient.html`.
- [ ] Vista de inicio implementada.
- [ ] Vista de registro implementada.
- [ ] Vista de confirmacion implementada.
- [ ] Vista de seguimiento implementada.
- [ ] Vista admin implementada.
- [ ] Dashboard implementado si aplica.
- [ ] Todas las llamadas usan `google.script.run`.
- [ ] Cada llamada tiene success handler.
- [ ] Cada llamada tiene failure handler.
- [ ] Hay overlay de carga.
- [ ] Hay toasts o mensajes claros.
- [ ] UI responsive validada.

## Adjuntos

- [ ] Se define tamano maximo por archivo.
- [ ] Se define cantidad maxima de archivos.
- [ ] Se definen tipos MIME permitidos.
- [ ] Se crea carpeta por folio.
- [ ] Se registra metadata en `Attachments`.
- [ ] No se comparten archivos innecesariamente.
- [ ] Errores de Drive quedan registrados.

## Correos

- [ ] Existe plantilla de incidente creado.
- [ ] Existe plantilla de cambio de estado.
- [ ] Existe plantilla de solicitud de informacion.
- [ ] Existe plantilla de incidente resuelto.
- [ ] No hay HTML largo dentro de `.gs`.
- [ ] Cada envio se registra en `LogCorreos`.
- [ ] Fallos de correo se registran.
- [ ] Correos no incluyen datos sensibles innecesarios.

## Seguimiento

- [ ] Consulta requiere folio y correo.
- [ ] Backend valida coincidencia.
- [ ] Solo devuelve datos publicos.
- [ ] Solo devuelve comentarios publicos.
- [ ] Polling configurado en 15 segundos.
- [ ] Polling se detiene en estados terminales.
- [ ] Se evita polling agresivo.

## Seguridad

- [ ] Roles definidos.
- [ ] Usuarios internos activos en `Users`.
- [ ] Admin protegido por backend.
- [ ] Comentarios internos no visibles para reportantes.
- [ ] Entradas sanitizadas.
- [ ] Scopes documentados.
- [ ] No hay secretos en repositorio.
- [ ] No hay credenciales en `CONFIG`.

## Logs y auditoria

- [ ] Creacion de incidente registra evento.
- [ ] Cambio de estado registra historial.
- [ ] Cambio critico registra `AuditLog`.
- [ ] Comentarios registran evento.
- [ ] Adjuntos registran evento.
- [ ] Correos registran log.
- [ ] Errores registran `LogErrores`.
- [ ] No hay `catch` vacios.

## Despliegue

- [ ] `.claspignore` revisado.
- [ ] `appsscript.json` revisado.
- [ ] Scopes revisados.
- [ ] `clasp push` solo con confirmacion explicita.
- [ ] `clasp version` solo con confirmacion explicita.
- [ ] `clasp deploy` solo con confirmacion explicita.
- [ ] URL de Web App validada.
- [ ] Flujo principal probado.

## Documentacion

- [ ] `01_GUIA_GENERAL.md` actualizado.
- [ ] `02_GUIA_TECNICA.md` actualizado.
- [ ] `03_GUIA_OPERATIVA_Y_GOBIERNO.md` actualizado.
- [ ] `04_MODELO_DATOS_SHEETS.md` actualizado.
- [ ] `CHANGELOG.md` actualizado.
- [ ] `DECISIONES.md` actualizado si hubo decision.

