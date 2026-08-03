# 06_ESTANDAR_LOGS_AUDITORIA_ERRORES

## 1. Propósito

Este estándar define la trazabilidad mínima para proyectos GAS.

Todo sistema debe poder responder:

- Qué ocurrió.
- Quién lo ejecutó.
- Cuándo ocurrió.
- Qué registro afectó.
- Si fue exitoso o falló.
- Qué error se produjo.
- Qué documento, correo o carpeta se generó.

---

## 2. Hojas de log recomendadas

Según el proyecto, pueden existir:

```text
LOG_EVENTOS
LOG_ERRORES
LOG_CORREOS
LOG_IMPORTACIONES
LOG_DOCUMENTOS
LOG_CAMBIOS
AUTH_LOG_ACCESOS
LOG_RESULTADOS
```

---

## 3. LOG_EVENTOS

Uso:

- Acciones normales del sistema.
- Creaciones.
- Actualizaciones.
- Cambios de estado.
- Acciones de usuario.

Campos:

```text
FECHA_HORA
USUARIO_EJECUCION
MODULO
ACCION
ID_REGISTRO
RESULTADO
MENSAJE
EXTRA_JSON
```

---

## 4. LOG_ERRORES

Uso:

- Errores técnicos.
- Errores de permisos.
- Errores de validación.
- Errores de Drive.
- Errores de Sheets.
- Errores de correo.

Campos:

```text
FECHA_HORA
USUARIO_EJECUCION
MODULO
FUNCION
ID_REGISTRO
ERROR
ERROR_STACK
MENSAJE_USUARIO
EXTRA_JSON
```

---

## 5. LOG_CORREOS

Uso:

- Envíos exitosos.
- Fallos de envío.
- Reintentos.
- Tickets enviados.
- Notificaciones.

Campos:

```text
FECHA_HORA
TIPO_CORREO
DESTINATARIO
ASUNTO
ID_REGISTRO
RESULTADO
MENSAJE
ERROR
```

---

## 6. LOG_IMPORTACIONES

Uso:

- Cargas masivas.
- Upserts.
- Migraciones.
- Procesamiento de archivos.

Campos:

```text
FECHA_HORA
USUARIO_EJECUCION
ACCION
ID_REGISTRO
CLAVE_UNICA
RESULTADO
MENSAJE
URL_ORIGEN
URL_DESTINO
```

---

## 7. LOG_DOCUMENTOS

Uso:

- Generación de Docs.
- Generación de PDFs.
- Actualización de plantillas.
- Creación de carpetas.
- Firma o aprobación documental.

Campos:

```text
FECHA_HORA
USUARIO_EJECUCION
TIPO_DOCUMENTO
ID_REGISTRO
ACCION
RESULTADO
MENSAJE
URL_DOCUMENTO
URL_PDF
ERROR
```

---

## 8. LOG_CAMBIOS

Uso:

- Auditoría antes/después.
- Actualizaciones de matrices.
- Cambios críticos.

Campos:

```text
FECHA_HORA
USUARIO_EJECUCION
MODULO
ACCION
ID_REGISTRO
ANTES_JSON
DESPUES_JSON
RESULTADO
MENSAJE
```

---

## 9. Servicio estándar

Archivo:

```text
src/services/LogService.gs
```

Funciones sugeridas:

```javascript
function LogService_evento_(accion, idRegistro, resultado, mensaje, extra) {}
function LogService_error_(accion, error, extra) {}
function LogService_correo_(tipoCorreo, destinatario, asunto, resultado, mensaje, extra) {}
function LogService_documento_(tipoDocumento, idRegistro, resultado, mensaje, extra) {}
function LogService_cambio_(accion, idRegistro, antes, despues, resultado, mensaje) {}
```

---

## 10. Formato de resultado

Usar valores controlados:

```text
OK
ERROR
ADVERTENCIA
OMITIDO
DUPLICADO
NO_AUTORIZADO
```

---

## 11. Uso de JSON

Campos como `EXTRA_JSON`, `ANTES_JSON` y `DESPUES_JSON` deben guardar JSON serializado.

Ejemplo:

```javascript
JSON.stringify({
  navegador: 'Chrome',
  dispositivo: 'Escritorio',
  observacion: 'Registro tardío'
});
```

Reglas:

- No guardar objetos enormes.
- No guardar datos sensibles innecesarios.
- No guardar tokens.
- No guardar contraseñas.

---

## 12. Manejo de errores

Toda función pública debe tener `try/catch`.

Ejemplo:

```javascript
function registrar(payload) {
  try {
    // lógica
    LogService_evento_('REGISTRAR', id, 'OK', 'Registro creado.', {});
    return ResponseService_ok_({}, 'Registro creado.');
  } catch (error) {
    LogService_error_('REGISTRAR', error, { payload: payload });
    return ResponseService_error_(error, 'No se pudo registrar.');
  }
}
```

---

## 13. Errores de permisos y scopes

Registrar especialmente errores como:

- Falta permiso Drive.
- Falta permiso Mail.
- Falta permiso UrlFetch.
- Falta permiso Spreadsheet.
- Archivo no encontrado.
- Carpeta no encontrada.
- Hoja no encontrada.
- Encabezado no encontrado.

---

## 14. Archivado de logs

Para proyectos con alto volumen:

- Crear logs por mes si es necesario.
- Archivar logs antiguos.
- No borrar sin respaldo.
- Documentar política en `docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md`.

---

## 15. Reglas para IA/Codex

La IA debe:

- Agregar logs en todo flujo nuevo.
- No dejar catch vacío.
- No ocultar errores sin registrar.
- No mostrar stack completo al usuario final.
- Registrar errores técnicos en hoja correspondiente.
- Actualizar documentación si agrega nuevos logs.
