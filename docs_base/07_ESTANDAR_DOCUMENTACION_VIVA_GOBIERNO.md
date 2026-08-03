# 07_ESTANDAR_DOCUMENTACION_VIVA_GOBIERNO

## 1. Propósito

Este estándar define la documentación viva mínima de cada proyecto greenfield.

La documentación viva es obligatoria porque permite que otra persona o una IA retome el proyecto sin romper arquitectura, datos, permisos ni despliegue.

---

## 2. Carpeta docs obligatoria

Cada proyecto debe tener:

```text
docs/
  01_GUIA_GENERAL.md
  02_GUIA_TECNICA.md
  03_GUIA_OPERATIVA_Y_GOBIERNO.md
  CHANGELOG.md
  DECISIONES.md
```

---

## 3. 01_GUIA_GENERAL.md

Debe contener:

- Nombre del sistema.
- Objetivo.
- Alcance.
- Usuarios.
- Módulos.
- Flujo general.
- Hojas principales.
- Responsables.
- Estado actual.
- Qué problema resuelve.

Estructura sugerida:

```markdown
# Guía General

## Objetivo
## Alcance
## Usuarios
## Módulos
## Flujo general
## Fuentes de datos
## Salidas del sistema
## Responsables
## Estado actual
```

---

## 4. 02_GUIA_TECNICA.md

Debe contener:

- Arquitectura.
- Estructura de carpetas.
- Archivos principales.
- Configuración.
- Hojas y encabezados.
- Servicios.
- Funciones públicas.
- Funciones internas.
- Scopes.
- Triggers.
- Despliegue clasp.
- Riesgos técnicos.
- Dependencias.

Estructura sugerida:

```markdown
# Guía Técnica

## Arquitectura
## Estructura local
## CONFIG
## Google Sheets
## Servicios GAS
## HtmlService
## Funciones públicas
## Scopes
## Triggers
## clasp
## Validaciones
## Riesgos técnicos
```

---

## 5. 03_GUIA_OPERATIVA_Y_GOBIERNO.md

Debe contener:

- Uso normal.
- Roles.
- Responsabilidades.
- Procedimiento operativo.
- Manejo de errores.
- Soporte.
- Reglas de mantenimiento.
- Política de logs.
- Política de cambios.
- Riesgos operativos.

Estructura sugerida:

```markdown
# Guía Operativa y Gobierno

## Uso normal
## Roles
## Responsabilidades
## Soporte
## Mantenimiento
## Logs
## Cambios
## Riesgos
## Continuidad operativa
```

---

## 6. CHANGELOG.md

Debe registrar cambios cronológicos.

Formato:

```markdown
# Changelog

## 2026-06-09
### Agregado
- Se creó estructura base del proyecto.

### Cambiado
- Se actualizó CONFIG.

### Corregido
- Se corrigió validación de DNI.

### Riesgos
- Pendiente validar scopes en producción.
```

Reglas:

- Todo cambio de código debe registrarse.
- Todo cambio de UI debe registrarse.
- Todo cambio de configuración debe registrarse.
- Todo cambio de Sheets debe registrarse.
- Todo cambio de permisos debe registrarse.

---

## 7. DECISIONES.md

Debe registrar decisiones técnicas y de diseño.

Formato:

```markdown
# Decisiones

## DEC-001 — Uso de padrón único
Fecha: 2026-06-09

### Decisión
Se usará el padrón único del grupo económico.

### Motivo
Evitar duplicidad de padrones por proyecto.

### Impacto
Todos los formularios validarán personal desde `PadronService.gs`.

### Riesgos
Si el padrón cambia encabezados, los proyectos dependientes pueden fallar.

### Control
Validación de estructura y documentación.
```

---

## 8. Qué obliga a actualizar docs

Actualizar documentación si cambia:

- Código.
- UI.
- Flujo operativo.
- Google Sheets.
- Encabezados.
- Configuración.
- Scopes.
- Triggers.
- Permisos.
- Correos.
- Plantillas.
- Auth.
- Logs.
- Despliegue.
- Dependencias.
- Rutas Drive.
- Decisiones técnicas.

---

## 9. docs_base vs docs

### docs_base

Contiene el estándar reusable.

No debe usarse como bitácora del proyecto.

### docs

Contiene la documentación específica del proyecto.

Debe actualizarse en cada iteración.

---

## 10. Rewind obligatorio

Antes de modificar un proyecto existente, la IA debe leer:

1. `docs_base/`
2. `docs/`
3. `appsscript.json`
4. `.clasp.json`
5. `.claspignore`
6. `src/config/Config.gs`
7. Estructura de `src/`

Luego debe responder:

```text
- Objetivo del sistema
- Estructura local
- Módulos existentes
- Flujo VSCode -> clasp -> Apps Script
- Configuración crítica
- Permisos/scopes
- Riesgos actuales
- Pendientes
- Reglas que no debo romper
```

---

## 11. Regla para IA/Codex

La IA no debe modificar archivos antes de explicar:

- Tipo de cambio.
- Archivos afectados.
- Riesgos.
- Plan corto.
- Validaciones que realizará.

Si el usuario ya dio objetivo claro, la IA puede avanzar, pero debe mantener trazabilidad.
