# Resumen de sesión — F-TIC-12 (para continuar en otra computadora)

Este archivo no es parte del estándar `docs_base` (01-04 + CHANGELOG + DECISIONES). Es un **volcado de la sesión local** (historial de chat solo existe en esta PC, el repositorio no es un `git`), para que el trabajo se pueda retomar desde cualquier equipo leyendo únicamente los archivos del proyecto. Los documentos con la verdad "viva" y estructurada siguen siendo `docs/01-04`, `CHANGELOG.md` y `DECISIONES.md`; este archivo es un puente narrativo hacia ellos.

Fecha de corte: 2026-07-17.

---

## 1. Qué es este proyecto

Formulario web (Google Apps Script + HtmlService) para que cualquier colaborador del grupo económico reporte incidencias/fallas técnicas (formato **F-TIC-12**), sin usar el formato físico. Cada envío crea un ticket en la hoja de control **`MC-F-TIC-12`**. En fases futuras (no construidas aún) se generará un PDF con las `TAGS-F-TIC-12` y se guardará en Drive con una estructura de carpetas por CECO.

El repositorio **no es un `git`** (`git init` no se ejecutó) y **no está sincronizado en la nube** salvo que el usuario lo copie manualmente o use algún sync de carpetas. Si se abre en otra PC, hay que copiar la carpeta completa `GAS_FTIC12/`.

## 2. Documentación a leer, en orden

1. `docs_base/00_ESTANDAR_TRABAJO_LOCAL_GAS_CLASP.md` — estándar de trabajo (reglas obligatorias del flujo VSCode → clasp → Apps Script).
2. `docs/01_GUIA_GENERAL.md` — objetivo, alcance por fases, usuarios, flujo.
3. `docs/02_GUIA_TECNICA.md` — arquitectura real, `CONFIG`, hojas, servicios, scopes.
4. `docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md` — puesta en marcha, roles, mantenimiento.
5. `docs/04_GUIA_DISENO_UI.md` — colores, layout, componentes.
6. `docs/CHANGELOG.md` — histórico de cambios.
7. `docs/DECISIONES.md` — decisiones tomadas y su motivo (**incluye una decisión abierta, ver §6**).

## 3. IDs y recursos reales de Google (ya confirmados, no inventar otros)

| Recurso | ID / nombre |
|---|---|
| Hoja de control `MC-F-TIC-12` (spreadsheet) | `1oruTWcOGtNptt9AmlSZDgaOROFdG8fhrQxk13SuA554` — pestañas `MC-F-TIC-12`, `DICC-F-TIC-12`, `TAGS-F-TIC-12` |
| Padrón único `[DB] PERSONAL GRUPO ECONÓMICO` | `123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc` — pestañas reales: `TDEMSRL`, `GOYDELSAC`, `CECO` (sin `METRIN`) |
| Formato imprimible `F-TIC-12` (referencia visual, no se edita) | `1jQGHmNFImUm81o8ICetauSrWVeVQdmWVGf2gmGbMMyo` |
| Carpeta Drive NIVEL I `REGISTROS_UNITARIZADOS` | `17ERnBJx2WaptCMg09jPKFF-HER9XFw1K` (fase futura) |
| Carpeta Drive NIVEL II `RG-F-TIC-12 ... VS01` (destino de los PDF) | `1OKA6cL1otH5v68CNOg1ivQyEa4otxyjR` — **vacía**, sin subcarpetas NIVEL III todavía (fase futura) |
| Proyecto Apps Script (scriptId, en `.clasp.json`) | `1Eq_c7Yve8DlBnXhQtv4p8fq1U44EEzGRYEbKGpOwpONl2_9lhynpGhvP` |

Todos estos IDs ya están centralizados en `src/config/Config.gs` (`CONFIG.SPREADSHEETS`, `CONFIG.DRIVE`, `CONFIG.PADRON`). **No deben repetirse hardcodeados en ningún otro archivo.**

## 4. Qué se construyó (Fase 1 — completa y ya desplegada al editor)

Arquitectura modular greenfield completa en `src/`:

```
appsscript.json, .claspignore, .clasp.json, Index.html
src/config/        Config.gs, Constants.gs
src/core/          WebApp.gs, HtmlIncludes.gs, ResponseService.gs, Utils.gs
src/services/      SheetsService.gs, PadronService.gs, LogService.gs
src/modules/reporte/  ReporteService.gs, ReporteDataService.gs, ReporteMapper.gs,
                      ReporteValidator.gs, ReporteView.html, ReporteClient.html, ReporteStyles.html
src/ui/            GlobalStyles.html, GlobalClient.html
src/setup/         Setup.gs
```

Funcionalidad: formulario con Secciones 1 y 2 del F-TIC-12 (datos del solicitante + detalles de la incidencia), búsqueda de DNI contra el padrón, selector de Centro de Costo poblado desde el catálogo `CECO` real, validación server-side completa, generación de `ID_REGISTRO` (`REG-F-TIC-12-AAAA-NNNNN`) e inserción en `MC-F-TIC-12` con `ESTADO_REGISTRO=Abierto`. `ANYDESK_PASSWORD` se cifra (reversible, XOR+Base64) con secreto en Script Properties.

Detalle completo de servicios, funciones públicas y scopes: `docs/02_GUIA_TECNICA.md`.

## 5. Estado del despliegue (importante, no repetir pasos)

- `.clasp.json` ya creado con el `scriptId` de un proyecto Apps Script que el usuario ya tenía creado (confirmado vacío antes de tocarlo, vía `clasp deployments`).
- **`clasp push --force` ya se ejecutó con éxito** (21 archivos) — el código YA está en el editor de Apps Script.
- **`clasp deploy` (publicar como Web App) NO se ha hecho todavía.** No hay URL pública funcionando aún.
- El proyecto ya tenía 1 implementación (`@HEAD`) desde antes de esta sesión — es la implementación automática que Apps Script crea por defecto, no algo que haya creado esta sesión.

### Para continuar en otra PC
1. Copiar la carpeta completa del proyecto.
2. Instalar clasp si no está: `npm install -g @google/clasp` (esta sesión usó clasp `3.3.0`).
3. `clasp login` — **la autenticación (`.clasprc.json`) es local y personal, nunca se sube al repo**; hay que volver a iniciar sesión en cada PC nueva.
4. `clasp status` para confirmar qué se subiría (debe listar los mismos 21 archivos de `src/` + `Index.html` + `appsscript.json`).
5. No volver a hacer `clasp push`/`deploy` salvo que haya cambios o se necesite explícitamente — ya está subido.

## 6. Pendiente antes de poder usar el formulario en producción

1. **Configurar la Script Property `ANYDESK_CIPHER_SECRET`** en el editor de Apps Script (Configuración del proyecto → Propiedades de secuencia de comandos). Sin esto, cualquier reporte que incluya password de AnyDesk fallará al guardarse (`Utils_cifrarTexto_` lanza error si no existe).
2. **Ejecutar `configurarProyecto()`** desde el editor de Apps Script (crea `LOG_EVENTOS`/`LOG_ERRORES` en `MC-F-TIC-12`, idempotente) y revisar que `validarEstructuraProyecto()` devuelva `valido: true`.
3. **Confirmar con el usuario** antes de `clasp deploy` (primera publicación como Web App) — regla del proyecto, no hacerlo sin autorización explícita.

## 7. Decisión abierta (no resuelta, no inventar la respuesta)

**DEC-007 en `DECISIONES.md`:** el formato exacto de nombre de las subcarpetas NIVEL III (una por cada CECO `ACTIVO` de GOYDEL SAC, dentro de `RG-F-TIC-12`) quedó sin confirmar. Se sabe:
- Alcance: todos los CECO con `RAZON SOCIAL='GOYDEL' AND ESTADO='ACTIVO'` del catálogo `CECO` del padrón (no un número fijo de 13).
- El catálogo real usa el formato `(0102) GOYDEL LIMA LOGISTICA` (con paréntesis y código de 4 dígitos).
- Se había visto una carpeta `TEMPORAL` en Drive con subcarpetas de prueba tipo `CECO-502 VRF JAEN` (formato distinto, creadas el mismo día por alguien, sin confirmar si son de referencia o descartables).
- **No usar ninguno de los dos formatos sin volver a preguntar al usuario** — la respuesta que se recibió en su momento correspondió por error a la nomenclatura del PDF, no a la de la carpeta.

Esto solo bloquea la **Fase 2** (generación de PDF + estructura de carpetas), no la Fase 1 ya entregada.

## 8. Reglas que no se deben romper (recordatorio, están completas en `docs_base/00`)

- `CONFIG` es la única fuente de verdad para IDs, hojas, encabezados, colores.
- No hardcodear reglas de negocio fuera de `CONFIG`/`Constants.gs`.
- No modificar encabezados de `MC-F-TIC-12` sin actualizar `DICC-F-TIC-12` y `docs/02_GUIA_TECNICA.md`.
- No crear catálogos de padrón/CECO locales — todo se consume de `[DB] PERSONAL GRUPO ECONÓMICO`.
- `google.script.run` para frontend-backend; `include()` para no tener un `Index.html` monolítico.
- Funciones internas terminan en `_`; funciones públicas devuelven `{ ok, result, message }`.
- No `clasp push`/`deploy`/`redeploy` sin confirmación explícita del usuario.
- Cualquier cambio de UI, lógica, configuración, permisos o alcance actualiza `docs/` y `CHANGELOG.md`.
