# Guia General - F-TIC-12 Reporte de Incidencias y Fallas Tecnicas

## Objetivo
Portal web para que cualquier colaborador del grupo economico registre una incidencia TIC, reciba un numero de ticket y consulte su estado sin depender del formato fisico F-TIC-12. El reporte queda registrado en la matriz de control `MC-F-TIC-12`, con trazabilidad hasta su cierre por parte de TIC.

## Alcance
- **Fase 1.2 (iteracion actual):** portal publico con inicio, registro de incidente, consulta de estado y gestion TIC. El intake crea un nuevo ticket en `MC-F-TIC-12`, la gestion tecnica completa la seccion 3 y, al cierre, genera el PDF F-TIC-12 directamente desde una plantilla HTML guardandolo en Drive.
- **Fuera de alcance actual:** script de creacion de subcarpetas NIVEL III (CECO) dentro de `RG-F-TIC-12`, nomenclatura final `FTIC12-VS##-...` para carpetas/documentos complementarios y automatizaciones documentales adicionales (`F-TIC-10`, `F-TIC-05`, evidencias).

## Usuarios
| Rol | Como entra | Que ve |
|---|---|---|
| **Solicitante** | Enlace directo de la Web App | Inicio del portal, formulario de reporte y consulta de estado |
| **TIC** | Vista administrativa del portal / Hoja `MC-F-TIC-12` | Todos los tickets, para diagnostico, cierre y PDF |

## Modulos
- **portal** - inicio del sistema con accesos a nuevo incidente, consulta publica y orientacion para gestion TIC.
- **reporte** - formulario de intake: busqueda de personal por DNI contra el padron unico, seleccion de centro de costo (CECO) desde el catalogo oficial, y creacion del ticket.
- **seguimiento** - consulta publica de estado del ticket por `ID_REGISTRO + DNI`, con refresco automatico mientras el caso siga abierto.
- **setup** - `configurarProyecto()` / `validarEstructuraProyecto()`.

## Flujo general (Fase 1)
1. El solicitante abre el formulario y, al completar los 8 digitos del DNI, se consulta automaticamente el padron; el boton `Buscar` se mantiene como respaldo manual. Si el DNI esta en el padron, se autocompletan nombre, cargo y proyecto/sede.
2. Completa manualmente su movil, tal como lo exige el formato F-TIC-12 y la columna `MOVIL_SOLICITANTE` de `MC-F-TIC-12`.
3. Selecciona su empresa del grupo y, en funcion de ella, su centro de costo (CECO), tomado del catalogo oficial del padron.
4. Completa los detalles de la incidencia: tipo de equipo, activo afectado, tipo de problema, prioridad, descripcion y, si aplica, acceso remoto AnyDesk.
5. Al enviar, el backend valida todo de nuevo, genera el `ID_REGISTRO` (`REG-F-TIC-12-AAAA-NNNNN`) e inserta la fila en `MC-F-TIC-12` con `ESTADO_REGISTRO=Abierto`.
6. El solicitante ve el numero de ticket generado.

## Fuentes de datos
- `MC-F-TIC-12` (spreadsheet de control real, con pestañas `MC-F-TIC-12`, `LOG_EVENTOS`, `LOG_ERRORES`, `DICC-F-TIC-12`, `TAGS-F-TIC-12`) - ver `02_GUIA_TECNICA.md`.
- `[DB] PERSONAL GRUPO ECONOMICO` (padron unico) - pestañas `TDEMSRL`, `GOYDELSAC` (personal) y `CECO` (catalogo de centros de costo por razon social).
- No se crea ningun padron ni catalogo local: todo se consume del padron unico.

## Salidas del sistema (Fase 1.2)
- Nuevo registro en `MC-F-TIC-12` por cada reporte.
- Confirmacion en pantalla con el `ID_REGISTRO` generado.
- Consulta publica del estado actual del ticket con datos controlados.
- PDF F-TIC-12 generado desde HTML al cierre del ticket y enlazado en `LINK_PDF_REPORTE`.
- Log de eventos (`LOG_EVENTOS`) y errores (`LOG_ERRORES`) dentro del mismo spreadsheet `MC-F-TIC-12`.

## Responsables
- Propietario tecnico: equipo TIC (`soportetic@goydelperu.com`).
- Fuente de personal y CECO: padron unico del grupo economico.

## Estado actual
- **v1.2.0 (Fase 1.2):** portal con intake, seguimiento publico, gestion TIC y generacion PDF F-TIC-12 desde HTML.
- Pendiente: estructura de carpetas Drive (NIVEL I/II/III), nomenclatura documental final y automatizaciones complementarias ligadas a bitacora/inventario.
