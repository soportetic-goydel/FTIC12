# Guía de Diseño UI — F-TIC-12 Reporte de Incidencias y Fallas Técnicas

Referencia rápida del look & feel actual (Fase 1). Fuente de verdad real: `CONFIG.UI` en `src/config/Config.gs` — si cambias un color ahí, actualiza este archivo.

## Colores (CONFIG.UI)
```
COLOR_PRIMARIO      #004a99   azul marino (header, botón buscar)
COLOR_SECUNDARIO    #16a34a   verde (botón principal "Enviar reporte")
COLOR_EXITO         #16a34a
COLOR_ERROR         #dc3545
COLOR_ALERTA        #d97706
COLOR_TEXTO         #1c2b4a
COLOR_MUTED         #55606e
```

Tipografía: **Poppins** (400/500/600/700).

## Layout
Tarjeta centrada (`max-width: 560px`) sobre fondo degradado blanco→celeste. Header sólido azul marino con título del formato y subtítulo. Cuerpo con dos secciones visuales (`.seccion`): "1. Datos del solicitante" y "2. Detalles de la incidencia", replicando las secciones del formato F-TIC-12 físico.

## Vistas
- `#view-form` (activa por defecto): formulario completo.
- `#view-ok`: confirmación con ícono de check, mensaje y número de ticket (`.ticket-id`).

Sin recarga de página entre estados (`showView(id)` en `src/ui/GlobalClient.html`).

## Componentes específicos del módulo `reporte`
- `.dni-row` + `.btn-buscar`: busqueda de DNI contra el padron, con disparo automatico al completar 8 digitos y `.ayuda` mostrando resultado (encontrado / advertencia de no encontrado).
- `.anydesk-box`: bloque diferenciado (fondo `--c-app-bg`) para los campos opcionales de acceso remoto.
- `.ticket-id`: chip con el `ID_REGISTRO` generado, en la vista de confirmación.

## Estados obligatorios
- **Cargando:** `#overlay` + `.spinner`, activado con `loading(true/false)` durante cada llamada a `google.script.run`.
- **Éxito:** `#view-ok`.
- **Advertencia:** `.alerta.alerta-warn` (ej. DNI no encontrado en el padrón — no bloquea el registro).
- **Error:** `#toast` con `toast(mensaje, 'error')` para errores de validación o de comunicación; no se muestran mensajes técnicos crudos.

## Responsive
Mobile-first: la tarjeta ocupa el ancho disponible con `padding` lateral en el `body`; en escritorio queda centrada con `max-width: 560px` (portal: `max-width: 1040px`). Inputs y botones a ancho completo, táctiles.

## Interacción y motion (Portal, Fase 1.1)
- **Transición entre vistas:** `showView()` reinicia la animación `vistaEntra` (fade + slide 10px) en cada cambio de `.view.active`, vía `GlobalClient.html`.
- **Hero animado:** `PortalStyles.html` dibuja dos manchas radiales (`.portal-hero::before/::after`) con `@keyframes heroFlota` (movimiento sutil, sin bloquear texto).
- **Entrada escalonada:** tarjetas de `#view-home` (`.action-card`, `.info-card`) usan `.stagger-in` + variable `--stagger` para animar en cascada (`staggerEntra`, 70ms de retraso por tarjeta).
- **Iconografía:** SVG inline (`currentColor`) en tarjetas de inicio, botón copiar y check de éxito — sin dependencias externas.
- **Timeline de estado:** `#statusTimeline` en `view-track-result` (3 pasos: Registrado / En atención / Resuelto) coloreado según el estado normalizado (`is-open` → paso 1 actual, `is-progress` → paso 2 actual, `is-closed`/`resuelto`/`cerrado`/`anulado` → todos completos). Lógica en `actualizarTimeline()` de `PortalClient.html`.
- **Copiar ticket:** botón `.btn-copy` (con `navigator.clipboard`, fallback `execCommand`) en `view-ok` y `view-track-result`, confirma con `toast(..., 'ok')`.
- **Progreso del formulario:** barra `.form-progress-fill` en `ReporteView.html` que se recalcula en cada `input`/`change` dentro de `#view-form` (`actualizarProgreso()` en `ReporteClient.html`), sobre los mismos campos obligatorios que valida `validarFrontend()`.
- **Autocompletado por DNI:** al traer datos del padrón, los campos rellenados reciben un destello verde breve (`.inp.autocompletado` + `@keyframes destello`) vía `marcarAutocompletado()`.
- **Busqueda de DNI sin overlay global:** al completar los 8 digitos del DNI se dispara una consulta automatica con debounce corto; `#btnBuscarDni` sigue usando un spinner inline (`.btn-spinner` + clase `.is-loading`) y queda disponible como reintento manual sin bloquear toda la pantalla. El overlay `#overlay` se reserva para envios y consultas que si deben bloquear la interaccion.
- **Toasts con variantes:** `toast(mensaje, tipo)` acepta `'error' | 'ok' | 'info'`, cada uno con ícono SVG propio (`TOAST_ICONOS` en `GlobalClient.html`).
- **Accesibilidad:** `:focus-visible` global, `aria-live="polite"` en `#toast` y `#overlay`, `aria-label` en botones solo-ícono, `@media (prefers-reduced-motion: reduce)` neutraliza animaciones/transiciones.

## Reglas de estilo a mantener
- Nunca colores hardcodeados fuera de `CONFIG.UI` / variables CSS (`--c-*`) inyectadas en `GlobalStyles.html`.
- No se implementa Sección 3 (uso interno TIC) en esta fase — no debe aparecer en el formulario del solicitante.
- No mostrar `ANYDESK_PASSWORD` en texto plano en ninguna vista (input `type="password"`).
- Toda animación nueva debe respetar `prefers-reduced-motion` (ya cubierto globalmente; no anular esa regla en estilos de módulo).
- Iconografía nueva: SVG inline con `currentColor`, nunca íconos de fuentes/CDN externos.
