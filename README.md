# Enlatado Greenfield — Google Apps Script + clasp + HtmlService + Google Sheets + IA

Fecha base: 2026-06-09  
Zona horaria: America/Lima

## Propósito

Este repositorio contiene el estándar base para iniciar proyectos greenfield desarrollados localmente en VSCode, desplegados a Google Apps Script mediante `clasp` y asistidos por IA/Codex.

El objetivo es que cada proyecto nuevo nazca con:

- Arquitectura modular.
- Documentación viva.
- Google Sheets tratado como base de datos liviana y controlada.
- Formularios web con UI/UX estandarizada.
- Correos HTML reutilizables.
- Logs y auditoría.
- Posibilidad de integrarse a un sistema con Auth Login seguro.
- Reglas claras para que un Chat Bot/Codex no improvise estructura, nombres ni flujos.

## Cómo usar este enlatado

1. Copiar la carpeta `docs_base/` dentro del nuevo proyecto.
2. Crear la estructura base `src/`, `docs/`, `Index.html`, `appsscript.json`, `.clasp.json` y `.claspignore`.
3. Abrir el proyecto en VSCode.
4. Iniciar el chat con IA/Codex usando el prompt del archivo:
   - `docs_base/08_PROMPTS_BASE_CODEX_CHAT.md`
5. Pedir primero un rewind del proyecto antes de modificar código.
6. No ejecutar `clasp push`, `deploy` o `redeploy` sin confirmación explícita.

## Orden de lectura recomendado para IA/Codex

La IA debe leer en este orden:

1. `docs_base/00_ESTANDAR_TRABAJO_LOCAL_GAS_CLASP.md`
2. `docs_base/01_ESTANDAR_GOOGLE_SHEETS_COMO_BD_Y_FORMULARIOS.md`
3. `docs_base/02_ESTANDAR_ESTRUCTURA_GREENFIELD_SRC.md`
4. `docs_base/03_ESTANDAR_UI_UX_FORMULARIOS_HTMLSERVICE.md`
5. `docs_base/04_ESTANDAR_CORREOS_HTML_GAS.md`
6. `docs_base/05_ESTANDAR_AUTH_LOGIN_SEGURIDAD.md`
7. `docs_base/06_ESTANDAR_LOGS_AUDITORIA_ERRORES.md`
8. `docs_base/07_ESTANDAR_DOCUMENTACION_VIVA_GOBIERNO.md`
9. `docs_base/08_PROMPTS_BASE_CODEX_CHAT.md`
10. `docs_base/09_CHECKLIST_GREENFIELD.md`
11. Luego leer `docs/` del proyecto, si existe.

## Regla central

No se debe construir un proyecto GAS improvisando hojas, columnas, IDs, carpetas, funciones o plantillas.  
Todo debe estar documentado, centralizado en `CONFIG` y alineado a este estándar.

## Nota importante

Este enlatado no debe contener contraseñas, tokens, cookies, llaves privadas ni credenciales reales.  
Los correos operativos, IDs de archivos y rutas pueden documentarse para trazabilidad, pero los accesos se administran fuera del repositorio.


## Indicación final obligatoria

Antes de cerrar cualquier desarrollo, debe cumplirse la transferencia o aseguramiento de propiedad documental para evitar pérdida de archivos por ausencia, rotación o baja del responsable técnico.

Ver:

- `docs_base/10_INDICACION_FINAL_PROPIEDAD_DOCUMENTAL.md`
