function NotificacionService_enviarResumenAtencion_(registro) {
  const idRegistro = String(registro && registro.ID_REGISTRO || '').trim();
  const correoDestino = Utils_normalizarCorreo_(registro && registro.CORREO_ELECTRONICO_SOLICITANTE);

  if (!correoDestino) {
    return {
      ok: false,
      intentado: true,
      skipped: true,
      status: 'OMITIDO_SIN_CORREO',
      email: '',
      sentAt: '',
      message: 'No se envio correo resumen porque el ticket no tiene un correo electronico registrado.',
      technicalDetail: 'SIN_CORREO_DESTINO'
    };
  }

  if (!Utils_esCorreoValido_(correoDestino)) {
    return {
      ok: false,
      intentado: true,
      skipped: true,
      status: 'OMITIDO_CORREO_INVALIDO',
      email: correoDestino,
      sentAt: '',
      message: 'No se envio correo resumen porque el correo registrado no es valido.',
      technicalDetail: 'CORREO_INVALIDO:' + correoDestino
    };
  }

  const asunto = '[TIC] Ticket ' + idRegistro + ' atendido';
  const cuerpoTexto = NotificacionService_construirResumenTexto_(registro);
  const cuerpoHtml = NotificacionService_construirResumenHtml_(registro);
  const opciones = {
    htmlBody: cuerpoHtml,
    name: CONFIG.APP.NOTIFICATION_SENDER_NAME || 'Mesa de Ayuda TIC'
  };
  if (CONFIG.APP.SUPPORT_EMAIL) opciones.replyTo = CONFIG.APP.SUPPORT_EMAIL;

  MailApp.sendEmail(correoDestino, asunto, cuerpoTexto, opciones);

  return {
    ok: true,
    intentado: true,
    skipped: false,
    status: 'ENVIADO',
    email: correoDestino,
    sentAt: Utils_formatFechaHora_(Utils_now_()),
    message: 'Correo resumen enviado correctamente al solicitante.',
    technicalDetail: 'MAILAPP_OK'
  };
}

function NotificacionService_construirResumenTexto_(registro) {
  const lineas = [
    'Hola ' + NotificacionService_valorTexto_(registro.NOMBRE_COMPLETO_SOLICITANTE) + ',',
    '',
    'Tu ticket TIC fue atendido con el siguiente resumen:',
    '',
    'Ticket: ' + NotificacionService_valorTexto_(registro.ID_REGISTRO),
    'Estado: ' + NotificacionService_valorTexto_(registro.ESTADO_REGISTRO),
    'Fecha de reporte: ' + NotificacionService_valorTexto_(registro.FECHA_HORA_REPORTE),
    'Fecha de cierre: ' + NotificacionService_valorTexto_(registro.FECHA_HORA_CIERRE),
    'Activo afectado: ' + NotificacionService_valorTexto_(registro.ACTIVO_AFECTADO),
    'Tipo de problema: ' + NotificacionService_valorTexto_(registro.TIPO_PROBLEMA),
    'Tecnico responsable: ' + NotificacionService_valorTexto_(registro.TECNICO_RESPONSABLE),
    'Diagnostico TIC: ' + NotificacionService_valorTexto_(registro.DIAGNOSTICO_TIC),
    'Accion tomada: ' + NotificacionService_valorTexto_(registro.ACCION_TOMADA),
    'Estado final: ' + NotificacionService_valorTexto_(registro.ESTADO_FINAL)
  ];

  const linkPdf = String(registro && registro.LINK_PDF_REPORTE || '').trim();
  if (linkPdf) lineas.push('PDF del ticket: ' + linkPdf);

  lineas.push('');
  lineas.push('Si necesitas soporte adicional, responde a ' + (CONFIG.APP.SUPPORT_EMAIL || 'Mesa de Ayuda TIC') + '.');
  return lineas.join('\n');
}

function NotificacionService_construirResumenHtml_(registro) {
  const ticketId = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.ID_REGISTRO));
  const estado = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.ESTADO_REGISTRO));
  const fechaReporte = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.FECHA_HORA_REPORTE));
  const fechaCierre = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.FECHA_HORA_CIERRE));
  const activo = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.ACTIVO_AFECTADO));
  const tipoProblema = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.TIPO_PROBLEMA));
  const tecnico = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.TECNICO_RESPONSABLE));
  const accion = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.ACCION_TOMADA));
  const estadoFinal = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.ESTADO_FINAL));
  const diagnostico = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.DIAGNOSTICO_TIC)).replace(/\n/g, '<br>');
  const solicitante = NotificacionService_escapeHtml_(NotificacionService_valorTexto_(registro.NOMBRE_COMPLETO_SOLICITANTE));
  const linkPdf = String(registro && registro.LINK_PDF_REPORTE || '').trim();
  const bloquePdf = linkPdf
    ? '<tr><td colspan="2" style="padding-top:18px;"><a href="' + NotificacionService_escapeHtml_(linkPdf) + '" style="display:inline-block;padding:12px 18px;background:#0c4f99;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Ver PDF del ticket</a></td></tr>'
    : '';

  return '' +
    '<div style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,sans-serif;color:#1f2937;">' +
      '<table role="presentation" style="width:100%;border-collapse:collapse;background:#f3f6fb;" cellpadding="0" cellspacing="0">' +
        '<tr>' +
          '<td align="center" style="padding:24px 12px;">' +
            '<table role="presentation" style="width:100%;max-width:760px;border-collapse:collapse;background:#ffffff;border:1px solid #d9e2ef;border-radius:14px;overflow:hidden;" cellpadding="0" cellspacing="0">' +
              '<tr>' +
                '<td style="padding:24px 28px;background:linear-gradient(135deg,#0c376f 0%,#0f5fb8 100%);color:#ffffff;">' +
                  '<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">Mesa de Ayuda TIC</div>' +
                  '<div style="margin-top:8px;font-size:24px;font-weight:700;line-height:1.25;">Resumen ejecutivo de atencion</div>' +
                  '<div style="margin-top:10px;font-size:14px;opacity:.92;">Cierre formal de la incidencia registrada en el portal F-TIC-12.</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:24px 28px 6px;">' +
                  '<div style="font-size:15px;line-height:1.7;">Estimado/a <strong>' + solicitante + '</strong>,</div>' +
                  '<div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;">Se ha concluido la atencion de su requerimiento. A continuacion compartimos el resumen ejecutivo de la gestion realizada por el equipo TIC.</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:12px 28px 0;">' +
                  '<table role="presentation" style="width:100%;border-collapse:separate;border-spacing:12px 0;" cellpadding="0" cellspacing="0">' +
                    '<tr>' +
                      '<td style="width:33.33%;padding:14px 16px;border:1px solid #dbe4f0;border-radius:10px;background:#f8fbff;">' +
                        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;">Ticket</div>' +
                        '<div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">' + ticketId + '</div>' +
                      '</td>' +
                      '<td style="width:33.33%;padding:14px 16px;border:1px solid #dbe4f0;border-radius:10px;background:#f8fbff;">' +
                        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;">Estado</div>' +
                        '<div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">' + estado + '</div>' +
                      '</td>' +
                      '<td style="width:33.33%;padding:14px 16px;border:1px solid #dbe4f0;border-radius:10px;background:#f8fbff;">' +
                        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;">Fecha de cierre</div>' +
                        '<div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">' + fechaCierre + '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:24px 28px 10px;">' +
                  '<table role="presentation" style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">' +
                    '<tr><td colspan="2" style="padding:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;">Detalle de la atencion</td></tr>' +
                    '<tr><td style="width:34%;padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Fecha de reporte</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + fechaReporte + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Activo afectado</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + activo + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Tipo de problema</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + tipoProblema + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Tecnico responsable</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + tecnico + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Accion tomada</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + accion + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;">Estado final</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;color:#0f172a;">' + estadoFinal + '</td></tr>' +
                    '<tr><td style="padding:10px 12px;border:1px solid #d9e2ef;background:#f8fafc;font-size:12px;font-weight:700;color:#334155;vertical-align:top;">Diagnostico TIC</td><td style="padding:10px 12px;border:1px solid #d9e2ef;font-size:13px;line-height:1.65;color:#0f172a;">' + diagnostico + '</td></tr>' +
                    bloquePdf +
                  '</table>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:6px 28px 28px;font-size:13px;line-height:1.7;color:#475569;">Si requiere una validacion adicional o desea ampliar informacion sobre esta atencion, puede responder a este mensaje o contactar a <strong>' + NotificacionService_escapeHtml_(CONFIG.APP.SUPPORT_EMAIL || 'Mesa de Ayuda TIC') + '</strong>.</td>' +
              '</tr>' +
            '</table>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</div>';
}

function NotificacionService_escapeHtml_(valor) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function NotificacionService_valorTexto_(valor) {
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return Utils_formatFechaHora_(valor);
  }
  return String(valor || '').trim() || 'No consignado';
}
