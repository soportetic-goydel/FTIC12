# 08_PROMPTS_BASE_CODEX_CHAT

## 1. Prompt base para iniciar un chat nuevo

```text
Actúa como arquitecto técnico senior de Google Apps Script, clasp, HtmlService, HTML/CSS/JS, Google Sheets como base de datos liviana, Auth Login seguro y documentación viva.

Estoy trabajando localmente en VSCode y despliego a Google Apps Script mediante clasp.

Antes de modificar código, UI, configuración o documentación, debes leer primero la documentación disponible del repositorio.

Lee en este orden:
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
11. docs/01_GUIA_GENERAL.md si existe.
12. docs/02_GUIA_TECNICA.md si existe.
13. docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md si existe.
14. docs/CHANGELOG.md si existe.
15. docs/DECISIONES.md si existe.
16. appsscript.json, .clasp.json y .claspignore si existen.
17. src/config/Config.gs si existe.
18. La estructura de src/ si existe.

Después de leer, haz un rewind breve del proyecto:
- objetivo del sistema,
- estructura local,
- módulos existentes,
- flujo VSCode -> clasp -> Apps Script,
- configuración crítica,
- Google Sheets usados,
- hojas y encabezados,
- uso del padrón único,
- permisos/scopes,
- riesgos actuales,
- pendientes,
- reglas que no debo romper.

Reglas obligatorias:
- No hardcodear IDs, rutas, carpetas, plantillas ni reglas de negocio fuera de CONFIG.
- Mantener arquitectura modular.
- Mantener carpeta docs como documentación viva del proyecto.
- Mantener docs_base como estándar reusable, no como bitácora del proyecto.
- No modificar código antes de explicar qué archivos se verían afectados.
- No hacer clasp push, deploy o redeploy sin confirmación explícita.
- No tocar carpetas auxiliares o de referencia si están excluidas por .claspignore.
- Usar google.script.run para frontend-backend en Apps Script.
- Usar HtmlService con include() para evitar Index.html monolítico.
- Las funciones internas deben terminar con guion bajo _.
- Las funciones públicas deben devolver objetos controlados cuando aplique: { ok, result, message }.
- Si cambia UI, lógica, configuración, permisos, despliegue, datos, correos o dependencias, actualizar docs/.
- No duplicar el padrón único de personal.
- Consumir el padrón único desde PadronService.gs.
- No construir HTML largo de correos dentro de funciones .gs; usar plantillas HTML separadas.
- No leer columnas por índice fijo si existe encabezado.
- Validar permisos de Auth en backend, no solo en frontend.
- Registrar logs de eventos, errores, correos y cambios críticos.

Luego espera mi objetivo específico de la iteración o, si ya lo incluí, indica:
1. tipo de cambio,
2. archivos afectados,
3. riesgos,
4. plan corto,
5. validaciones que realizarás.

No des respuestas genéricas. Basa tu análisis en los archivos reales del repositorio.
```

---

## 2. Prompt para crear un proyecto greenfield

```text
Crea un proyecto greenfield de Google Apps Script con clasp y HtmlService usando el estándar docs_base.

Necesito que generes la estructura local completa con:

- src/config/Config.gs
- src/config/Constants.gs
- src/core/WebApp.gs
- src/core/HtmlIncludes.gs
- src/core/ResponseService.gs
- src/core/Utils.gs
- src/services/SheetsService.gs
- src/services/PadronService.gs
- src/services/LogService.gs
- src/services/EmailService.gs
- src/services/DriveService.gs
- src/services/AuthService.gs
- src/ui/GlobalStyles.html
- src/ui/GlobalClient.html
- src/ui/Layout.html
- src/templates/email/EmailLayout.html
- Index.html
- appsscript.json
- .claspignore
- docs/01_GUIA_GENERAL.md
- docs/02_GUIA_TECNICA.md
- docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md
- docs/CHANGELOG.md
- docs/DECISIONES.md

Reglas:
- CONFIG debe ser la fuente de verdad.
- Debe consumir el padrón único del grupo económico.
- Debe usar google.script.run.
- Debe tener respuestas controladas.
- Debe tener logs.
- Debe estar preparado para Auth Login aunque AUTH.ENABLED inicie en false.
- Debe separar HTML de correos en templates.
- Debe evitar Index.html monolítico.
- No hagas clasp push ni deploy.
```

---

## 3. Prompt para agregar un módulo

```text
Agrega un nuevo módulo llamado [NOMBRE_MODULO] siguiendo el estándar docs_base.

Antes de modificar, indica:
- archivos que crearás,
- archivos que modificarás,
- hojas de Google Sheets involucradas,
- encabezados requeridos,
- logs necesarios,
- riesgos,
- validaciones.

El módulo debe tener:
- Service.gs
- DataService.gs
- Mapper.gs
- Validator.gs
- View.html
- Client.html
- Styles.html si aplica.

No hardcodees IDs ni encabezados fuera de CONFIG.
No hagas push ni deploy.
Actualiza docs/.
```

---

## 4. Prompt para revisar un proyecto existente

```text
Revisa este proyecto existente y dime si cumple el estándar greenfield.

Evalúa:
- estructura src/,
- CONFIG,
- uso de padrón único,
- Google Sheets y encabezados,
- lectura por encabezado,
- uso de google.script.run,
- separación UI/backend,
- correos HTML,
- logs,
- Auth,
- appsscript.json,
- .claspignore,
- docs/,
- riesgos,
- mejoras prioritarias.

No modifiques archivos todavía. Primero dame diagnóstico y plan.
```

---

## 5. Prompt para preparar despliegue

```text
Prepara una revisión previa a despliegue clasp.

Verifica:
- appsscript.json,
- scopes,
- .clasp.json,
- .claspignore,
- includes HTML,
- funciones públicas,
- CONFIG,
- hojas requeridas,
- logs,
- Auth si aplica,
- plantillas de correo,
- documentación docs/.

No ejecutes clasp push, version, deploy ni redeploy sin mi confirmación explícita.
```

---

## 6. Prompt para documentar cambios

```text
Actualiza la documentación viva por los cambios realizados.

Debes actualizar:
- docs/01_GUIA_GENERAL.md si cambió alcance o flujo.
- docs/02_GUIA_TECNICA.md si cambió código, estructura, Sheets, CONFIG, scopes o servicios.
- docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md si cambió el uso operativo.
- docs/CHANGELOG.md siempre.
- docs/DECISIONES.md si hubo una decisión técnica relevante.

No inventes información. Basa la documentación en los archivos reales.
```
