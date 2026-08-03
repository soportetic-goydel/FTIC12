# 05_ESTANDAR_AUTH_LOGIN_SEGURIDAD

## 1. Propósito

Este estándar define cómo preparar proyectos GAS para pertenecer a un sistema con Auth Login seguro.

No todos los formularios requieren login, pero el enlatado greenfield debe permitirlo sin reconstruir todo.

---

## 2. Niveles de seguridad

### Nivel 1: Público con validación por DNI

Uso:

- Formularios simples.
- Inscripciones.
- Confirmaciones.
- Registros internos de bajo riesgo.

Control:

- Validación por DNI contra padrón único.
- Control de duplicados.
- Logs.

### Nivel 2: Restringido por correo corporativo

Uso:

- Formularios internos.
- Reportes con información moderada.

Control:

- Validación de correo.
- Dominio permitido.
- Padrón único.
- Logs.

### Nivel 3: Login con usuario y rol

Uso:

- Sistemas internos.
- Matrices de control.
- Bandejas de gestión.
- Aprobaciones.

Control:

- Usuario.
- Rol.
- Sesión.
- Permisos por módulo.
- Logs de acceso.

### Nivel 4: Sistema matriz con auditoría completa

Uso:

- Procesos críticos.
- Datos sensibles.
- Flujos de aprobación.
- Control documentario.
- Inventarios.
- RRHH.

Control:

- Login.
- Roles.
- Permisos por acción.
- Logs de cambios.
- Auditoría antes/después.
- Sesiones con expiración.

---

## 3. Hojas AUTH recomendadas

```text
AUTH_USUARIOS
AUTH_ROLES
AUTH_PERMISOS
AUTH_SESIONES
AUTH_LOG_ACCESOS
```

### 3.1. AUTH_USUARIOS

```text
ID_USUARIO
DNI
NOMBRE_COMPLETO
CORREO
ROL
EMPRESA
PROYECTO
AREA
ESTADO_USUARIO
FECHA_ALTA
FECHA_BAJA
ULTIMO_ACCESO
```

### 3.2. AUTH_ROLES

```text
ROL
DESCRIPCION
NIVEL
ESTADO
```

### 3.3. AUTH_PERMISOS

```text
ROL
MODULO
PUEDE_VER
PUEDE_CREAR
PUEDE_EDITAR
PUEDE_ELIMINAR
PUEDE_EXPORTAR
PUEDE_APROBAR
```

### 3.4. AUTH_SESIONES

```text
TOKEN_HASH
ID_USUARIO
CORREO
ROL
FECHA_INICIO
FECHA_EXPIRACION
ESTADO_SESION
DISPOSITIVO
NAVEGADOR
```

### 3.5. AUTH_LOG_ACCESOS

```text
FECHA_HORA
CORREO
ID_USUARIO
ROL
ACCION
RESULTADO
DISPOSITIVO
NAVEGADOR
MENSAJE
```

---

## 4. Reglas obligatorias

1. El frontend no decide permisos.
2. El backend valida sesión y rol en cada función pública protegida.
3. No exponer hojas completas al cliente.
4. No devolver datos sensibles innecesarios.
5. No guardar contraseñas en texto plano.
6. No guardar tokens en el repositorio.
7. No guardar credenciales en `CONFIG.gs`.
8. Registrar accesos y errores.
9. Expirar sesiones.
10. Bloquear usuarios inactivos.

---

## 5. Configuración AUTH

En `CONFIG`:

```javascript
AUTH: {
  ENABLED: false,
  SESSION_MINUTES: 480,
  SHEETS: {
    USUARIOS: 'AUTH_USUARIOS',
    ROLES: 'AUTH_ROLES',
    PERMISOS: 'AUTH_PERMISOS',
    SESIONES: 'AUTH_SESIONES',
    LOG_ACCESOS: 'AUTH_LOG_ACCESOS'
  }
}
```

---

## 6. Flujo recomendado de login

1. Usuario ingresa correo o se detecta sesión.
2. Backend valida si existe en `AUTH_USUARIOS`.
3. Backend valida `ESTADO_USUARIO = ACTIVO`.
4. Backend obtiene rol.
5. Backend crea token de sesión.
6. Backend registra acceso.
7. Frontend recibe token y datos mínimos.
8. Cada llamada protegida envía token.
9. Backend valida sesión y permisos.

Respuesta de login:

```javascript
{
  ok: true,
  result: {
    token: 'token-temporal',
    usuario: {
      nombre: '',
      correo: '',
      rol: '',
      empresa: '',
      proyecto: ''
    }
  },
  message: 'Inicio de sesión correcto.'
}
```

---

## 7. Validación de permisos

Ejemplo:

```javascript
function moduloAccionProtegida(token, payload) {
  try {
    AuthService_validarPermiso_(token, 'CAPACITACIONES', 'CREAR');
    // lógica del módulo
    return ResponseService_ok_({}, 'Operación realizada.');
  } catch (error) {
    return ResponseService_error_(error, 'No autorizado.', 'NO_AUTORIZADO');
  }
}
```

---

## 8. Permisos por módulo

Acciones estándar:

```text
VER
CREAR
EDITAR
ELIMINAR
EXPORTAR
APROBAR
RECHAZAR
ANULAR
CONFIGURAR
```

Ejemplo de módulos:

```text
DASHBOARD
CAPACITACIONES
INVENTARIO
CONTROL_DOCUMENTARIO
RRHH
REPORTES
ADMIN
```

---

## 9. Manejo de sesión

Reglas:

- Token con expiración.
- Preferir hash del token en hoja si se registra.
- No guardar token plano si no es necesario.
- Cerrar sesión cambia estado a `CERRADA`.
- Sesiones vencidas no deben aceptar acciones.
- Registrar último acceso.

---

## 10. Auth en Apps Script

Opciones posibles:

1. Validación por usuario activo de Google:
   - `Session.getActiveUser().getEmail()`
2. Login por correo + código temporal.
3. Login con token enviado por correo.
4. Integración futura con sistema externo.

Para Web Apps publicadas como "Anyone", `Session.getActiveUser()` puede no devolver correo confiable en todos los casos. Por eso, para procesos críticos debe usarse un flujo controlado de login.

---

## 11. Protección de datos

No devolver al frontend:

- Bases completas.
- Logs completos.
- Correos masivos.
- DNI innecesarios.
- Datos sensibles de RRHH.
- Tokens internos.
- IDs de carpetas sensibles si no son necesarios.

---

## 12. Reglas para IA/Codex

La IA debe:

- Preguntar o verificar si el módulo requiere Auth.
- No proteger solo en frontend.
- No inventar contraseñas.
- No proponer almacenamiento inseguro.
- No exponer hojas completas.
- Documentar permisos si agrega roles.
- Actualizar `docs/02_GUIA_TECNICA.md` si cambia Auth.
