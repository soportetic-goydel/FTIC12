# 03_ESTANDAR_UI_UX_FORMULARIOS_HTMLSERVICE

## 1. Propósito

Este estándar define el diseño UI/UX base para formularios web desarrollados con Google Apps Script HtmlService.

El objetivo es que todos los formularios tengan una experiencia consistente, profesional, clara y compatible con móvil y escritorio.

---

## 2. Principios UI/UX

1. Diseño mobile-first.
2. Tarjeta principal centrada en escritorio y pantalla completa en móvil.
3. Header corporativo con logo parametrizado.
4. Estados visuales claros: carga, éxito, error, advertencia, ya registrado.
5. Inputs grandes, legibles y con feedback.
6. Botones claros, con acción principal evidente.
7. No saturar al usuario con campos innecesarios.
8. Validar en frontend para experiencia, pero siempre validar también en backend.
9. Mantener accesibilidad básica: contraste, tamaños legibles, foco visible.
10. Evitar estilos improvisados fuera de las clases estándar.

---

## 3. Componentes obligatorios

### 3.1. Layout general

```html
<div class="card" style="position:relative;">
  <div id="overlay">
    <div class="spinner"></div>
    <span>Procesando...</span>
  </div>

  <div id="toast"></div>

  <div class="hdr">
    <div class="logos">
      <img src="<?= LOGO ?>" alt="Logo">
    </div>
    <div class="hdr-sub">Subtítulo del formulario</div>
  </div>

  <div class="body">
    <!-- vistas -->
  </div>
</div>
```

### 3.2. Vistas

Todo formulario debe manejar vistas con clases:

```html
<div id="view-inicio" class="view active"></div>
<div id="view-form" class="view"></div>
<div id="view-ok" class="view"></div>
<div id="view-error" class="view"></div>
```

Reglas:

- No recargar la página para cambiar de estado.
- Usar `showView(id)` en frontend.
- Las vistas largas deben permitir scroll.
- El estado actual debe ser evidente.

---

## 4. Clases CSS estándar

### 4.1. Base

```text
.card
.hdr
.logos
.hdr-sub
.body
.view
.view.active
```

### 4.2. Feedback y carga

```text
#overlay
.spinner
#toast
#toast.show
.alerta
.check-wrap
.check-circle
.check-title
.check-sub
```

### 4.3. Inputs

```text
.lbl
.inp
.inp.error
.dni-row
.btn-buscar
```

### 4.4. Botones

```text
.btn-main
.btn-main:disabled
.btn-sec
.btn-back
```

### 4.5. Tarjetas y listas

```text
.prog-card
.prog-top
.prog-status-badge
.prog-nombre
.prog-desc
.prog-actions
.sesion
.s-left
.s-num
.s-title
.s-fecha
.s-tema
```

### 4.6. Correos dentro del formulario

```text
.email-ticket-box
.email-ticket-title
.email-ticket-sub
```

---

## 5. Colores

Los colores no deben quedar hardcodeados sin control. Deben declararse en `CONFIG.UI`.

Base recomendada:

```javascript
UI: {
  COLOR_PRIMARIO: '#004a99',
  COLOR_SECUNDARIO: '#16a34a',
  COLOR_EXITO: '#16a34a',
  COLOR_ERROR: '#dc3545',
  COLOR_ALERTA: '#d97706',
  COLOR_TEXTO: '#1c2b4a',
  COLOR_MUTED: '#888'
}
```

---

## 6. Logos

Los logos deben ser configurables.

```javascript
UI: {
  LOGO_PRINCIPAL_URL: '',
  LOGO_SECUNDARIO_URL: '',
  BANNER_FORM_URL: ''
}
```

Reglas:

- No insertar URLs de logos directamente en varios HTML.
- Si cambia la marca, solo debe cambiar `CONFIG`.
- Si hay varias empresas, usar render condicional según empresa.

---

## 7. Tipografía

Recomendado:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Reglas:

- Mantener una sola familia tipográfica principal.
- Evitar mezclar muchas fuentes.
- Tamaño base recomendado: 14px a 15px.
- Títulos: 16px a 20px según jerarquía.
- Labels: 10px a 12px en mayúsculas.

---

## 8. Estados obligatorios

### 8.1. Cargando

Debe existir overlay:

```javascript
function loading(on) {
  document.getElementById('overlay').style.display = on ? 'flex' : 'none';
}
```

### 8.2. Éxito

Debe existir vista de éxito:

```text
Registro exitoso
Resumen del registro
Acción secundaria
Opción de recibir ticket por correo si aplica
```

### 8.3. Ya registrado

Debe existir estado para duplicados:

```text
Ya te encuentras registrado/a
Resumen del registro existente
Opción de reenviar ticket si aplica
```

### 8.4. Error

Debe mostrar mensaje entendible:

```text
No se pudo completar la operación. Intenta nuevamente o consulta con el responsable.
```

No mostrar errores técnicos completos al usuario final.

### 8.5. Advertencia

Para registros tardíos, datos faltantes o validaciones:

```text
Inscripción fuera del plazo
Motivo obligatorio
```

---

## 9. Validaciones frontend

El frontend puede validar:

- DNI con 8 dígitos.
- Correo con formato básico.
- Campos obligatorios.
- Motivo en registros tardíos.
- Fechas visibles.
- Selección de programa o sesión.

Pero el backend debe volver a validar todo.

---

## 10. Metadata de cliente

Todo formulario debe capturar metadata:

```javascript
function metaCliente() {
  const ua = navigator.userAgent;
  return {
    duracion: '',
    dispositivo: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Móvil' : 'Escritorio',
    navegador: '',
    idioma: navigator.language || '',
    resolucion: screen.width + 'x' + screen.height,
    userAgent: ua
  };
}
```

Campos recomendados en hoja de registro:

```text
DURACION_SESION
DISPOSITIVO
NAVEGADOR
IDIOMA_NAVEGADOR
RESOLUCION_PANTALLA
USER_AGENT
```

---

## 11. Comunicación frontend-backend

Debe usarse `google.script.run`.

Ejemplo:

```javascript
google.script.run
  .withSuccessHandler(function (res) {
    if (!res.ok) {
      mostrarError(res.message);
      return;
    }
    pintarDatos(res.result);
  })
  .withFailureHandler(function (err) {
    mostrarError('Error de comunicación con el servidor.');
  })
  .buscarPersonalPorDni(dni);
```

Reglas:

- No usar `fetch('/api/...')`.
- No exponer toda la base al cliente.
- No enviar al cliente datos que no necesita.
- Toda llamada debe tener success y failure handler.

---

## 12. UX para formularios con padrón

Flujo recomendado:

1. Usuario ingresa DNI.
2. Frontend valida longitud.
3. Backend busca en padrón único.
4. Si existe, completa nombre, cargo, proyecto y empresa.
5. Si no existe, muestra advertencia.
6. Backend verifica duplicado.
7. Si no hay duplicado, habilita botón de registro.
8. Al registrar, backend vuelve a validar padrón, duplicado y configuración.

---

## 13. UX para formularios con programas o sesiones

Debe existir:

- Vista inicial con programas activos.
- Badge de estado: abierto/cerrado.
- Fecha de cierre.
- Botón para ver sesiones.
- Botón para inscribirse.
- Registro tardío si se permite.
- Modal de sesiones.
- Vista de confirmación con cronograma.

---

## 14. Responsive

Reglas:

- Móvil: la card puede ocupar toda la pantalla.
- Escritorio: card centrada con ancho máximo.
- No usar tablas grandes dentro del formulario móvil.
- Los botones deben ser táctiles.
- Los modales en móvil deben abrir desde abajo o verse como bottom sheet.
- En escritorio pueden estar centrados.

---

## 15. No permitido

- HTML gigante sin separación.
- CSS inline excesivo salvo correos.
- Scripts mezclados dentro de vistas complejas.
- Cargar librerías innecesarias.
- Formularios con demasiados campos si pueden autocompletarse.
- Mensajes técnicos crudos al usuario.
- Botones sin feedback.
- Acciones que no muestran carga.
