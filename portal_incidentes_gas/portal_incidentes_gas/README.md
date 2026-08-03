# Portal de Incidentes GAS

Documentacion viva para migrar y construir un portal de incidentes en Google Apps Script usando la plantilla `PlantillaProjectGAS_UIUX_Vs01`.

## Proposito

Esta carpeta concentra la especificacion funcional, tecnica y operativa del portal donde un usuario registra un incidente, recibe un folio y consulta el seguimiento del caso.

## Archivos

- `01_GUIA_GENERAL.md`: objetivo, alcance, usuarios, modulos y flujo general.
- `02_GUIA_TECNICA.md`: arquitectura GAS, estructura local, servicios, funciones, scopes y riesgos.
- `03_GUIA_OPERATIVA_Y_GOBIERNO.md`: roles, procedimientos, soporte, mantenimiento y continuidad.
- `04_MODELO_DATOS_SHEETS.md`: hojas, columnas, catalogos, validaciones y relaciones.
- `05_PROMPT_IMPLEMENTACION_APPS_SCRIPT.md`: prompt maestro para generar el proyecto completo en Apps Script.
- `CHECKLIST_GREENFIELD_PORTAL_INCIDENTES.md`: checklist de implementacion, seguridad, UI, datos y despliegue.
- `CHANGELOG.md`: bitacora de cambios.
- `DECISIONES.md`: decisiones tecnicas y de producto.

## Regla central

El portal debe mantener `CONFIG` como fuente de verdad, separar backend y frontend, usar `google.script.run`, registrar logs y mantener actualizada esta carpeta cuando cambien flujos, datos, permisos, correos, UI o despliegue.

