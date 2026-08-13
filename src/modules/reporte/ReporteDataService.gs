function ReporteDataService_generarIdRegistro_(sheet, anio) {
  const mapa = SheetsService_getHeaderMap_(sheet);
  const columnaId = mapa.ID_REGISTRO + 1;
  const ultimaFila = sheet.getLastRow();
  const prefijo = 'REG-' + CONFIG.APP.CODIGO_FORMATO + '-' + anio + '-';
  let maxCorrelativo = 0;

  if (ultimaFila >= 2) {
    const valores = sheet.getRange(2, columnaId, ultimaFila - 1, 1).getValues();
    valores.forEach(function (fila) {
      const id = String(fila[0] || '');
      if (id.indexOf(prefijo) === 0) {
        const correlativo = Number(id.slice(prefijo.length));
        if (correlativo > maxCorrelativo) maxCorrelativo = correlativo;
      }
    });
  }

  return prefijo + String(maxCorrelativo + 1).padStart(5, '0');
}

function ReporteDataService_crearRegistro_(datos) {
  const lock = LockService.getScriptLock();
  let lockTomado = false;
  try {
    lock.waitLock(30000);
    lockTomado = true;

    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
    SheetsService_ensureHeaders_(sheet, CONFIG.HEADERS.REGISTROS);
    const ahora = Utils_now_();
    const anio = Utils_periodoAnio_(ahora);
    const idRegistro = ReporteDataService_generarIdRegistro_(sheet, anio);

    const fila = {
      ID_REGISTRO: idRegistro,
      FECHA_HORA_REPORTE: Utils_formatFechaHora_(ahora),
      FECHA_HORA_CIERRE: '',
      ESTADO_REGISTRO: ESTADOS_REGISTRO.ABIERTO,
      PERIODO_MES: Utils_periodoMes_(ahora),
      'PERIODO_A\u00d1O': anio,
      'PERIODO_AÃ‘O': anio,
      EMPRESA_DEL_GRUPO: datos.empresaDelGrupo,
      NOMBRE_COMPLETO_SOLICITANTE: datos.nombreCompleto,
      DNI_SOLICITANTE: datos.dni,
      CARGO_SOLICITANTE: datos.cargo,
      MOVIL_SOLICITANTE: datos.movil,
      CORREO_ELECTRONICO_SOLICITANTE: Utils_resolverCorreoSolicitante_(datos.correoElectronico, datos.sinCorreoCorporativo),
      PROYECTO_SEDE: datos.proyectoSede,
      CENTRO_DE_COSTO: datos.centroCosto,
      CECO_NUMERO: datos.cecoNumero || '',
      TIPO_EQUIPO: datos.tipoEquipo,
      ACTIVO_AFECTADO: datos.activoAfectado,
      TIPO_PROBLEMA: datos.tipoProblema,
      PRIORIDAD_USUARIO: datos.prioridad,
      DESCRIPCION_INCIDENCIA: datos.descripcion,
      ANYDESK_ID: datos.anydeskId || '',
      ANYDESK_PASSWORD: datos.anydeskPassword ? Utils_cifrarTextoSeguro_(datos.anydeskPassword) : '',
      SLA_APLICADO: ReporteDataService_slaAplicado_(datos.prioridad),
      DIAGNOSTICO_TIC: '',
      ACCION_TOMADA: '',
      ESTADO_FINAL: '',
      TECNICO_RESPONSABLE: '',
      CLASIFICACION_SEGURIDAD: false,
      CRITICIDAD_SEGURIDAD: '',
      MTTR_HORAS: '',
      CUMPLIO_SLA: '',
      APORTA_I_O_27: false,
      APORTA_I_O_45: false,
      LINK_PDF_REPORTE: '',
      HASH_SHA256_PDF: '',
      LINK_BITACORA_F_TIC_10: '',
      LINK_INVENTARIO_F_TIC_05: '',
      URL_EVIDENCIA_ADICIONAL: '',
      DIAS_DESDE_REPORTE: 0,
      FLAG_DENTRO_SLA: 'SI',
      CORREO_DESTINO_RESUMEN: '',
      FECHA_HORA_ENVIO_CORREO_RESUMEN: '',
      ESTADO_ENVIO_CORREO_RESUMEN: '',
      DETALLE_ENVIO_CORREO_RESUMEN: ''
    };

    const mapa = SheetsService_getHeaderMap_(sheet);
    const filaPorPosicion = new Array(sheet.getLastColumn()).fill('');
    CONFIG.HEADERS.REGISTROS.forEach(function (encabezado) {
      if (!(encabezado in mapa)) {
        throw new Error('La hoja "' + CONFIG.SHEETS.REGISTROS + '" no tiene la columna "' + encabezado + '".');
      }
      filaPorPosicion[mapa[encabezado]] = fila.hasOwnProperty(encabezado) ? fila[encabezado] : '';
    });
    if ('CECO_NUMERO' in mapa) {
      filaPorPosicion[mapa.CECO_NUMERO] = fila.CECO_NUMERO;
    }

    const siguienteFila = Math.max(sheet.getLastRow() + 1, 2);
    if (siguienteFila > sheet.getMaxRows()) {
      sheet.insertRowsAfter(sheet.getMaxRows(), siguienteFila - sheet.getMaxRows());
    }
    sheet.getRange(siguienteFila, 1, 1, filaPorPosicion.length).setValues([filaPorPosicion]);
    SpreadsheetApp.flush();
    return idRegistro;
  } catch (error) {
    throw new Error('ReporteDataService_crearRegistro_: ' + Utils_resumirErrorSeguro_(error));
  } finally {
    if (lockTomado) lock.releaseLock();
  }
}

function ReporteDataService_obtenerRegistroPorId_(idRegistro) {
  const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
  const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
  const fila = SheetsService_findRowByValue_(sheet, 'ID_REGISTRO', idRegistro);
  if (fila === -1) return null;

  const mapa = SheetsService_getHeaderMap_(sheet);
  const valores = sheet.getRange(fila, 1, 1, sheet.getLastColumn()).getValues()[0];
  return ReporteDataService_mapearFilaARegistro_(valores, mapa);
}

function ReporteDataService_listarRegistrosAdmin_(limite) {
  const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
  const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
  const mapa = SheetsService_getHeaderMap_(sheet);
  const ultimaFila = sheet.getLastRow();
  const cantidad = Math.max(1, Math.min(Number(limite) || 200, 200));

  if (ultimaFila < 2) {
    return { tickets: [], resumen: ReporteDataService_resumenAdmin_([]) };
  }

  const valores = sheet.getRange(2, 1, ultimaFila - 1, sheet.getLastColumn()).getValues();
  const tickets = valores.map(function (fila, indice) {
    const registro = ReporteDataService_mapearFilaARegistro_(fila, mapa);
    return ReporteDataService_mapearRegistroAdminDesdeRegistro_(registro, indice + 2);
  }).filter(function (ticket) {
    return !!ticket.idRegistro;
  });

  tickets.sort(ReporteDataService_compararTicketsAdmin_);

  return {
    tickets: tickets.slice(0, cantidad),
    resumen: ReporteDataService_resumenAdmin_(tickets)
  };
}

function ReporteDataService_actualizarGestionAdmin_(datos) {
  const lock = LockService.getScriptLock();
  let lockTomado = false;
  try {
    lock.waitLock(30000);
    lockTomado = true;

    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
    SheetsService_ensureHeaders_(sheet, CONFIG.HEADERS.REGISTROS);
    const idRegistro = String(datos.idRegistro || '').trim().toUpperCase();
    const fila = SheetsService_findRowByValue_(sheet, 'ID_REGISTRO', idRegistro);
    if (fila === -1) throw new Error('No se encontro el ticket solicitado.');

    const mapa = SheetsService_getHeaderMap_(sheet);
    const valoresActuales = sheet.getRange(fila, 1, 1, sheet.getLastColumn()).getValues()[0];
    const estadoActual = 'ESTADO_REGISTRO' in mapa ? String(valoresActuales[mapa.ESTADO_REGISTRO] || '').trim() : '';
    if (ReporteDataService_esEstadoTerminalBloqueado_(estadoActual)) {
      throw new Error('Regla fija de trazabilidad: el ticket ya esta en estado terminal "' + estadoActual + '" y no puede reabrirse ni modificarse.');
    }

    const estado = String(datos.estadoRegistro || '').trim();
    const estadosValidos = ReporteDataService_estadosRegistroVisibles_();
    if (estadosValidos.indexOf(estado) === -1) throw new Error('Estado de registro no valido.');

    const estadosPermitidos = ReporteDataService_estadosPermitidosDesde_(estadoActual);
    if (estadosPermitidos.indexOf(estado) === -1) {
      throw new Error('Transicion de estado no permitida. Flujo valido: Abierto -> En Atencion -> Resuelto.');
    }

    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'ESTADO_REGISTRO', estado);
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'TIPO_EQUIPO', datos.tipoEquipo || '');
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'PRIORIDAD_USUARIO', datos.prioridad || '');
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'SLA_APLICADO', ReporteDataService_slaAplicado_(datos.prioridad));
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'TECNICO_RESPONSABLE', datos.tecnicoResponsable || '');
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'DIAGNOSTICO_TIC', datos.diagnosticoTic || '');
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'ACCION_TOMADA', datos.accionTomada || '');
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'ESTADO_FINAL', datos.estadoFinal || '');

    if (ReporteDataService_esEstadoTerminal_(estado)) {
      const colCierre = mapa.FECHA_HORA_CIERRE;
      if (typeof colCierre === 'number') {
        const rangoCierre = sheet.getRange(fila, colCierre + 1);
        const actual = rangoCierre.getValue();
        if (!actual) rangoCierre.setValue(Utils_formatFechaHora_(Utils_now_()));
      }
    }

    SpreadsheetApp.flush();

    const registroActualizado = ReporteDataService_obtenerRegistroPorId_(idRegistro);
    ReporteDataService_actualizarCamposDerivados_(sheet, mapa, fila, registroActualizado);
    SpreadsheetApp.flush();

    let resultadoPdf = ReporteDataService_resultadoPdfSinIntento_();
    let resultadoCorreo = ReporteDataService_resultadoCorreoSinIntento_();
    if (ReporteDataService_esEstadoTerminal_(estado)) {
      const actualizadoParaPdf = ReporteDataService_obtenerRegistroPorId_(idRegistro);
      resultadoPdf = ReporteDataService_generarFormatoUnitarioSeguro_(sheet, mapa, fila, actualizadoParaPdf);
      const actualizadoParaCorreo = ReporteDataService_obtenerRegistroPorId_(idRegistro);
      resultadoCorreo = ReporteDataService_notificarCierreSeguro_(sheet, mapa, fila, actualizadoParaCorreo);
    }

    return {
      registro: ReporteDataService_obtenerRegistroPorId_(idRegistro),
      pdf: resultadoPdf,
      notificacionCorreo: resultadoCorreo
    };
  } finally {
    if (lockTomado) lock.releaseLock();
  }
}

function ReporteDataService_regenerarPdfTicketAdmin_(idRegistro) {
  const lock = LockService.getScriptLock();
  let lockTomado = false;
  try {
    lock.waitLock(30000);
    lockTomado = true;

    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
    const ticketId = String(idRegistro || '').trim().toUpperCase();
    const fila = SheetsService_findRowByValue_(sheet, 'ID_REGISTRO', ticketId);
    if (fila === -1) throw new Error('No se encontro el ticket solicitado.');

    const mapa = SheetsService_getHeaderMap_(sheet);
    const registro = ReporteDataService_obtenerRegistroPorId_(ticketId);
    const estadoActual = String(registro.ESTADO_REGISTRO || '').trim();
    if (!ReporteDataService_esEstadoTerminalBloqueado_(estadoActual)) {
      throw new Error('El PDF solo se puede generar cuando el ticket esta en estado terminal.');
    }

    ReporteDataService_actualizarCamposDerivados_(sheet, mapa, fila, registro);
    const resultadoPdf = ReporteDataService_generarFormatoUnitarioSeguro_(sheet, mapa, fila, registro);
    return {
      registro: ReporteDataService_obtenerRegistroPorId_(ticketId),
      pdf: resultadoPdf
    };
  } finally {
    if (lockTomado) lock.releaseLock();
  }
}

function ReporteDataService_esEstadoTerminal_(estado) {
  return CONFIG.TRACKING.TERMINAL_STATUSES.indexOf(String(estado || '').trim()) !== -1;
}

function ReporteDataService_esEstadoTerminalBloqueado_(estado) {
  const estadoTexto = String(estado || '').trim();
  return ReporteDataService_esEstadoTerminal_(estadoTexto) ||
    estadoTexto === ESTADOS_REGISTRO_LEGACY.CERRADO ||
    estadoTexto === ESTADOS_REGISTRO_LEGACY.ANULADO;
}

function ReporteDataService_estadosRegistroVisibles_() {
  return Object.keys(ESTADOS_REGISTRO).map(function (k) {
    return ESTADOS_REGISTRO[k];
  });
}

function ReporteDataService_estadosPermitidosDesde_(estadoActual) {
  const estadosVisibles = ReporteDataService_estadosRegistroVisibles_();
  const estadoNormalizado = ReporteDataService_normalizarEstadoRegistro_(estadoActual);

  if (estadoNormalizado === ESTADOS_REGISTRO.ABIERTO) {
    return [ESTADOS_REGISTRO.ABIERTO, ESTADOS_REGISTRO.EN_ATENCION];
  }

  if (estadoNormalizado === ESTADOS_REGISTRO.EN_ATENCION) {
    return [ESTADOS_REGISTRO.EN_ATENCION, ESTADOS_REGISTRO.RESUELTO];
  }

  if (estadoNormalizado === ESTADOS_REGISTRO.RESUELTO) {
    return [ESTADOS_REGISTRO.RESUELTO];
  }

  return estadosVisibles.slice();
}

function ReporteDataService_puedeMostrarContactoAdmin_(estadoActual) {
  return ReporteDataService_normalizarEstadoRegistro_(estadoActual) !== ESTADOS_REGISTRO.ABIERTO;
}

function ReporteDataService_normalizarEstadoRegistro_(estado) {
  const estadoTexto = String(estado || '').trim();
  const estadoLower = estadoTexto.toLowerCase();

  if (estadoLower === 'abierto') return ESTADOS_REGISTRO.ABIERTO;
  if (estadoLower === 'en atencion' || estadoLower === 'en atenci\u00f3n') return ESTADOS_REGISTRO.EN_ATENCION;
  if (estadoLower === 'pendiente') return ESTADOS_REGISTRO.EN_ATENCION;
  if (estadoLower === 'resuelto' || estadoLower === 'cerrado' || estadoLower === 'anulado') return ESTADOS_REGISTRO.RESUELTO;

  return estadoTexto;
}

function ReporteDataService_setCellIfHeader_(sheet, mapa, fila, encabezado, valor) {
  if (!(encabezado in mapa)) return;
  sheet.getRange(fila, mapa[encabezado] + 1).setValue(valor);
}

function ReporteDataService_actualizarCamposDerivados_(sheet, mapa, fila, registro) {
  const metricas = ReporteDataService_calcularMetricasSlaDesdeRegistro_(registro);

  if ('DIAS_DESDE_REPORTE' in mapa) {
    sheet.getRange(fila, mapa.DIAS_DESDE_REPORTE + 1).setValue(metricas.diasDesdeReporte === '' ? '' : metricas.diasDesdeReporte);
  }

  if ('FLAG_DENTRO_SLA' in mapa) {
    sheet.getRange(fila, mapa.FLAG_DENTRO_SLA + 1).setValue(metricas.flagDentroSla || '');
  }

  if ('MTTR_HORAS' in mapa) {
    sheet.getRange(fila, mapa.MTTR_HORAS + 1).setValue(metricas.mttrHoras === '' ? '' : metricas.mttrHoras);
  }

  if ('CUMPLIO_SLA' in mapa) {
    sheet.getRange(fila, mapa.CUMPLIO_SLA + 1).setValue(metricas.cumplioSla || '');
  }

  return metricas;
}

function ReporteDataService_generarFormatoUnitarioSeguro_(sheet, mapa, fila, registro) {
  try {
    const generado = FormatoService_generarPdfRegistro_(registro);
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'LINK_PDF_REPORTE', generado.pdfUrl);
    ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'HASH_SHA256_PDF', generado.hash);
    SpreadsheetApp.flush();
    return {
      intentado: true,
      ok: true,
      message: 'PDF F-TIC-12 generado correctamente.',
      pdfUrl: generado.pdfUrl,
      hash: generado.hash
    };
  } catch (error) {
    LogService_error_('ReporteDataService_generarFormatoUnitarioSeguro_', error, {
      idRegistro: registro.ID_REGISTRO || ''
    });
    return {
      intentado: true,
      ok: false,
      message: ReporteDataService_mensajeErrorPdf_(error),
      error: Utils_resumirErrorSeguro_(error)
    };
  }
}

function ReporteDataService_notificarCierreSeguro_(sheet, mapa, fila, registro) {
  try {
    const resultado = NotificacionService_enviarResumenAtencion_(registro);
    ReporteDataService_registrarResultadoCorreoResumen_(sheet, mapa, fila, resultado);
    SpreadsheetApp.flush();

    if (resultado.ok) {
      LogService_evento_('ENVIO_CORREO_RESUMEN', registro.ID_REGISTRO || '', 'OK', resultado.message, {
        to: resultado.email || ''
      });
    } else if (resultado.skipped) {
      LogService_evento_('ENVIO_CORREO_RESUMEN', registro.ID_REGISTRO || '', 'OMITIDO', resultado.message, {
        to: resultado.email || ''
      });
    }

    return resultado;
  } catch (error) {
    const resultadoError = {
      ok: false,
      intentado: true,
      skipped: false,
      status: 'ERROR_ENVIO',
      email: Utils_normalizarCorreo_(registro && registro.CORREO_ELECTRONICO_SOLICITANTE),
      sentAt: '',
      message: 'No se pudo enviar el correo resumen al solicitante.',
      technicalDetail: Utils_resumirErrorSeguro_(error)
    };
    ReporteDataService_registrarResultadoCorreoResumen_(sheet, mapa, fila, resultadoError);
    SpreadsheetApp.flush();
    LogService_error_('ReporteDataService_notificarCierreSeguro_', error, {
      idRegistro: registro && registro.ID_REGISTRO || '',
      correoDestino: resultadoError.email || ''
    });
    return resultadoError;
  }
}

function ReporteDataService_resultadoPdfSinIntento_() {
  return {
    intentado: false,
    ok: false,
    message: ''
  };
}

function ReporteDataService_resultadoCorreoSinIntento_() {
  return {
    intentado: false,
    ok: false,
    skipped: false,
    status: '',
    email: '',
    sentAt: '',
    message: ''
  };
}

function ReporteDataService_registrarResultadoCorreoResumen_(sheet, mapa, fila, resultado) {
  ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'CORREO_DESTINO_RESUMEN', resultado && resultado.email || '');
  ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'FECHA_HORA_ENVIO_CORREO_RESUMEN', resultado && resultado.sentAt || '');
  ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'ESTADO_ENVIO_CORREO_RESUMEN', resultado && resultado.status || '');
  ReporteDataService_setCellIfHeader_(sheet, mapa, fila, 'DETALLE_ENVIO_CORREO_RESUMEN', resultado && (resultado.technicalDetail || resultado.message) || '');
}

function ReporteDataService_mensajeErrorPdf_(error) {
  const texto = String(error && error.message ? error.message : error || '');
  if (texto.indexOf('DriveApp.getFolderById') !== -1 || texto.indexOf('Permisos necesarios') !== -1) {
    return 'No se pudo generar el PDF F-TIC-12 porque el despliegue todavia no tiene autorizados los permisos de Drive. Ejecuta la funcion autorizarServiciosPdf() en el editor de Apps Script con la cuenta propietaria y luego reintenta.';
  }
  return 'No se pudo generar el PDF F-TIC-12. Revisa la plantilla y la carpeta de Drive antes de reintentar.';
}

function ReporteDataService_mapearFilaARegistro_(fila, mapa) {
  const registro = {};
  Object.keys(mapa).forEach(function (encabezado) {
    registro[encabezado] = fila[mapa[encabezado]];
  });
  return registro;
}

function ReporteDataService_mapearRegistroAdminDesdeRegistro_(registro, numeroFila) {
  function v(encabezado) {
    return ReporteDataService_valorTexto_(registro[encabezado]);
  }

  const metricas = ReporteDataService_calcularMetricasSlaDesdeRegistro_(registro);
  const estadoOriginal = v('ESTADO_REGISTRO');
  const mostrarContacto = ReporteDataService_puedeMostrarContactoAdmin_(estadoOriginal);
  const tipoEquipoResuelto = ReporteDataService_resolverTipoEquipoRegistro_(registro);

  return {
    rowNumber: numeroFila || '',
    idRegistro: v('ID_REGISTRO'),
    fechaHoraReporte: v('FECHA_HORA_REPORTE'),
    fechaHoraCierre: v('FECHA_HORA_CIERRE'),
    estadoRegistro: ReporteDataService_normalizarEstadoRegistro_(estadoOriginal),
    estadoRegistroOriginal: estadoOriginal,
    empresaDelGrupo: v('EMPRESA_DEL_GRUPO'),
    nombreCompletoSolicitante: mostrarContacto ? v('NOMBRE_COMPLETO_SOLICITANTE') : '',
    dniSolicitante: mostrarContacto ? v('DNI_SOLICITANTE') : '',
    cargoSolicitante: v('CARGO_SOLICITANTE'),
    movilSolicitante: mostrarContacto ? v('MOVIL_SOLICITANTE') : '',
    correoElectronicoSolicitante: mostrarContacto ? v('CORREO_ELECTRONICO_SOLICITANTE') : '',
    proyectoSede: v('PROYECTO_SEDE'),
    centroCosto: v('CENTRO_DE_COSTO'),
    tipoEquipo: tipoEquipoResuelto,
    activoAfectado: v('ACTIVO_AFECTADO'),
    tipoProblema: v('TIPO_PROBLEMA'),
    prioridadUsuario: v('PRIORIDAD_USUARIO'),
    descripcionIncidencia: v('DESCRIPCION_INCIDENCIA'),
    slaAplicado: v('SLA_APLICADO'),
    tecnicoResponsable: v('TECNICO_RESPONSABLE'),
    diagnosticoTic: v('DIAGNOSTICO_TIC'),
    accionTomada: v('ACCION_TOMADA'),
    estadoFinal: v('ESTADO_FINAL'),
    linkPdfReporte: v('LINK_PDF_REPORTE'),
    slaHorasObjetivo: metricas.slaHorasObjetivo,
    horasTranscurridas: metricas.horasTranscurridas,
    horasRestantes: metricas.horasRestantes,
    alertaSla: metricas.alertaSla,
    indicadorSla: ReporteDataService_indicadorSlaLabel_(metricas),
    esTerminal: metricas.esTerminal,
    flagDentroSla: metricas.flagDentroSla,
    cumplioSla: metricas.cumplioSla,
    diasDesdeReporte: metricas.diasDesdeReporte,
    mttrHoras: metricas.mttrHoras,
    reportTimestamp: metricas.reportTimestamp,
    estadosPermitidos: ReporteDataService_estadosPermitidosDesde_(estadoOriginal),
    contactoVisible: mostrarContacto
  };
}

function ReporteDataService_resumenAdmin_(tickets) {
  const resumen = {
    total: tickets.length,
    activos: 0,
    vencidosSla: 0,
    resueltos: 0
  };

  tickets.forEach(function (ticket) {
    if (ticket.esTerminal) {
      resumen.resueltos++;
      return;
    }

    resumen.activos++;
    if (ticket.alertaSla === 'VENCIDO') resumen.vencidosSla++;
  });

  return resumen;
}

function ReporteDataService_compararTicketsAdmin_(a, b) {
  if (!!a.esTerminal !== !!b.esTerminal) {
    return a.esTerminal ? 1 : -1;
  }

  if (!a.esTerminal && !b.esTerminal) {
    const aVencido = a.alertaSla === 'VENCIDO' ? 1 : 0;
    const bVencido = b.alertaSla === 'VENCIDO' ? 1 : 0;
    if (aVencido !== bVencido) return bVencido - aVencido;

    const horasA = typeof a.horasTranscurridas === 'number' ? a.horasTranscurridas : -1;
    const horasB = typeof b.horasTranscurridas === 'number' ? b.horasTranscurridas : -1;
    if (horasA !== horasB) return horasB - horasA;

    const stampA = typeof a.reportTimestamp === 'number' ? a.reportTimestamp : Number.MAX_SAFE_INTEGER;
    const stampB = typeof b.reportTimestamp === 'number' ? b.reportTimestamp : Number.MAX_SAFE_INTEGER;
    if (stampA !== stampB) return stampA - stampB;
  }

  const cierreA = ReporteDataService_parseFechaSeguro_(a.fechaHoraCierre);
  const cierreB = ReporteDataService_parseFechaSeguro_(b.fechaHoraCierre);
  if (cierreA && cierreB && cierreA.getTime() !== cierreB.getTime()) {
    return cierreB.getTime() - cierreA.getTime();
  }

  return String(a.idRegistro || '').localeCompare(String(b.idRegistro || ''));
}

function ReporteDataService_calcularMetricasSlaDesdeRegistro_(registro, fechaReferencia) {
  const referencia = fechaReferencia || Utils_now_();
  const estadoNormalizado = ReporteDataService_normalizarEstadoRegistro_(registro.ESTADO_REGISTRO);
  const estadoOriginal = String(registro.ESTADO_REGISTRO || '').trim();
  const esTerminal = ReporteDataService_esEstadoTerminalBloqueado_(estadoOriginal);
  const fechaReporte = ReporteDataService_parseFechaSeguro_(registro.FECHA_HORA_REPORTE);
  const fechaCierre = ReporteDataService_parseFechaSeguro_(registro.FECHA_HORA_CIERRE);
  const slaHorasObjetivo = ReporteDataService_slaHorasObjetivo_(registro);

  const metricas = {
    estadoOriginal: estadoOriginal,
    estadoNormalizado: estadoNormalizado,
    esTerminal: esTerminal,
    slaHorasObjetivo: slaHorasObjetivo,
    horasTranscurridas: '',
    horasRestantes: '',
    alertaSla: '',
    flagDentroSla: '',
    cumplioSla: '',
    diasDesdeReporte: '',
    mttrHoras: '',
    reportTimestamp: fechaReporte ? fechaReporte.getTime() : null
  };

  if (!fechaReporte) {
    return metricas;
  }

  const fechaBase = esTerminal ? fechaCierre : referencia;
  if (!fechaBase) {
    metricas.diasDesdeReporte = 0;
    return metricas;
  }

  const msTranscurridos = Math.max(0, fechaBase.getTime() - fechaReporte.getTime());
  const horasTranscurridas = ReporteDataService_redondearHoras_(msTranscurridos / 3600000);
  metricas.horasTranscurridas = horasTranscurridas;
  metricas.diasDesdeReporte = Math.floor(msTranscurridos / 86400000);

  if (!slaHorasObjetivo) {
    return metricas;
  }

  const horasRestantes = ReporteDataService_redondearHoras_(slaHorasObjetivo - horasTranscurridas);
  metricas.horasRestantes = horasRestantes;
  metricas.flagDentroSla = horasRestantes >= 0 ? 'SI' : 'NO';

  if (esTerminal) {
    metricas.mttrHoras = horasTranscurridas;
    metricas.cumplioSla = horasRestantes >= 0 ? 'SI' : 'NO';
    return metricas;
  }

  metricas.alertaSla = horasRestantes >= 0 ? 'EN_SLA' : 'VENCIDO';
  return metricas;
}

function ReporteDataService_indicadorSlaLabel_(metricas) {
  if (!metricas || !metricas.slaHorasObjetivo) return '';
  if (metricas.alertaSla === 'VENCIDO') return 'Vencido';
  if (metricas.alertaSla === 'EN_SLA') return 'Dentro de SLA';
  if (metricas.cumplioSla === 'NO' || metricas.flagDentroSla === 'NO') return 'Vencido';
  if (metricas.cumplioSla === 'SI' || metricas.flagDentroSla === 'SI') return 'Dentro de SLA';
  return '';
}

function ReporteDataService_parseFechaSeguro_(valor) {
  if (!valor) return null;

  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return isNaN(valor.getTime()) ? null : valor;
  }

  const texto = String(valor || '').trim();
  if (!texto) return null;

  let match = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    );
  }

  match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    );
  }

  const fecha = new Date(texto);
  return isNaN(fecha.getTime()) ? null : fecha;
}

function ReporteDataService_redondearHoras_(valor) {
  return Math.round(Number(valor || 0) * 100) / 100;
}

function ReporteDataService_valorTexto_(valor) {
  if (Object.prototype.toString.call(valor) === '[object Date]') return Utils_formatFechaHora_(valor);
  return String(valor || '');
}

function ReporteDataService_slaAplicado_(prioridad) {
  const prioridadNormalizada = String(prioridad || '').trim();
  if (prioridadNormalizada === 'Alta') return 'Alta 2h';
  if (prioridadNormalizada === 'Media') return 'Media 4h';
  if (prioridadNormalizada === 'Baja') return 'Baja 8h';
  return '';
}

function ReporteDataService_slaHorasObjetivo_(registro) {
  const slaAplicado = String((registro && registro.SLA_APLICADO) || '').trim();
  const match = slaAplicado.match(/(\d+(?:\.\d+)?)\s*h/i);
  if (match) return Number(match[1]);

  return ReporteDataService_slaHorasObjetivoDesdePrioridad_(registro && registro.PRIORIDAD_USUARIO);
}

function ReporteDataService_slaHorasObjetivoDesdePrioridad_(prioridad) {
  const prioridadNormalizada = String(prioridad || '').trim();
  if (prioridadNormalizada === 'Alta') return 2;
  if (prioridadNormalizada === 'Media') return 4;
  if (prioridadNormalizada === 'Baja') return 8;
  return 0;
}

function ReporteDataService_resolverTipoEquipoRegistro_(registro) {
  return ReporteService_resolverTipoEquipoAutomatico_(
    ReporteDataService_valorTexto_(registro && registro.TIPO_EQUIPO),
    '',
    ReporteDataService_valorTexto_(registro && registro.ACTIVO_AFECTADO)
  );
}

function ReporteDataService_obtenerCorreoRecordadoPorDni_(dni) {
  const dniNormalizado = Utils_normalizarDni_(dni);
  if (dniNormalizado.length !== CONFIG.VALIDATION.DNI_LENGTH) return '';

  try {
    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = SheetsService_getSheet_(ss, CONFIG.SHEETS.REGISTROS);
    const mapa = SheetsService_getHeaderMap_(sheet);
    if (!('DNI_SOLICITANTE' in mapa) || !('CORREO_ELECTRONICO_SOLICITANTE' in mapa)) return '';

    const ultimaFila = sheet.getLastRow();
    if (ultimaFila < 2) return '';

    const cantidadFilas = ultimaFila - 1;
    const dnis = sheet.getRange(2, mapa.DNI_SOLICITANTE + 1, cantidadFilas, 1).getValues();
    const correos = sheet.getRange(2, mapa.CORREO_ELECTRONICO_SOLICITANTE + 1, cantidadFilas, 1).getValues();

    for (let i = cantidadFilas - 1; i >= 0; i--) {
      if (Utils_normalizarDni_(dnis[i][0]) !== dniNormalizado) continue;
      const correo = Utils_normalizarCorreo_(correos[i][0]);
      if (Utils_esCorreoCorporativoPermitido_(correo)) return correo;
    }
  } catch (error) {
    LogService_error_('ReporteDataService_obtenerCorreoRecordadoPorDni_', error, { dni: dniNormalizado });
  }

  return '';
}
