# Guia Operativa y Gobierno - F-TIC-12 Reporte de Incidencias y Fallas Tecnicas

## Uso normal
- **Solicitante:** abre el portal, elige `Registrar un reporte` o `Consultar estado`, busca su DNI si va a registrar, completa su movil, selecciona empresa y centro de costo, completa los detalles de la incidencia y envia. Recibe en pantalla el numero de ticket (`ID_REGISTRO`).
- **TIC:** por ahora revisa y atiende los tickets directamente en la hoja `MC-F-TIC-12` (columna `ESTADO_REGISTRO`). La vista de atencion tecnica dedicada es una fase futura.

## Roles
- **Solicitante:** cualquier colaborador presente en el padron (`TDEMSRL`/`GOYDELSAC`), o cualquier persona que complete los datos manualmente si no aparece en el padron.
- **TIC:** equipo responsable del codigo, la hoja de control y el padron.

## Procedimiento operativo

### Puesta en marcha (setup tecnico)
1. Confirmar `CONFIG.SPREADSHEETS.MAIN` y `CONFIG.SPREADSHEETS.PADRON_PERSONAL`.
2. En el editor de Apps Script, configurar la Script Property `ANYDESK_CIPHER_SECRET`. Nunca commitear ese valor al repositorio.
3. Ejecutar `configurarProyecto()` para asegurar la existencia de `LOG_EVENTOS` y `LOG_ERRORES`.
4. Revisar el resultado de `validarEstructuraProyecto()` y confirmar `valido = true`.

### Ciclo de vida de un ticket (Fase 1)
`Abierto` (creado por el solicitante) -> fases futuras: `En Atencion` -> `Pendiente` / `Resuelto` -> `Cerrado`.

### Consulta publica
1. El solicitante abre el modulo `Consultar estado`.
2. Ingresa `ID_REGISTRO` y su DNI.
3. El backend valida la coincidencia.
4. El portal muestra el estado actual y refresca automaticamente mientras el ticket siga abierto.

## Manejo de errores
- Los mensajes al solicitante deben ser claros y no exponer detalle tecnico; el detalle queda en `LOG_ERRORES`.
- Errores de busqueda en el padron no bloquean el registro: se muestra advertencia y se permite completar manualmente.

## Soporte
- Revisar `LOG_ERRORES` ante incidencias del formulario.
- Verificar que el DNI del solicitante este correctamente registrado en `TDEMSRL` o `GOYDELSAC` si el autocompletado falla repetidamente.

## Reglas de mantenimiento
- No editar directamente en el editor web de Apps Script salvo emergencia documentada.
- No modificar encabezados de `MC-F-TIC-12` sin actualizar `DICC-F-TIC-12`, `CONFIG.HEADERS.REGISTROS` y esta documentacion.
- No crear hojas de padron o CECO locales: todo se consume de `[DB] PERSONAL GRUPO ECONOMICO`.
- Todo cambio de codigo, UI, configuracion, permisos o alcance actualiza `docs/` y `CHANGELOG.md`.

## Politica de logs
- Solo insercion; no editar ni borrar manualmente.
- `ANYDESK_PASSWORD` se guarda cifrado; su purga al cierre del ticket queda pendiente para la futura fase de atencion tecnica.

## Politica de cambios
- `clasp push` / `deploy` solo con confirmacion explicita.
- Cambios de alcance se acuerdan antes de tocar codigo, con respaldo en `DECISIONES.md`.

## Riesgos operativos
- Dependencia de que el padron unico (`TDEMSRL`/`GOYDELSAC`/`CECO`) se mantenga actualizado por su propietario.
- Contrasenas de AnyDesk cifradas con un esquema reversible simple: aceptable para soporte temporal interno, no para secretos de mayor criticidad.
- La vista administrativa del portal aun no reemplaza la gestion operativa en `MC-F-TIC-12`; esa parte sigue siendo manual hasta la fase siguiente.

## Continuidad operativa
- La hoja `MC-F-TIC-12`, el padron unico y el repositorio deben quedar bajo cuenta institucional.
