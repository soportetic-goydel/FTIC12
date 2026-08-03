# Guia General

## Nombre del sistema

Portal de Incidentes GAS.

## Objetivo

Permitir que usuarios internos o externos reporten incidentes desde una Web App de Google Apps Script, reciban un folio unico y puedan consultar el avance del caso hasta su cierre.

## Problema que resuelve

Centraliza la recepcion, trazabilidad y seguimiento de incidentes que normalmente llegan por canales dispersos como correo, llamadas, mensajes o formularios aislados. El sistema ordena cada caso, conserva evidencia, registra cambios de estado y permite gestion administrativa con control operativo.

## Alcance

Incluye:

- Registro publico o controlado de incidentes.
- Generacion automatica de folio.
- Adjuntos guardados en Google Drive.
- Base operativa en Google Sheets.
- Seguimiento por folio y correo.
- Panel administrativo para gestion de casos.
- Historial de estados y comentarios.
- Notificaciones por correo.
- Logs y auditoria.
- Actualizacion de seguimiento mediante polling.

No incluye en la primera version:

- WebSockets nativos en Apps Script.
- Chat en tiempo real persistente.
- Motor avanzado de SLA con horarios laborales complejos.
- Integracion obligatoria con sistemas externos.
- Aplicacion movil nativa.

## Usuarios

### Usuario reportante

Persona que registra un incidente y consulta su seguimiento.

Puede:

- Crear un reporte.
- Adjuntar evidencia.
- Recibir confirmacion por correo.
- Consultar estado con folio y correo.
- Ver historial publico.
- Agregar informacion adicional si el caso sigue abierto.

### Gestor

Persona responsable de atender y actualizar incidentes.

Puede:

- Ver incidentes asignados.
- Cambiar estados permitidos.
- Agregar comentarios publicos o internos.
- Solicitar informacion adicional.
- Marcar un caso como resuelto.

### Administrador

Responsable de operar el portal y configurar catalogos.

Puede:

- Ver todos los incidentes.
- Asignar responsables.
- Editar prioridad, categoria, estado y SLA.
- Administrar catalogos.
- Consultar logs.
- Reabrir o cerrar casos.

### Supervisor

Responsable de seguimiento gerencial.

Puede:

- Ver indicadores.
- Revisar casos vencidos.
- Auditar cambios.
- Exportar informacion.

## Modulos

### Inicio

Pantalla inicial con acceso directo a:

- Nuevo incidente.
- Consultar incidente.
- Ingreso administrativo.

### Registro de incidente

Formulario estructurado para capturar datos del reportante, ubicacion, categoria, prioridad sugerida, descripcion y adjuntos.

### Confirmacion

Vista posterior al registro que muestra el folio generado, fecha de creacion y enlace de seguimiento.

### Seguimiento publico

Vista donde el usuario consulta el estado del caso usando folio y correo. Muestra datos no sensibles, comentarios publicos y linea de tiempo visible.

### Panel administrativo

Vista de gestion para listar, filtrar, asignar, comentar y actualizar incidentes.

### Tablero de supervision

Vista de metricas operativas:

- Incidentes abiertos.
- Incidentes por estado.
- Incidentes por prioridad.
- Incidentes vencidos.
- Tiempo promedio de atencion.
- Volumen por categoria.

### Configuracion

Modulo para mantener catalogos y parametros operativos desde hojas de Google Sheets.

## Flujo general

1. El usuario abre la Web App.
2. Selecciona `Nuevo incidente`.
3. Completa el formulario y adjunta evidencia.
4. El frontend valida campos obligatorios.
5. El backend valida nuevamente, genera folio y guarda datos.
6. Los adjuntos se almacenan en Drive.
7. Se registra historial inicial.
8. Se envia correo de confirmacion.
9. El usuario recibe folio y enlace de seguimiento.
10. El gestor revisa el caso desde el panel administrativo.
11. El gestor cambia estado, asigna responsable o solicita informacion.
12. Cada cambio genera historial, auditoria y correo si es publico.
13. El usuario consulta el avance con folio y correo.
14. Cuando el incidente se resuelve, el gestor marca `Resuelto`.
15. El usuario puede confirmar cierre o el administrador puede cerrar luego de un periodo definido.

## Estados del incidente

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

## Fuentes de datos

- Google Sheets principal del proyecto.
- Google Drive para adjuntos.
- Usuario activo de Google, si el despliegue permite identificarlo.
- Catalogos definidos en hojas de configuracion.

## Salidas del sistema

- Folio unico.
- Confirmacion visual.
- Correo de creacion.
- Correos de cambio de estado.
- Historial publico para el reportante.
- Historial interno para administradores.
- Reportes filtrables en el panel.
- Logs de eventos, errores, correos y cambios.

## Responsables

- Propietario funcional: responsable del proceso de atencion de incidentes.
- Propietario tecnico: responsable del proyecto Apps Script, clasp y despliegues.
- Administrador operativo: responsable de usuarios, catalogos y supervision diaria.
- Gestores: responsables de la atencion de casos.

## Estado actual

Documento de especificacion inicial para construir el portal sobre la plantilla `PlantillaProjectGAS_UIUX_Vs01`.

