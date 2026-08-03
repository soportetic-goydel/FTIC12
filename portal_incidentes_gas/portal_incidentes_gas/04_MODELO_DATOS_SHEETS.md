# Modelo de Datos en Google Sheets

## Principios

- Google Sheets funciona como base operativa liviana.
- Cada hoja debe tener encabezados estables.
- El codigo debe leer columnas por nombre de encabezado.
- Los IDs, nombres de hojas y encabezados viven en `CONFIG`.
- Los registros criticos no se borran fisicamente.
- Toda escritura critica debe registrar log o auditoria.

## Hoja Reports

Registro principal de incidentes.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| reportId | string | Si | UUID tecnico interno. |
| folio | string | Si | Folio visible, formato `INC-YYYYMMDD-0001`. |
| createdAt | datetime | Si | Fecha de creacion. |
| updatedAt | datetime | Si | Ultima actualizacion. |
| requesterName | string | Si | Nombre del reportante. |
| requesterEmail | email | Si | Correo usado para seguimiento. |
| requesterPhone | string | No | Telefono opcional. |
| area | string | No | Area solicitante. |
| location | string | No | Sede, oficina o ubicacion. |
| category | string | Si | Categoria del incidente. |
| subcategory | string | No | Subcategoria. |
| priority | string | Si | Baja, Media, Alta, Critica. |
| status | string | Si | Estado actual. |
| assignedTo | email | No | Gestor responsable. |
| description | string | Si | Descripcion detallada. |
| publicSummary | string | No | Resumen visible al usuario. |
| dueDate | datetime | No | Fecha objetivo segun SLA. |
| closedAt | datetime | No | Fecha de cierre. |
| attachmentFolderId | string | No | ID carpeta Drive del folio. |
| attachmentFolderUrl | url | No | URL carpeta Drive del folio. |
| lastPublicUpdate | datetime | No | Ultima actualizacion visible. |
| source | string | Si | Origen: WebApp, Admin, Import. |
| active | boolean | Si | Control logico de actividad. |

## Hoja StatusHistory

Historial de cambios de estado.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| historyId | string | Si | UUID tecnico. |
| folio | string | Si | Folio asociado. |
| previousStatus | string | No | Estado anterior. |
| newStatus | string | Si | Estado nuevo. |
| changedBy | email | Si | Actor del cambio. |
| changedAt | datetime | Si | Fecha del cambio. |
| comment | string | No | Comentario asociado. |
| visibility | string | Si | Publica o Interna. |

## Hoja Comments

Comentarios del caso.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| commentId | string | Si | UUID tecnico. |
| folio | string | Si | Folio asociado. |
| authorName | string | Si | Nombre del autor. |
| authorEmail | email | Si | Correo del autor. |
| createdAt | datetime | Si | Fecha de comentario. |
| comment | string | Si | Texto del comentario. |
| visibility | string | Si | Publica o Interna. |
| attachmentUrls | string | No | URLs separadas por salto de linea o JSON. |

## Hoja Attachments

Metadata de archivos adjuntos.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| attachmentId | string | Si | UUID tecnico. |
| folio | string | Si | Folio asociado. |
| fileName | string | Si | Nombre original o normalizado. |
| mimeType | string | Si | Tipo MIME. |
| driveFileId | string | Si | ID de archivo Drive. |
| driveUrl | url | Si | URL del archivo. |
| uploadedBy | email | Si | Usuario que adjunta. |
| uploadedAt | datetime | Si | Fecha de carga. |
| visibility | string | Si | Publica o Interna. |

## Hoja Users

Usuarios internos y roles.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| email | email | Si | Correo unico. |
| name | string | Si | Nombre. |
| role | string | Si | Admin, Supervisor, Gestor. |
| area | string | No | Area o equipo. |
| active | boolean | Si | Acceso activo. |

## Hoja Catalogs

Catalogos simples para UI y validacion.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| catalogType | string | Si | Tipo: Category, Subcategory, Priority, Status. |
| code | string | Si | Codigo estable. |
| label | string | Si | Texto visible. |
| parentCode | string | No | Relacion con otro catalogo. |
| sortOrder | number | No | Orden visual. |
| active | boolean | Si | Disponible en UI. |

## Hoja SlaRules

Reglas basicas de SLA.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| ruleId | string | Si | ID de regla. |
| category | string | No | Categoria aplicable. |
| priority | string | Si | Prioridad aplicable. |
| targetHours | number | Si | Horas objetivo. |
| active | boolean | Si | Regla activa. |

## Hoja LogEventos

Eventos funcionales.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| eventId | string | Si | UUID. |
| timestamp | datetime | Si | Fecha. |
| actorEmail | email | No | Actor. |
| eventType | string | Si | Tipo de evento. |
| entityType | string | Si | Entidad. |
| entityId | string | No | ID o folio. |
| message | string | No | Resumen. |
| metadataJson | json | No | Metadata controlada. |

## Hoja LogErrores

Errores tecnicos.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| errorId | string | Si | UUID. |
| timestamp | datetime | Si | Fecha. |
| actorEmail | email | No | Actor si existe. |
| functionName | string | Si | Funcion donde ocurrio. |
| safeMessage | string | Si | Mensaje seguro. |
| technicalMessage | string | No | Mensaje tecnico resumido. |
| stack | string | No | Stack controlado. |
| payloadJson | json | No | Payload sanitizado. |

## Hoja LogCorreos

Correos enviados o fallidos.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| mailLogId | string | Si | UUID. |
| timestamp | datetime | Si | Fecha. |
| to | email | Si | Destinatario. |
| subject | string | Si | Asunto. |
| templateName | string | Si | Plantilla usada. |
| entityId | string | No | Folio o ID. |
| status | string | Si | Sent o Error. |
| errorMessage | string | No | Error si aplica. |

## Hoja AuditLog

Auditoria de cambios criticos.

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| auditId | string | Si | UUID. |
| timestamp | datetime | Si | Fecha. |
| actorEmail | email | Si | Actor. |
| action | string | Si | Accion. |
| entityType | string | Si | Entidad. |
| entityId | string | Si | Folio o ID. |
| beforeJson | json | No | Estado anterior. |
| afterJson | json | No | Estado posterior. |

## Catalogos iniciales

### Prioridades

- Baja.
- Media.
- Alta.
- Critica.

### Visibilidad

- Publica.
- Interna.

### Estados

- Nuevo.
- Recibido.
- En revision.
- Asignado.
- En proceso.
- Pendiente de informacion.
- Resuelto.
- Cerrado.
- Reabierto.
- Cancelado.

## Transiciones permitidas

| Estado actual | Estados permitidos |
|---|---|
| Nuevo | Recibido, En revision, Cancelado |
| Recibido | Asignado, En revision, Cancelado |
| En revision | Asignado, En proceso, Pendiente de informacion, Cancelado |
| Asignado | En proceso, Pendiente de informacion, Cancelado |
| En proceso | Pendiente de informacion, Resuelto, Cancelado |
| Pendiente de informacion | En revision, En proceso, Cancelado |
| Resuelto | Cerrado, Reabierto |
| Cerrado | Reabierto |
| Reabierto | En revision, Asignado, En proceso |
| Cancelado | Reabierto |

## Folio

Formato recomendado:

```text
INC-YYYYMMDD-0001
```

Reglas:

- El correlativo reinicia por dia.
- La generacion debe usar `LockService`.
- El folio es visible para usuarios.
- `reportId` sigue siendo el ID tecnico interno.

