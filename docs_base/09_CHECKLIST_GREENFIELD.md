# 09_CHECKLIST_GREENFIELD

## 1. Checklist inicial de proyecto

- [ ] Existe `README.md`.
- [ ] Existe `docs_base/`.
- [ ] Existe `docs/`.
- [ ] Existe `src/`.
- [ ] Existe `src/config/Config.gs`.
- [ ] Existe `src/config/Constants.gs`.
- [ ] Existe `src/core/WebApp.gs`.
- [ ] Existe `src/core/HtmlIncludes.gs`.
- [ ] Existe `src/core/ResponseService.gs`.
- [ ] Existe `src/services/SheetsService.gs`.
- [ ] Existe `src/services/PadronService.gs`.
- [ ] Existe `src/services/LogService.gs`.
- [ ] Existe `src/services/EmailService.gs`.
- [ ] Existe `Index.html`.
- [ ] Existe `appsscript.json`.
- [ ] Existe `.claspignore`.

---

## 2. Checklist CONFIG

- [ ] Todos los IDs están en `CONFIG`.
- [ ] Todos los nombres de hojas están en `CONFIG`.
- [ ] Todos los encabezados críticos están en `CONFIG`.
- [ ] Los logos están en `CONFIG.UI`.
- [ ] Los colores están en `CONFIG.UI`.
- [ ] Los correos están en `CONFIG.EMAIL`.
- [ ] Los parámetros Auth están en `CONFIG.AUTH`.
- [ ] No hay IDs hardcodeados en servicios.
- [ ] No hay nombres de hojas dispersos.

---

## 3. Checklist Google Sheets

- [ ] Existe hoja principal de registros.
- [ ] Existe hoja de configuración.
- [ ] Existe hoja de log de eventos.
- [ ] Existe hoja de log de errores.
- [ ] Existe hoja de log de correos si envía correos.
- [ ] Existe diccionario si es matriz de control.
- [ ] Existe hoja de tags si genera documentos.
- [ ] Encabezados sin tildes ni espacios innecesarios.
- [ ] Lectura por encabezado.
- [ ] Validación de duplicados.
- [ ] Uso de `LockService` en registros simultáneos.
- [ ] No se duplica padrón único.
- [ ] Se consume padrón único desde `PadronService.gs`.

---

## 4. Checklist padrón único

- [ ] `CONFIG.SPREADSHEETS.PADRON_PERSONAL` contiene `123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc`.
- [ ] `CONFIG.PADRON.SHEETS_EMPRESAS` contiene `TDEMSRL` y `GOYDELSAC`.
- [ ] `CONFIG.PADRON.SHEET_CECO` contiene `CECO`.
- [ ] `PadronService.gs` busca por DNI.
- [ ] El DNI se trata como texto.
- [ ] No se devuelve todo el padrón al frontend.
- [ ] Se registra empresa de origen.
- [ ] Se valida CECO si aplica.

---

## 5. Checklist UI/UX

- [ ] Diseño mobile-first.
- [ ] Existe `.card`.
- [ ] Existe header.
- [ ] Existe overlay de carga.
- [ ] Existe toast o feedback.
- [ ] Existen vistas por estado.
- [ ] Existe vista de éxito.
- [ ] Existe vista de error o advertencia.
- [ ] Botones principales claros.
- [ ] Inputs legibles.
- [ ] Validación frontend básica.
- [ ] Validación backend obligatoria.
- [ ] No hay `Index.html` monolítico.
- [ ] Usa `include()`.

---

## 6. Checklist frontend-backend

- [ ] Usa `google.script.run`.
- [ ] Cada llamada tiene success handler.
- [ ] Cada llamada tiene failure handler.
- [ ] No usa `fetch('/api/...')`.
- [ ] No expone datos completos innecesarios.
- [ ] Envía solo payload necesario.
- [ ] Maneja loading.
- [ ] Maneja errores.

---

## 7. Checklist correos

- [ ] Existe `EmailService.gs`.
- [ ] Existen plantillas HTML separadas.
- [ ] No hay HTML largo dentro de `.gs`.
- [ ] Existe `LOG_CORREOS`.
- [ ] Se registra cada envío.
- [ ] Se registra cada error.
- [ ] Asunto parametrizado.
- [ ] Footer automático.
- [ ] No se envían datos sensibles innecesarios.
- [ ] Si se comparte Drive, queda registrado.

---

## 8. Checklist Auth

- [ ] Se definió si el proyecto requiere Auth.
- [ ] `CONFIG.AUTH.ENABLED` está configurado.
- [ ] Si aplica, existen hojas AUTH.
- [ ] Backend valida sesión.
- [ ] Backend valida permisos.
- [ ] Frontend no decide permisos.
- [ ] Se registran accesos.
- [ ] Sesiones expiran.
- [ ] Usuarios inactivos no acceden.

---

## 9. Checklist logs

- [ ] Existe `LogService.gs`.
- [ ] Eventos principales tienen log.
- [ ] Errores tienen log.
- [ ] Correos tienen log.
- [ ] Documentos generados tienen log si aplica.
- [ ] Cambios críticos tienen antes/después si aplica.
- [ ] No hay catch vacío.
- [ ] No se muestra stack completo al usuario final.

---

## 10. Checklist documentación

- [ ] `docs/01_GUIA_GENERAL.md` actualizado.
- [ ] `docs/02_GUIA_TECNICA.md` actualizado.
- [ ] `docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md` actualizado.
- [ ] `docs/CHANGELOG.md` actualizado.
- [ ] `docs/DECISIONES.md` actualizado si hubo decisión.
- [ ] Se documentaron hojas y encabezados.
- [ ] Se documentaron scopes.
- [ ] Se documentaron riesgos.
- [ ] Se documentaron pendientes.

---

## 11. Checklist antes de clasp push

- [ ] Confirmación explícita del usuario.
- [ ] `.clasp.json` apunta al proyecto correcto.
- [ ] `.claspignore` revisado.
- [ ] `appsscript.json` revisado.
- [ ] Includes HTML existentes.
- [ ] No hay credenciales.
- [ ] No hay archivos sensibles.
- [ ] Documentación actualizada.
- [ ] Scopes revisados.
- [ ] Validación local realizada.

---

## 12. Checklist antes de deploy

- [ ] `clasp push` completado.
- [ ] `clasp version` creado.
- [ ] `clasp deployments` revisado.
- [ ] Se confirmó tipo de despliegue.
- [ ] Se validó acceso Web App.
- [ ] Se validó reautorización si cambiaron scopes.
- [ ] Se probó flujo principal.
- [ ] Se probó log de errores.
- [ ] Se probó correo si aplica.
- [ ] Se actualizó `CHANGELOG.md`.

---

## 13. Checklist de riesgo

- [ ] ¿Hay IDs fuera de CONFIG?
- [ ] ¿Hay lectura por índice fijo?
- [ ] ¿Hay HTML de correo embebido en `.gs`?
- [ ] ¿Hay hojas duplicadas de padrón?
- [ ] ¿Hay permisos solo en frontend?
- [ ] ¿Hay logs faltantes?
- [ ] ¿Hay scopes nuevos no documentados?
- [ ] ¿Hay cambios manuales en Apps Script no bajados al repo?
- [ ] ¿Hay datos sensibles en GitHub?
- [ ] ¿Hay archivos que `.claspignore` debería excluir?
