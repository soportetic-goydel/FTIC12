# Decisiones

## DEC-001 - Usar Google Apps Script como plataforma principal

Fecha: 2026-07-22

### Decision

El portal se implementara como Web App de Google Apps Script usando HtmlService.

### Motivo

Permite una migracion rapida al ecosistema Google, con integracion directa a Sheets, Drive y correo.

### Impacto

El backend estara limitado por cuotas y modelo de ejecucion de Apps Script. La arquitectura debe evitar procesos persistentes y llamadas excesivas.

### Riesgos

Uso intensivo puede alcanzar cuotas de Apps Script si el volumen crece.

### Control

Usar polling moderado, logs, validacion de cuotas y posibilidad futura de mover tiempo real a Firebase o Cloud Run.

## DEC-002 - Usar Google Sheets como base de datos liviana

Fecha: 2026-07-22

### Decision

La primera version usara Google Sheets como almacenamiento operativo.

### Motivo

Es suficiente para una version inicial, facilita auditoria manual controlada y reduce infraestructura.

### Impacto

Se requiere disciplina estricta de encabezados, lectura por nombre, logs y control de crecimiento.

### Riesgos

Rendimiento puede degradarse con volumen alto o consultas mal optimizadas.

### Control

Usar `SheetsService`, validacion estructural, filtros controlados, archivado futuro y no leer columnas por indice fijo.

## DEC-003 - No usar WebSockets nativos en Apps Script

Fecha: 2026-07-22

### Decision

No se implementaran WebSockets nativos en Apps Script. El seguimiento usara polling con `google.script.run` cada 15 segundos.

### Motivo

Apps Script Web App no funciona como servidor persistente de conexiones WebSocket.

### Impacto

La experiencia sera de tiempo casi real, no tiempo real estricto.

### Riesgos

Polling excesivo puede consumir cuotas.

### Control

Intervalo configurable, pausa en estados terminales y alternativa futura con Firebase, Firestore o Cloud Run.

## DEC-004 - Separar comentarios publicos e internos

Fecha: 2026-07-22

### Decision

Cada comentario e historial tendra campo `visibility` con valores `Publica` o `Interna`.

### Motivo

Permite comunicacion clara con el reportante sin exponer notas operativas internas.

### Impacto

El backend debe filtrar siempre la visibilidad segun rol y canal.

### Riesgos

Un error de filtrado podria exponer informacion interna.

### Control

Validar visibilidad en backend, agregar pruebas funcionales y revisar respuestas publicas.

## DEC-005 - Generar folios diarios con LockService

Fecha: 2026-07-22

### Decision

Los folios usaran formato `INC-YYYYMMDD-0001` y se generaran con bloqueo.

### Motivo

El folio es legible para usuarios y permite orden temporal.

### Impacto

La creacion de incidentes debe pasar por una funcion atomica.

### Riesgos

Sin bloqueo pueden generarse duplicados en registros simultaneos.

### Control

Usar `LockService`, validar folio unico antes de insertar y registrar errores.

