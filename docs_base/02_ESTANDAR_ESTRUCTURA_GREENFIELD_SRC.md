# 02_ESTANDAR_ESTRUCTURA_GREENFIELD_SRC

## 1. Propósito

Este documento define la estructura definitiva para proyectos greenfield en Google Apps Script con `clasp`, HtmlService, Google Sheets y asistencia de IA.

El objetivo es evitar proyectos monolíticos y asegurar que cada nuevo módulo sea mantenible, auditable y escalable.

---

## 2. Estructura obligatoria

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
```

---

## 3. Config.gs obligatorio

Todo proyecto debe iniciar con `src/config/Config.gs`.

Plantilla base:

```javascript
const CONFIG = {
  APP: {
    NAME: 'Nombre del sistema',
    VERSION: '1.0.0',
    TIMEZONE: 'America/Lima',
    ENV: 'production'
  },

  SPREADSHEETS: {
    MAIN: '',
    PADRON_PERSONAL: '123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc'
  },

  PADRON: {
    SHEETS_EMPRESAS: ['TDEMSRL', 'GOYDELSAC'],
    SHEET_CECO: 'CECO',
    HEADERS_PERSONAL: {
      DNI: 'DNI',
      NOMBRE: 'APELLIDOS Y NOMBRES',
      CARGO: 'CARGO',
      PROYECTO: 'PROYECTO'
    },
    HEADERS_CECO: {
      RAZON_SOCIAL: 'RAZON SOCIAL',
      CECO: 'CECO',
      CENTRO_COSTO: 'CENTRO DE COSTO',
      PROYECTO: 'PROYECTO',
      ESTADO: 'ESTADO'
    }
  },

  SHEETS: {
    REGISTROS: 'REGISTRO_DE_RESPUESTAS',
    CONFIG: 'CONFIG_FORMULARIO',
    LOG_EVENTOS: 'LOG_EVENTOS',
    LOG_ERRORES: 'LOG_ERRORES',
    LOG_CORREOS: 'LOG_CORREOS'
  },

  UI: {
    LOGO_PRINCIPAL_URL: '',
    LOGO_SECUNDARIO_URL: '',
    COLOR_PRIMARIO: '#004a99',
    COLOR_SECUNDARIO: '#16a34a',
    COLOR_EXITO: '#16a34a',
    COLOR_ERROR: '#dc3545',
    COLOR_ALERTA: '#d97706'
  },

  EMAIL: {
    FROM_NAME: '',
    REPLY_TO: '',
    ENABLE_LOG: true
  },

  AUTH: {
    ENABLED: false,
    SESSION_MINUTES: 480
  }
};
```

Reglas:

- No usar IDs fuera de `CONFIG`.
- No usar nombres de hojas fuera de `CONFIG`.
- No usar colores fijos fuera de `CONFIG.UI`.
- No usar correos fijos fuera de `CONFIG.EMAIL`.
- No modificar `CONFIG` sin actualizar documentación.

---

## 4. Constants.gs

Debe contener valores constantes reutilizables que no dependan del proyecto.

Ejemplo:

```javascript
const APP_STATES = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  OBSERVADO: 'OBSERVADO',
  ANULADO: 'ANULADO',
  ELIMINADO: 'ELIMINADO'
};

const RESPONSE_CODES = {
  OK: 'OK',
  ERROR: 'ERROR',
  NO_ENCONTRADO: 'NO_ENCONTRADO',
  DUPLICADO: 'DUPLICADO',
  NO_AUTORIZADO: 'NO_AUTORIZADO',
  VALIDACION: 'VALIDACION'
};
```

---

## 5. WebApp.gs

Responsable de `doGet()` y configuración general de la Web App.

Ejemplo:

```javascript
function doGet(e) {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle(CONFIG.APP.NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

---

## 6. HtmlIncludes.gs

Responsable de includes.

```javascript
function include(filename) {
  return HtmlService
    .createTemplateFromFile(filename)
    .evaluate()
    .getContent();
}
```

---

## 7. ResponseService.gs

Toda función pública debe responder usando este servicio.

```javascript
function ResponseService_ok_(result, message) {
  return {
    ok: true,
    result: result || {},
    message: message || 'Operación realizada correctamente.'
  };
}

function ResponseService_error_(error, message, code) {
  return {
    ok: false,
    code: code || 'ERROR',
    result: null,
    message: message || 'No se pudo completar la operación.',
    error: error ? String(error) : ''
  };
}
```

---

## 8. SheetsService.gs

Responsabilidades:

- Abrir spreadsheets.
- Obtener hojas.
- Validar encabezados.
- Crear mapas de encabezado.
- Leer datos como objetos.
- Escribir filas.
- Actualizar filas.
- Buscar por clave.
- Evitar lectura por índices fijos.

Funciones sugeridas:

```javascript
SheetsService_open_(spreadsheetId)
SheetsService_getSheet_(ss, sheetName)
SheetsService_getHeaderMap_(sheet)
SheetsService_readObjects_(sheet)
SheetsService_appendObject_(sheet, obj, headers)
SheetsService_findRowByValue_(sheet, headerName, value)
SheetsService_validateHeaders_(sheet, requiredHeaders)
```

---

## 9. PadronService.gs

Responsable de consultar el padrón único.

Funciones sugeridas:

```javascript
PadronService_buscarPorDni(dni)
PadronService_buscarEnEmpresa_(dni, sheetName)
PadronService_validarCeco_(proyecto)
PadronService_normalizarDni_(dni)
```

Regla:

No devolver el padrón completo al frontend.

---

## 10. LogService.gs

Responsable de logs.

Funciones sugeridas:

```javascript
LogService_evento_(accion, idRegistro, resultado, mensaje, extra)
LogService_error_(accion, error, extra)
LogService_correo_(tipoCorreo, destinatario, asunto, resultado, mensaje, extra)
LogService_acceso_(correo, accion, resultado, mensaje, extra)
```

---

## 11. EmailService.gs

Responsable del envío de correos.

Funciones sugeridas:

```javascript
EmailService_enviarTicketInscripcion_(data)
EmailService_renderTemplate_(templateName, data)
EmailService_enviarHtml_(to, subject, htmlBody, options)
```

Regla:

No construir HTML largo dentro del servicio. Usar plantillas HTML.

---

## 12. AuthService.gs

Responsable de login, sesión y permisos.

Funciones sugeridas:

```javascript
AuthService_login(correo, tokenTemporal)
AuthService_logout(token)
AuthService_validarSesion_(token)
AuthService_validarPermiso_(token, modulo, accion)
AuthService_registrarAcceso_(usuario, accion, resultado)
```

Regla:

La seguridad no puede depender solo del frontend.

---

## 13. Modules

Cada módulo debe separar:

- Servicio de negocio.
- Servicio de datos.
- Mapper.
- Validator.
- Vista HTML.
- Cliente JS.
- Estilos.

Ejemplo:

```text
src/modules/capacitaciones/
  CapacitacionesService.gs
  CapacitacionesDataService.gs
  CapacitacionesMapper.gs
  CapacitacionesValidator.gs
  CapacitacionesView.html
  CapacitacionesClient.html
  CapacitacionesStyles.html
```

---

## 14. appsscript.json

Debe documentar runtime, scopes y webapp.

Ejemplo base:

```json
{
  "timeZone": "America/Lima",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.send_mail"
  ]
}
```

Regla:

Si se agrega un scope, actualizar `docs/02_GUIA_TECNICA.md` y reautorizar.

---

## 15. .claspignore recomendado

```text
node_modules/**
.git/**
.github/**
docs/**
docs_base/**
README.md
*.zip
.env
.env.*
.clasprc.json
```

Nota:

Si `docs/` y `docs_base/` no deben desplegarse a Apps Script, mantenerlas excluidas.  
Si se requiere que algún HTML de template se despliegue, debe estar dentro de `src/` o en raíz según configuración del proyecto.

---

## 16. Reglas para IA/Codex

La IA debe:

- Mantener esta estructura.
- Proponer archivos afectados antes de modificar.
- No crear monolitos.
- No duplicar lógica.
- No mover configuración fuera de `CONFIG`.
- No desplegar sin confirmación.
- Actualizar documentación viva si cambia código, UI, flujo, permisos o configuración.
