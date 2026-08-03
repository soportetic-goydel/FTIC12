# 00_ESTANDAR_TRABAJO_LOCAL_GAS_CLASP

## 1. Propósito

Este documento define la forma de trabajo recomendada para proyectos desarrollados localmente en VSCode, desplegados a Google Apps Script mediante `clasp` y mantenidos con documentación viva.

Aplica para:

- Formularios web con HtmlService.
- Automatizaciones con Google Apps Script.
- Proyectos que usan Google Sheets como base de datos liviana.
- Sistemas internos con Auth Login.
- Proyectos asistidos por IA/Codex en VSCode.
- Módulos reutilizables para RRHH, TIC, SIG, Operaciones, SSOMA, capacitaciones, inventarios, matrices de control y registros.

El objetivo es que cualquier persona pueda continuar el proyecto sin romper arquitectura, despliegue ni trazabilidad.

---

## 2. Principios base

1. `CONFIG` es la única fuente de verdad para IDs, hojas, carpetas, plantillas, encabezados, colores, logos y reglas.
2. `Index.html` debe ser liviano y ensamblar la UI con `include()`.
3. El frontend debe comunicarse con backend GAS mediante `google.script.run`.
4. No usar `fetch('/api/...')` dentro de HtmlService para llamar a endpoints inexistentes.
5. No guardar credenciales en el repositorio.
6. No crear recursos técnicos silenciosamente durante el flujo operativo normal.
7. Toda función pública debe devolver objetos controlados.
8. Toda función interna debe terminar con guion bajo `_`.
9. Toda modificación relevante debe actualizar `docs/`.
10. No hacer `clasp push`, `deploy` o `redeploy` sin confirmación explícita.

---

## 3. Entorno developer y cuentas

Las cuentas pueden documentarse para trazabilidad operativa, pero los accesos reales se administran fuera del repositorio.

Ejemplo de tabla operativa:

| Herramienta | Cuenta operativa |
|---|---|
| VSCode | `[correo técnico]` |
| clasp | `[correo clasp]` |
| Codex / Chat Bot | `[correo IA]` |
| Google Drive Desktop | `[correo drive]` |
| GitHub | `[correo github]` |

Reglas:

- No guardar passwords.
- No guardar tokens.
- No guardar cookies.
- No guardar llaves privadas.
- No subir `.clasprc.json` personal.
- No subir archivos descargados con credenciales.
- No subir dumps con datos sensibles si el repositorio será público.

---

## 4. Estructura base recomendada

```text
src/
  config/
    Config.gs
    Constants.gs

  core/
    WebApp.gs
    Router.gs
    HtmlIncludes.gs
    ResponseService.gs
    Utils.gs

  services/
    SheetsService.gs
    PadronService.gs
    DriveService.gs
    EmailService.gs
    LogService.gs
    AuthService.gs
    ReferenceService.gs

  modules/
    nombre_modulo/
      NombreModuloService.gs
      NombreModuloDataService.gs
      NombreModuloMapper.gs
      NombreModuloValidator.gs
      NombreModuloView.html
      NombreModuloClient.html
      NombreModuloStyles.html

  ui/
    Layout.html
    Header.html
    Sidebar.html
    Components.html
    GlobalStyles.html
    GlobalClient.html

  templates/
    email/
      EmailLayout.html
      EmailTicket.html
      EmailNotification.html

docs/
  01_GUIA_GENERAL.md
  02_GUIA_TECNICA.md
  03_GUIA_OPERATIVA_Y_GOBIERNO.md
  CHANGELOG.md
  DECISIONES.md

docs_base/
  00_ESTANDAR_TRABAJO_LOCAL_GAS_CLASP.md
  01_ESTANDAR_GOOGLE_SHEETS_COMO_BD_Y_FORMULARIOS.md
  02_ESTANDAR_ESTRUCTURA_GREENFIELD_SRC.md
  03_ESTANDAR_UI_UX_FORMULARIOS_HTMLSERVICE.md
  04_ESTANDAR_CORREOS_HTML_GAS.md
  05_ESTANDAR_AUTH_LOGIN_SEGURIDAD.md
  06_ESTANDAR_LOGS_AUDITORIA_ERRORES.md
  07_ESTANDAR_DOCUMENTACION_VIVA_GOBIERNO.md
  08_PROMPTS_BASE_CODEX_CHAT.md
  09_CHECKLIST_GREENFIELD.md

appsscript.json
.clasp.json
.claspignore
Index.html
README.md
```

---

## 5. Reglas de arquitectura

### 5.1. Configuración

`src/config/Config.gs` debe centralizar:

- IDs de Google Sheets.
- Nombres de hojas.
- Encabezados.
- IDs de carpetas Drive.
- IDs de plantillas.
- Estados permitidos.
- Roles.
- Scopes esperados.
- Colores.
- Logos.
- Textos críticos.
- Correos de soporte.
- Parámetros de Auth.
- Parámetros de envío de correos.

No se permite declarar estos valores dispersos en servicios, vistas o scripts cliente.

### 5.2. Funciones públicas

Las funciones públicas son llamadas desde el frontend o por triggers.

Deben tener nombres claros y devolver objetos controlados.

Formato recomendado:

```javascript
function obtenerProgramas() {
  try {
    return ResponseService_ok_({ programas: [] }, 'Programas obtenidos.');
  } catch (error) {
    return ResponseService_error_(error, 'No se pudo obtener programas.');
  }
}
```

Respuesta esperada:

```javascript
{
  ok: true,
  result: {},
  message: 'Operación realizada correctamente.'
}
```

En error:

```javascript
{
  ok: false,
  result: null,
  message: 'No se pudo completar la operación.',
  error: 'Detalle técnico controlado.'
}
```

### 5.3. Funciones internas

Toda función auxiliar interna debe terminar con `_`.

Ejemplos:

```javascript
leerConfig_()
normalizarDni_()
getHeaderMap_()
validarSesion_()
registrarLog_()
```

---

## 6. HtmlService e includes

Helper base:

```javascript
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}
```

Uso esperado:

```html
<?!= include('src/ui/GlobalStyles'); ?>
<?!= include('src/ui/Layout'); ?>
<?!= include('src/modules/nombre_modulo/NombreModuloView'); ?>
<?!= include('src/modules/nombre_modulo/NombreModuloClient'); ?>
```

Reglas:

- `Index.html` no debe ser monolítico.
- Los estilos globales deben ir separados.
- Los scripts cliente deben ir separados.
- Los módulos deben tener vista, cliente y estilos propios cuando aplique.
- No repetir bloques HTML en varios archivos si pueden convertirse en componente.

---

## 7. Flujo de trabajo recomendado

1. Crear o clonar proyecto localmente.
2. Abrir la raíz del repositorio en VSCode.
3. Copiar `docs_base/`.
4. Crear estructura `src/` y `docs/`.
5. Configurar `.clasp.json`, `.claspignore` y `appsscript.json`.
6. Centralizar configuración en `src/config/Config.gs`.
7. Crear `include()` en `src/core/HtmlIncludes.gs`.
8. Crear `Index.html` como template liviano.
9. Crear servicios base.
10. Crear módulos por responsabilidad.
11. Crear o conectar Google Sheets.
12. Validar estructura de hojas y encabezados.
13. Actualizar documentación.
14. Validar sintaxis local.
15. Ejecutar `clasp push --force` solo con confirmación.
16. Crear versión con `clasp version`.
17. Consultar despliegues con `clasp deployments`.
18. Ejecutar `clasp deploy` o `clasp redeploy` solo con confirmación.
19. Reautorizar permisos si cambiaron scopes.

---

## 8. Checklist antes de push

- `docs/` está actualizado.
- `docs_base/` no fue modificado como bitácora del proyecto.
- `appsscript.json` conserva runtime, scopes y webapp.
- `.claspignore` excluye carpetas que no deben desplegarse.
- No hay credenciales ni tokens.
- No hay IDs nuevos fuera de `CONFIG`.
- Los includes apuntan a archivos existentes.
- Las funciones públicas siguen compatibles con `google.script.run`.
- Las funciones internas nuevas terminan con `_`.
- El módulo nuevo no rompe módulos existentes.
- Si hubo cambios en Sheets, se actualizó el diccionario.
- Si hubo cambios en correos, se actualizó `CONFIG_CORREOS` o documentación.
- Si hubo cambios de permisos, se documentaron scopes.

---

## 9. Riesgos comunes

| Riesgo | Consecuencia | Control |
|---|---|---|
| Push desde carpeta incorrecta | Se despliega otro proyecto | Validar `.clasp.json` antes de push |
| IDs hardcodeados | Difícil mantenimiento | Centralizar en `CONFIG` |
| Cambios manuales en Apps Script | Repositorio queda desfasado | No editar en editor web salvo emergencia |
| Scopes nuevos sin reautorización | Fallas en producción | Documentar y reautorizar |
| Hojas sin encabezado estable | Código se rompe | Lectura por encabezado |
| Logs inexistentes | Sin trazabilidad | `LogService.gs` obligatorio |
| HTML de correo dentro de `.gs` | Difícil mantener | Plantillas HTML separadas |
| Auth solo en frontend | Riesgo de seguridad | Validar rol en backend |
| Crear hojas automáticamente | Desorden operativo | Solo en setup técnico controlado |

---

## 10. Prompt simple de rewind

```text
Lee la carpeta docs_base completa y luego la carpeta docs del proyecto. Hazme un rewind técnico, operativo y de riesgos para continuar trabajando localmente sin romper la arquitectura.
```

---

## 11. Prompt para crear un nuevo formato greenfield

```text
Actúa como arquitecto senior de Google Apps Script, clasp, HtmlService, Google Sheets como base de datos liviana y documentación viva.

Crea una arquitectura modular greenfield con CONFIG como fuente de verdad, frontend por includes, backend por servicios, logs obligatorios, integración al padrón único de personal, posibilidad de Auth Login y flujo de despliegue con clasp.
```
