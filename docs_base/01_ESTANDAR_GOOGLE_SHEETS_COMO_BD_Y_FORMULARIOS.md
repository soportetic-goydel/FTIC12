# 01_ESTANDAR_GOOGLE_SHEETS_COMO_BD_Y_FORMULARIOS

## 1. Propósito

Este estándar define cómo deben estructurarse las hojas de Google Sheets utilizadas como base de datos operativa para proyectos desarrollados con Google Apps Script, HtmlService, VSCode, clasp y asistencia de IA.

Aplica para:

- Formularios web.
- Cuestionarios.
- Capacitaciones.
- Matrices de control.
- Inventarios.
- Registros operativos.
- Procesos con catálogos.
- Procesos con logs.
- Procesos con generación documental.
- Procesos con envío de correos.
- Sistemas con Auth Login.

Google Sheets puede funcionar como base de datos liviana, pero debe tratarse con disciplina: estructura estable, encabezados controlados, logs obligatorios y separación clara entre datos, catálogos, configuración y auditoría.

---

## 2. Modelos de referencia

Este estándar se basa en tres tipos de estructuras:

### 2.1. Modelo cuestionarios

Hojas de referencia:

```text
CONFIG_EXAMENES
BANCO_GLOBAL
PADRON
LOG_RESULTADOS
```

Uso:

- Configurar exámenes.
- Mantener banco de preguntas.
- Validar participantes.
- Registrar resultados.

### 2.2. Modelo formulario/capacitaciones

Hojas de referencia:

```text
PROGRAMAS
CONFIG
REGISTRO DE PARTICIPANTES
HABILITADOS
MODAL
```

Uso:

- Configurar programas.
- Configurar sesiones.
- Registrar participantes.
- Controlar habilitados.
- Mostrar recursos visuales o modales.

### 2.3. Modelo matriz de control

Hojas de referencia:

```text
MC-F-TIC-05
DICC-F-TIC-05
TAGS-F-TIC-05
LOG_IMPORTACIONES
```

Uso:

- Sábana íntegra de datos.
- Diccionario de campos.
- Etiquetas para plantillas.
- Log de cambios, importaciones y generación documental.

---

## 3. Principios obligatorios

### 3.1. CONFIG como fuente de verdad

Todo ID, hoja, encabezado, carpeta, plantilla, regla, color, logo o correo debe estar en `CONFIG`.

No se permite hardcodear:

- IDs de Google Sheets.
- IDs de Drive.
- Nombres de hojas.
- Nombres de columnas.
- Correos responsables.
- Estados.
- Roles.
- Plazos.
- Textos críticos de correo.
- URLs de logos.

### 3.2. Lectura por encabezado

El código debe leer columnas por nombre de encabezado, no por posición fija.

Permitido:

```javascript
const headers = getHeaderMap_(sheet);
const dni = row[headers.DNI];
const programa = row[headers.ID_PROGRAMA];
```

No recomendado:

```javascript
const dni = row[0];
const programa = row[12];
```

### 3.3. No borrar registros críticos

No se deben borrar registros principales salvo limpieza técnica documentada.

Usar baja lógica:

```text
ESTADO_REGISTRO
FECHA_ELIMINACION
USUARIO_ELIMINACION
MOTIVO_ELIMINACION
```

### 3.4. Logs obligatorios

Todo flujo relevante debe registrar log:

- Creación.
- Actualización.
- Baja.
- Envío de correos.
- Importación.
- Generación documental.
- Errores.
- Cambios de estado.
- Accesos, cuando aplique Auth.

---

## 4. Padrón único de personal del grupo económico

Todo proyecto greenfield debe consumir como fuente oficial el padrón único de personal del grupo económico.

### 4.1. Fuente oficial

```javascript
const CONFIG = {
  SPREADSHEETS: {
    PADRON_PERSONAL: '123J9FsE1yJNK-YYRkwI94a9ZwurjV2Rmpyxo2xnDmqc'
  }
};
```

Nombre referencial:

```text
[DB] PERSONAL GRUPO ECONÓMICO
```

### 4.2. Hojas oficiales

```text
TDEMSRL
GOYDELSAC
CECO
```

### 4.3. Estructura base de personal

Las hojas de empresa deben mantener como mínimo:

```text
DNI
APELLIDOS Y NOMBRES
CARGO
PROYECTO
```

Reglas:

- El DNI debe tratarse como texto.
- No se deben modificar encabezados sin actualizar servicios.
- Los proyectos nuevos no deben duplicar esta información.
- Si el formulario requiere validar personal, debe consultar el padrón único.
- El registro del formulario puede guardar una copia transaccional del dato al momento del registro, pero la fuente maestra sigue siendo el padrón único.

### 4.4. Estructura base de CECO

La hoja `CECO` debe usarse como catálogo oficial de proyectos, centros de costo y razón social.

Encabezados esperados:

```text
RAZON SOCIAL
CECO
CENTRO DE COSTO
PROYECTO
ESTADO
```

Reglas:

- Solo usar CECO con estado `ACTIVO`.
- Validar proyecto contra CECO cuando aplique.
- Usar razón social para segmentar empresas del grupo.
- No crear catálogos paralelos de proyectos si ya existen en CECO.

### 4.5. Servicio estándar requerido

Todo proyecto nuevo debe incluir:

```text
src/services/PadronService.gs
```

Responsabilidades:

- Buscar personal por DNI.
- Buscar personal por correo, si el padrón incorpora correo a futuro.
- Determinar empresa de origen.
- Validar si existe.
- Validar si el proyecto existe en CECO.
- Devolver respuesta controlada.
- No exponer toda la base al frontend.

Respuesta estándar:

```javascript
{
  ok: true,
  result: {
    dni: '00000000',
    nombreCompleto: 'APELLIDOS Y NOMBRES',
    cargo: 'CARGO',
    proyecto: 'PROYECTO',
    empresa: 'TDEMSRL'
  },
  message: 'Personal encontrado.'
}
```

Si no existe:

```javascript
{
  ok: false,
  code: 'NO_ENCONTRADO',
  result: null,
  message: 'El DNI no se encuentra registrado en el padrón oficial.'
}
```

### 4.6. Regla para formularios

Los formularios web no deben tener hoja `PADRON` local salvo excepción documentada.

Correcto:

```text
Proyecto GAS
 ├─ REGISTRO_DE_RESPUESTAS
 ├─ CONFIG_FORMULARIO
 ├─ LOG_EVENTOS
 ├─ LOG_ERRORES
 └─ consume padrón externo oficial
```

No recomendado:

```text
Proyecto GAS
 ├─ REGISTRO_DE_RESPUESTAS
 ├─ PADRON duplicado
 ├─ CONFIG
 └─ LOG
```

### 4.7. Excepciones permitidas

Solo se permite padrón local cuando:

- El proceso incluya externos.
- Se trate de postulantes.
- Se trate de proveedores.
- El cliente entregue base temporal.
- Auditoría exija congelar una población.

Nombres permitidos:

```text
PADRON_TEMPORAL
PADRON_POSTULANTES
PADRON_PROVEEDORES
PADRON_CLIENTE
```

Toda excepción debe documentarse en `docs/02_GUIA_TECNICA.md`.

---

## 5. Tipos estándar de hojas

### 5.1. Hojas tipo matriz principal

Prefijos sugeridos:

```text
MC-
BD_
REG_
```

Ejemplos:

```text
MC-F-TIC-05
REGISTRO_DE_PARTICIPANTES
BD_SOLICITUDES
BD_INSPECCIONES
BD_PERSONAL
```

Campos mínimos:

```text
ID_REGISTRO
FECHA_HORA_ALTA
FECHA_HORA_ULTIMA_ACTUALIZACION
ESTADO_REGISTRO
USUARIO_CREACION
USUARIO_ACTUALIZACION
ORIGEN_REGISTRO
OBSERVACIONES
```

Campos adicionales cuando aplique:

```text
EMPRESA
PROYECTO
SEDE
AREA
CARGO
DNI
CORREO
ID_PROCESO
ID_PROGRAMA
TIPO_REGISTRO
URL_EVIDENCIA
URL_DOCUMENTO
URL_PDF
```

---

### 5.2. Hojas tipo configuración

Prefijos:

```text
CONFIG
CFG_
```

Ejemplos:

```text
CONFIG
CONFIG_EXAMENES
CONFIG_FORMULARIO
CONFIG_CORREOS
CONFIG_AUTH
CONFIG_UI
CONFIG_SESIONES
```

Para exámenes:

```text
ID_EXAMEN
TITULO
TIEMPO_MINUTOS
NOTA_MINIMA
CANTIDAD_PREGUNTAS
ACTIVO
```

Para programas:

```text
ID_PROGRAMA
NOMBRE_PROGRAMA
DESCRIPCION
FECHA_INICIO
FECHA_FIN_INSCRIPCION
ID_CARPETA_DRIVE
ESTADO
GRUPO_HABILITADO
```

Para sesiones:

```text
ID_PROGRAMA
ID_SESION
SESION
TEMA
FECHA
HORA_INICIO
HORA_FIN
LINK_MEET
URL_GRABACION
FECHA_CIERRE
ESTADO
```

---

### 5.3. Hojas tipo catálogo

Prefijo:

```text
CAT_
```

Ejemplos:

```text
CAT_EMPRESAS
CAT_PROYECTOS
CAT_ESTADOS
CAT_ROLES
CAT_TIPO_ACTIVO
CAT_TIPO_REGISTRO
CAT_ETIQUETAS
```

Campos mínimos:

```text
ID_CATALOGO
VALOR
DESCRIPCION
ESTADO
ORDEN
```

Adicionales:

```text
GRUPO
COLOR
ICONO
REQUIERE_COMENTARIO
ES_VISIBLE
```

---

### 5.4. Hojas tipo banco de preguntas

Prefijo:

```text
BANCO_
```

Campos sugeridos:

```text
ID_EXAMEN
ID_PREGUNTA
ENUNCIADO
OPCION_A
OPCION_B
OPCION_C
OPCION_D
CORRECTA
PISTA
URL_IMAGEN
ESTADO
```

Reglas:

- `ID_PREGUNTA` debe ser único.
- `CORRECTA` debe validarse contra valores permitidos.
- No cambiar IDs de preguntas ya usadas en resultados.
- Si una pregunta cambia de forma importante, debe versionarse.

---

### 5.5. Hojas tipo resultados

Prefijos:

```text
LOG_RESULTADOS
BD_RESULTADOS
REG_RESULTADOS
```

Campos sugeridos:

```text
ID_RESULTADO
FECHA_HORA
DNI
NOMBRE_COMPLETO
ID_EXAMEN
PUNTAJE
NOTA
ESTADO_RESULTADO
TIEMPO_USADO
DISPOSITIVO
NAVEGADOR
RESPUESTAS_JSON
NUMERO_INTENTO
```

Reglas:

- No sobrescribir resultados históricos.
- Cada intento genera nuevo registro.
- Las respuestas pueden guardarse en JSON si no se requiere análisis tabular directo.

---

### 5.6. Hojas tipo diccionario

Prefijos:

```text
DICC-
DICC_
```

Campos mínimos:

```text
CAMPO
TIPO_DATO
ORIGEN
OBLIGATORIO
VALORES_PERMITIDOS
DESCRIPCION
```

Adicionales:

```text
EJEMPLO
VALIDACION
HOJA_ORIGEN
USO_EN_FORMULARIO
USO_EN_DOCUMENTO
ES_EDITABLE
ES_AUDITABLE
```

Regla:

Toda matriz de control o sábana principal debe tener diccionario.

---

### 5.7. Hojas tipo tags o etiquetas

Prefijos:

```text
TAGS-
TAGS_
```

Campos mínimos:

```text
TAG_PLANTILLA
CAMPO_MC
UBICACION_FORMATO
TIPO_RENDER
NOTAS_AUTOMATIZACION
```

Reglas:

- Todo tag debe existir en matriz o estar declarado como calculado.
- No usar tags ambiguos.
- No repetir tags con significados distintos.
- Documentar si renderiza texto, fecha, moneda, imagen, link o condicional.

---

### 5.8. Hojas tipo log

Prefijo:

```text
LOG_
```

Campos mínimos:

```text
FECHA_HORA
USUARIO_EJECUCION
ACCION
ID_REGISTRO
RESULTADO
MENSAJE
```

Adicionales:

```text
MODULO
FUNCION
ANTES_JSON
DESPUES_JSON
ERROR_STACK
CORREO_DESTINO
URL_DOCUMENTO
URL_PDF
IP_CLIENTE
DISPOSITIVO
NAVEGADOR
```

Reglas:

- Logs de solo inserción.
- No editar manualmente.
- No borrar salvo archivado documentado.
- Registrar errores de permisos, scopes, Drive, correo y validación.

---

## 6. Hojas mínimas para formularios GAS

Todo formulario debe tener:

```text
CONFIG_FORMULARIO
REGISTRO_DE_RESPUESTAS
LOG_EVENTOS
LOG_ERRORES
```

Consume además:

```text
PADRON_PERSONAL_UNICO
```

Si tiene programas:

```text
PROGRAMAS
CONFIG_SESIONES
HABILITADOS
```

Si genera documentos:

```text
TAGS_DOCUMENTO
LOG_DOCUMENTOS
```

Si envía correos:

```text
CONFIG_CORREOS
LOG_CORREOS
```

Si requiere login:

```text
AUTH_USUARIOS
AUTH_ROLES
AUTH_PERMISOS
AUTH_SESIONES
AUTH_LOG_ACCESOS
```

---

## 7. Campos mínimos para registros de formularios

```text
ID_REGISTRO
FECHA_HORA_REGISTRO
DNI
NOMBRE_COMPLETO
CARGO
AREA
PROYECTO
EMPRESA
CORREO
TIPO_REGISTRO
ESTADO_REGISTRO
USUARIO_REGISTRO
DURACION_SESION
DISPOSITIVO
NAVEGADOR
IDIOMA_NAVEGADOR
RESOLUCION_PANTALLA
USER_AGENT
OBSERVACIONES
```

Para registros tardíos o excepcionales:

```text
ES_EXTEMPORANEO
MOTIVO_EXTEMPORANEO
USUARIO_AUTORIZA
FECHA_AUTORIZACION
```

---

## 8. Reglas de nombres de columnas

Correcto:

```text
ID_PROGRAMA
NOMBRE_COMPLETO
FECHA_HORA_REGISTRO
URL_GRABACION
ESTADO_REGISTRO
```

No recomendado:

```text
ID Programa
Apellidos y Nombres
FECHA REGISTRO
HABILITADOS 
RESOLUCIÓN_PANTALLA
```

Reglas:

- Mayúsculas.
- Sin tildes.
- Sin caracteres especiales.
- Con guion bajo.
- Sin espacios iniciales o finales.

---

## 9. Estados estándar

Estados base:

```text
ACTIVO
INACTIVO
PENDIENTE
APROBADO
RECHAZADO
OBSERVADO
ANULADO
ELIMINADO
CERRADO
VENCIDO
```

Operativos:

```text
CREADO
EN_PROCESO
COMPLETADO
OBSERVADO
CORREGIDO
CERRADO
```

Usuarios:

```text
ACTIVO
BLOQUEADO
INACTIVO
BAJA
```

Regla:

No escribir estados no definidos en catálogo o `CONFIG`.

---

## 10. Control de duplicados

Cada hoja principal debe definir clave única.

Ejemplos:

```text
Capacitación: DNI + ID_PROGRAMA
Cuestionario: DNI + ID_EXAMEN + NUMERO_INTENTO
Inventario: SERIE_SERVICE_TAG o ID_ACTIVO
Solicitud: ID_SOLICITUD
```

Reglas:

- Validar duplicado antes de insertar.
- Usar `LockService` en registros simultáneos.
- Devolver respuesta controlada si ya existe.
- No confiar solo en frontend.

---

## 11. Manejo de fechas

Formato técnico recomendado:

```text
YYYY-MM-DD HH:MM:SS
```

Formato visual permitido:

```text
DD/MM/YYYY
```

Reglas:

- Usar `Date` internamente cuando sea posible.
- Mostrar al usuario en formato legible.
- Considerar zona horaria `America/Lima`.
- No mezclar texto y fecha si se harán cálculos.

---

## 12. Validación estructural

Cada proyecto debe tener función técnica:

```javascript
function validarEstructuraProyecto() {
  // Revisa hojas obligatorias, encabezados, CONFIG y permisos mínimos.
}
```

Debe validar:

- Hojas obligatorias.
- Encabezados obligatorios.
- Estados permitidos.
- Duplicados potenciales.
- Configuración crítica.
- Carpetas Drive.
- Plantillas.
- Scopes requeridos.
- Permisos esperados.

---

## 13. Regla para IA/Codex

La IA no debe:

- Inventar columnas.
- Crear hojas sin documentarlas.
- Cambiar encabezados sin actualizar diccionario.
- Cambiar IDs sin explicar impacto.
- Duplicar el padrón único.
- Modificar estructura sin actualizar `docs/`.
- Crear lógica de lectura por índices fijos si existe mapa de encabezados.
