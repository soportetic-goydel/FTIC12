# Guia General - F-TIC-12 Reporte de Incidencias y Fallas Tecnicas

## Objetivo
Portal web para que cualquier colaborador del grupo economico registre una incidencia TIC, reciba un numero de ticket y consulte su estado sin depender del formato fisico F-TIC-12. El reporte queda registrado en la matriz de control `MC-F-TIC-12`, con trazabilidad hasta su cierre por parte de TIC.

## Alcance
- **Fase 1.1 (iteracion actual):** portal publico con inicio, registro de incidente y consulta de estado. El intake corresponde a las secciones 1 y 2 del formato F-TIC-12 y crea un nuevo ticket en `MC-F-TIC-12` con `ESTADO_REGISTRO=Abierto`. La consulta publica usa `ID_REGISTRO + DNI`.
- **Fuera de alcance de Fase 1:** vista de atencion tecnica (seccion 3), generacion de PDF con `TAGS-F-TIC-12`, guardado del PDF en Drive con nomenclatura `FTIC12-VS##-...`, y script de creacion de subcarpetas NIVEL III (CECO) dentro de `RG-F-TIC-12`.

## Usuarios
| Rol | Como entra | Que ve |
|---|---|---|
| **Solicitante** | Enlace directo de la Web App | Inicio del portal, formulario de reporte y consulta de estado |
| **TIC** | Hoja `MC-F-TIC-12` / futura vista de atencion | Todos los tickets, para diagnostico y cierre |

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

## Salidas del sistema (Fase 1.1)
- Nuevo registro en `MC-F-TIC-12` por cada reporte.
- Confirmacion en pantalla con el `ID_REGISTRO` generado.
- Consulta publica del estado actual del ticket con datos controlados.
- Log de eventos (`LOG_EVENTOS`) y errores (`LOG_ERRORES`) dentro del mismo spreadsheet `MC-F-TIC-12`.

## Responsables
- Propietario tecnico: equipo TIC (`soportetic@goydelperu.com`).
- Fuente de personal y CECO: padron unico del grupo economico.

## Estado actual
- **v1.1.0 (Fase 1.1):** portal con inicio, formulario de intake, registro en `MC-F-TIC-12` y seguimiento publico por ticket + DNI.
- Pendiente: vista de atencion tecnica, generacion de PDF, estructura de carpetas Drive (NIVEL I/II/III), despliegue con `clasp` solo con confirmacion explicita y futura vista administrativa interna.
