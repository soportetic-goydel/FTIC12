# 04_ESTANDAR_CORREOS_HTML_GAS

## 1. Propósito

Este estándar define cómo deben construirse, enviarse, documentarse y auditarse los correos HTML en proyectos Google Apps Script.

Aplica para:

- Tickets de inscripción.
- Confirmaciones.
- Alertas.
- Notificaciones internas.
- Respuestas automáticas.
- Envío de links Meet.
- Envío de documentos generados.
- Observaciones, aprobaciones o rechazos.

---

## 2. Regla principal

No se debe construir HTML largo directamente dentro de funciones `.gs`.

Permitido solo en prototipos iniciales.  
Para greenfield, el HTML debe vivir en plantillas separadas.

Estructura recomendada:

```text
src/
  services/
    EmailService.gs

  templates/
    email/
      EmailLayout.html
      EmailTicketInscripcion.html
      EmailNotificacion.html
      EmailStyles.html
```

---

## 3. CONFIG de correos

Todo proyecto debe declarar configuración de correo.

```javascript
EMAIL: {
  FROM_NAME: 'Sistema de Gestión',
  REPLY_TO: '',
  ENABLE_LOG: true,
  DEFAULT_FOOTER: 'Este es un correo automático, por favor no responder.'
}
```

Si la configuración se maneja por hoja:

```text
CONFIG_CORREOS
```

Campos sugeridos:

```text
TIPO_CORREO
ASUNTO
NOMBRE_REMITENTE
CORREO_RESPUESTA
PLANTILLA_HTML
ACTIVO
```

---

## 4. Log de correos

Debe existir:

```text
LOG_CORREOS
```

Campos mínimos:

```text
FECHA_HORA
TIPO_CORREO
DESTINATARIO
ASUNTO
ID_REGISTRO
RESULTADO
MENSAJE
ERROR
```

Campos adicionales:

```text
USUARIO_EJECUCION
MODULO
FUNCION
CC
BCC
ADJUNTOS
```

Regla:

Todo intento de envío debe registrar log, tanto OK como ERROR.

---

## 5. Servicio estándar

Archivo:

```text
src/services/EmailService.gs
```

Funciones sugeridas:

```javascript
function EmailService_enviarTicketInscripcion_(data) {}
function EmailService_renderTemplate_(templateName, data) {}
function EmailService_enviarHtml_(to, subject, htmlBody, options) {}
function EmailService_logCorreo_(data) {}
```

Ejemplo de render:

```javascript
function EmailService_renderTemplate_(templateName, data) {
  const template = HtmlService.createTemplateFromFile(templateName);
  template.data = data || {};
  return template.evaluate().getContent();
}
```

Ejemplo de envío:

```javascript
function EmailService_enviarHtml_(to, subject, htmlBody, options) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody,
    name: options && options.name ? options.name : CONFIG.EMAIL.FROM_NAME,
    replyTo: options && options.replyTo ? options.replyTo : CONFIG.EMAIL.REPLY_TO
  });
}
```

---

## 6. Plantilla base de correo

Todo correo debe tener:

- Encabezado.
- Marca o nombre del sistema.
- Título.
- Saludo.
- Resumen.
- Detalle principal.
- Acción o links.
- Nota de seguridad o soporte.
- Footer.

Estructura mínima:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @media only screen and (max-width: 650px) {
      .main-container { width: 100% !important; border-radius: 0 !important; }
      .col { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 10px;">
    <tr>
      <td align="center">
        <table class="main-container" width="720" cellpadding="0" cellspacing="0" style="max-width:720px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #cbd5e1;">
          <tr>
            <td style="background:#004a99;padding:24px 32px;color:#ffffff;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Sistema Corporativo</p>
              <h1 style="margin:0;font-size:20px;font-weight:500;">Título del correo</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              Contenido del correo
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Este es un correo automático, por favor no responder.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 7. Ticket de inscripción

Debe incluir:

- Nombre del participante.
- DNI.
- Programa.
- Fecha de registro.
- Cronograma.
- Links Meet si aplica.
- Botón para agendar si aplica.
- Nota de acceso personal.
- Footer corporativo.

Data esperada:

```javascript
{
  participante: {
    dni: '',
    nombre: '',
    cargo: '',
    proyecto: '',
    empresa: ''
  },
  programa: {
    id: '',
    nombre: '',
    descripcion: ''
  },
  sesiones: [
    {
      sesion: '',
      tema: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      linkMeet: '',
      urlGrabacion: ''
    }
  ]
}
```

---

## 8. Links de Google Calendar

Si se generan links para agenda:

```javascript
function EmailService_gcalUrl_(sesion, tema, fecha, meet) {
  const p = String(fecha).split('/');
  if (p.length !== 3) return '#';

  const d = p[0].padStart(2, '0');
  const m = p[1].padStart(2, '0');
  const y = p[2];

  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(sesion + ': ' + tema)
    + '&dates=' + y + m + d + 'T200000Z/' + y + m + d + 'T220000Z'
    + '&details=' + encodeURIComponent(tema + '\n' + (meet || ''))
    + '&location=' + encodeURIComponent(meet || '')
    + '&ctz=America/Lima';
}
```

---

## 9. Adjuntos

Si el correo incluye adjuntos:

- Validar que el archivo exista.
- Validar permisos.
- Registrar URL o ID en log.
- No bloquear todo el flujo si un adjunto opcional falla, salvo que sea obligatorio.
- No adjuntar archivos pesados si puede enviarse link Drive controlado.

---

## 10. Errores

Si falla el envío:

Respuesta estándar:

```javascript
{
  ok: false,
  code: 'EMAIL_ERROR',
  message: 'No se pudo enviar el correo.',
  error: 'Detalle técnico controlado.'
}
```

Reglas:

- Registrar en `LOG_CORREOS`.
- No mostrar stack completo al usuario.
- Si el correo es opcional, no revertir el registro principal.
- Si el correo es obligatorio, marcar registro como `PENDIENTE_ENVIO`.

---

## 11. Seguridad

No enviar por correo:

- Contraseñas.
- Tokens permanentes.
- Datos sensibles innecesarios.
- Enlaces públicos sin control si contienen información interna.
- Información personal excesiva.

Si se comparte carpeta Drive:

- Hacerlo de forma controlada.
- Registrar en log.
- No dar permisos globales si no corresponde.
- Preferir permisos por usuario/correo.

---

## 12. Reglas para IA/Codex

La IA debe:

- Separar HTML de correo en plantillas.
- No meter HTML largo dentro de `.gs`.
- Mantener estilos inline en correos por compatibilidad.
- Registrar logs de envío.
- Mantener configuración en `CONFIG`.
- No inventar remitentes ni correos de soporte.
- Actualizar documentación si cambia la plantilla o el flujo de envío.
