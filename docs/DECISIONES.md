# Decisiones

## DEC-001 - Alcance por fases: Fase 1 = intake, sin PDF ni Drive
Fecha: 2026-07-17
### Decision
La primera iteracion solo construye el formulario del solicitante (secciones 1 y 2 del F-TIC-12) y el registro en `MC-F-TIC-12`. La vista tecnica (seccion 3), la generacion del PDF con `TAGS-F-TIC-12` y el guardado en Drive quedan para una fase posterior.
### Motivo
Reducir el primer entregable a algo verificable de punta a punta sin bloquear definiciones de negocio aun abiertas.
### Impacto
Los 16 campos de la seccion 3 y de trazabilidad documental quedan vacios en cada registro nuevo hasta implementar esa fase.

## DEC-002 - `MC-F-TIC-12`, `DICC-F-TIC-12` y `TAGS-F-TIC-12` se usan tal cual existen
Fecha: 2026-07-17
### Decision
Las 38 columnas de `MC-F-TIC-12` y sus reglas (`DICC-F-TIC-12`) se copian literalmente a `CONFIG.HEADERS.REGISTROS` y a los catalogos de `Constants.gs`. No se agrega, quita ni renombra ninguna columna sin aprobacion explicita.
### Motivo
Es un documento de control real. Alterarlo sin aprobacion rompe trazabilidad y viola la regla de no inventar columnas.

## DEC-003 - Padron unico sin pestana `METRIN`
Fecha: 2026-07-17
### Decision
`PadronService_buscarPorDni` solo busca en `TDEMSRL` y `GOYDELSAC`. `EMPRESA_DEL_GRUPO` sigue permitiendo `METRIN` como valor manual, pero sin validacion cruzada contra un padron porque esa pestana no existe.
### Motivo
No inventar una hoja de padron que no existe.
### Riesgos
Si un colaborador de `METRIN` reporta una incidencia, sus datos se cargan manualmente.

## DEC-004 - Centro de costo desde el catalogo `CECO`, no texto libre
Fecha: 2026-07-17
### Decision
El campo `CENTRO_DE_COSTO` del formulario es un selector poblado por `PadronService_listarCecoActivos(empresa)`, filtrado por `ESTADO = ACTIVO` y por una comparacion normalizada entre la empresa seleccionada y `RAZON SOCIAL` (por ejemplo `GOYDEL` = `GOYDEL SAC` = `GOYDELSAC`).
### Motivo
No crear catalogos paralelos cuando ya existe uno oficial.

## DEC-005 - Cifrado reversible simple para `ANYDESK_PASSWORD`
Fecha: 2026-07-17
### Decision
`ANYDESK_PASSWORD` se cifra con XOR + Base64 usando un secreto guardado en Script Properties (`CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY`), nunca en el codigo fuente.
### Motivo
El diccionario exige texto cifrado y reversible, y Apps Script no trae de forma nativa una libreria fuerte lista para este caso.
### Riesgos
No es criptografia fuerte. La mitigacion es secreto fuera del codigo, acceso restringido y futura purga al cierre del ticket.

## DEC-006 - `.clasp.json` vinculado a proyecto Apps Script existente
Fecha: 2026-07-17
### Decision
El `scriptId` proporcionado por el usuario se valido antes de escribir y el `clasp push --force` se realizo solo con confirmacion explicita.
### Motivo
No ejecutar cambios remotos sin autorizacion explicita del usuario.
### Impacto
El codigo ya esta en el editor de Apps Script, pero la Web App aun no esta publicada con `clasp deploy`.

## DEC-007 - Nomenclatura de subcarpetas NIVEL III (CECO) - pendiente
Fecha: 2026-07-17
### Decision
Pendiente de confirmar. Se sabe que el alcance es todos los CECO `ACTIVO` de GOYDEL SAC, pero el formato exacto del nombre de carpeta aun no esta resuelto.
### Motivo
Evitar hardcodear un patron no confirmado para recursos de Drive.

## DEC-008 - El intake de Fase 1 sigue la matriz real: `MOVIL_SOLICITANTE` y no `AREA_SOLICITANTE`
Fecha: 2026-07-24
### Decision
El formulario publico y la persistencia de Fase 1 se alinean a la matriz real `MC-F-TIC-12`, al diccionario `DICC-F-TIC-12` y al formato `F-TIC-12`: el dato obligatorio del solicitante es `MOVIL_SOLICITANTE` y no existe una columna `AREA_SOLICITANTE` en la hoja real.
### Motivo
Se verifico directamente la hoja `MC-F-TIC-12` y el formato de referencia. Mantener un campo `area` en codigo rompia la regla de no inventar columnas.
### Impacto
La busqueda por DNI sigue autocompletando nombre, cargo y proyecto/sede desde el padron, pero el movil se completa manualmente por el solicitante y se valida como obligatorio de 9 digitos.

## DEC-009 - El seguimiento publico del portal usa `ID_REGISTRO + DNI`
Fecha: 2026-07-24
### Decision
La consulta publica del portal F-TIC-12 valida el seguimiento con `ID_REGISTRO + DNI` del solicitante, no con correo.
### Motivo
La matriz real `MC-F-TIC-12` no almacena correo del solicitante. Usar `ID_REGISTRO + DNI` permite una consulta coherente con los datos reales del proceso sin inventar nuevas columnas.
### Impacto
El portal ya puede exponer estado actual y datos controlados del ticket, pero la futura fase administrativa seguira construyendose sobre la misma matriz real.
