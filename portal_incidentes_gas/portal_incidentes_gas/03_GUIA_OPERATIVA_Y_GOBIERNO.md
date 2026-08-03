# Guia Operativa y Gobierno

## Uso normal

El portal opera con dos frentes principales:

- Reportantes que crean y consultan incidentes.
- Equipo interno que gestiona, actualiza y cierra casos.

El usuario final no necesita acceso directo a Google Sheets ni Google Drive. Toda interaccion debe pasar por la Web App.

## Roles

### Reportante

Registra y consulta sus propios incidentes usando folio y correo.

### Gestor

Atiende incidentes asignados y registra avances.

### Administrador

Gestiona todos los incidentes, usuarios, catalogos y configuracion operativa.

### Supervisor

Consulta indicadores, casos vencidos y trazabilidad.

## Responsabilidades

- Reportante: entregar informacion clara y evidencia suficiente.
- Gestor: actualizar estados y comentarios oportunamente.
- Administrador: mantener usuarios, catalogos y reglas.
- Supervisor: monitorear SLA, atrasos y calidad de atencion.
- Propietario tecnico: mantener codigo, despliegues y documentacion.

## Procedimiento operativo

### Creacion de incidente

1. El reportante completa el formulario.
2. El sistema genera folio.
3. El sistema envia correo de confirmacion.
4. El incidente queda en estado `Nuevo`.

### Toma de caso

1. El gestor o administrador revisa casos `Nuevo`.
2. Cambia estado a `Recibido` o `En revision`.
3. Asigna responsable si aplica.
4. Registra comentario interno o publico.

### Solicitud de informacion

1. El gestor cambia estado a `Pendiente de informacion`.
2. El comentario debe ser publico.
3. El sistema envia correo al reportante.
4. El reportante puede agregar informacion adicional.

### Resolucion

1. El gestor cambia estado a `Resuelto`.
2. Debe registrar resumen publico de solucion.
3. El sistema envia correo.
4. El caso puede cerrarse manualmente o por trigger tras N dias.

### Reapertura

1. Solo gestor, administrador o supervisor pueden reabrir.
2. Debe registrarse motivo.
3. El estado pasa a `Reabierto`.
4. Se reinicia seguimiento operativo.

## Soporte

Canales sugeridos:

- Correo de soporte configurado en `CONFIG.EMAIL.SUPPORT`.
- Responsable funcional del proceso.
- Responsable tecnico del Apps Script.

El soporte no debe editar Google Sheets manualmente salvo emergencia documentada.

## Mantenimiento

Actividades periodicas:

- Revisar logs de errores.
- Revisar correos fallidos.
- Revisar casos vencidos.
- Verificar espacio en Drive.
- Revisar cuotas de Apps Script.
- Archivar incidentes cerrados antiguos si el volumen crece.
- Validar encabezados de hojas.

## Logs

El sistema debe registrar:

- Creacion de incidentes.
- Cambios de estado.
- Asignaciones.
- Comentarios.
- Adjuntos.
- Envios de correo.
- Errores tecnicos.
- Cambios administrativos.

Los logs no deben contener datos sensibles innecesarios.

## Cambios

Todo cambio debe actualizar:

- `CHANGELOG.md`.
- `DECISIONES.md` si implica una decision relevante.
- `01_GUIA_GENERAL.md` si cambia alcance o flujo.
- `02_GUIA_TECNICA.md` si cambia codigo, hojas, scopes, CONFIG o arquitectura.
- `03_GUIA_OPERATIVA_Y_GOBIERNO.md` si cambia operacion, roles o soporte.

## Politica de datos

- No borrar incidentes de forma fisica.
- Usar estado o campo `active`.
- No exponer comentarios internos al reportante.
- No enviar datos sensibles en correos.
- No compartir carpetas Drive completas con usuarios externos salvo decision documentada.

## Politica de acceso

La validacion de roles debe ocurrir en backend.

El frontend puede ocultar controles para mejorar UX, pero no es una barrera de seguridad.

## Riesgos operativos

- Reportantes pierden folio.
- Usuarios escriben correo incorrecto.
- Gestores olvidan actualizar estado.
- Adjuntos contienen informacion sensible.
- Administradores editan encabezados de Sheets.
- Volumen alto degrada rendimiento.
- Correos caen en spam o fallan por cuotas.

## Continuidad operativa

En caso de falla de la Web App:

1. Revisar `LogErrores`.
2. Validar disponibilidad de Spreadsheet y Drive.
3. Revisar ultimo cambio en `CHANGELOG.md`.
4. Validar despliegue activo de Apps Script.
5. Si es critico, registrar incidentes manualmente en `Reports` respetando encabezados.
6. Documentar la emergencia y correccion posterior.

