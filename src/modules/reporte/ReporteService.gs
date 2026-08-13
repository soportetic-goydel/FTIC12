function ReporteService_obtenerCatalogos() {
  try {
    return ResponseService_ok_({
      tiposEquipo: TIPOS_EQUIPO,
      tiposProblema: TIPOS_PROBLEMA,
      tiposProblemaPorActivo: TIPOS_PROBLEMA_POR_ACTIVO,
      prioridades: PRIORIDADES_USUARIO,
      empresas: EMPRESAS_GRUPO
    }, 'Catalogos obtenidos.');
  } catch (error) {
    return ResponseService_error_(error, 'No se pudieron obtener los catalogos del formulario.');
  }
}

function ReporteService_crearReporte(payload) {
  try {
    const datos = ReporteMapper_desdeCliente_(payload);
    const validacion = ReporteValidator_validar_(datos);
    if (!validacion.valido) {
      return ResponseService_error_('', validacion.errores.join(' '), RESPONSE_CODES.VALIDACION);
    }

    const activoValidado = ActivosService_resolverActivoSeleccionadoPorDni_(datos.dni, datos.activoSeleccionadoId);
    if (!activoValidado.ok) {
      return ResponseService_error_('', activoValidado.message, activoValidado.code || RESPONSE_CODES.VALIDACION);
    }

    const validacionTipoProblema = ReporteService_validarTipoProblemaPorActivo_(datos.tipoProblema, activoValidado.result.assetKind);
    if (!validacionTipoProblema.ok) {
      return ResponseService_error_('', validacionTipoProblema.message, RESPONSE_CODES.VALIDACION);
    }

    datos.activoAfectado = activoValidado.result.activoAfectado || '';
    datos.tipoEquipo = ReporteService_resolverTipoEquipoAutomatico_(datos.tipoEquipo, activoValidado.result.assetKind, datos.activoAfectado);
    const idRegistro = ReporteDataService_crearRegistro_(datos);
    LogService_evento_('CREAR_REPORTE', idRegistro, 'OK', 'Reporte creado por el solicitante.', { dni: datos.dni });

    return ResponseService_ok_({ idRegistro: idRegistro }, 'Reporte registrado correctamente. NÂ° ' + idRegistro);
  } catch (error) {
    LogService_error_('ReporteService_crearReporte', error, { payload: payload });
    return ResponseService_error_(error, 'No se pudo registrar el reporte. Intenta nuevamente o consulta con soporte TIC.');
  }
}

function ReporteService_listarActivosPorDni(payload) {
  try {
    payload = payload || {};
    return ActivosService_listarCatalogoPorDni_(payload.dni);
  } catch (error) {
    LogService_error_('ReporteService_listarActivosPorDni', error, { payload: payload });
    return ResponseService_error_(error, 'No se pudo obtener el catalogo de activos del colaborador.');
  }
}

function ReporteService_obtenerSeguimientoPublico(payload) {
  try {
    payload = payload || {};
    const idRegistro = String(payload.idRegistro || '').trim().toUpperCase();
    const dni = Utils_normalizarDni_(payload.dni);

    if (!idRegistro) {
      return ResponseService_error_('', 'Ingresa el numero de ticket.', RESPONSE_CODES.VALIDACION);
    }

    if (dni.length !== CONFIG.VALIDATION.DNI_LENGTH) {
      return ResponseService_error_('', 'Ingresa un DNI valido.', RESPONSE_CODES.VALIDACION);
    }

    const registro = ReporteDataService_obtenerRegistroPorId_(idRegistro);
    if (!registro) {
      return ResponseService_error_('', 'No se encontro el ticket solicitado.', RESPONSE_CODES.NO_ENCONTRADO);
    }

    if (String(registro.DNI_SOLICITANTE || '').trim() !== dni) {
      return ResponseService_error_('', 'El DNI no coincide con el ticket consultado.', RESPONSE_CODES.VALIDACION);
    }

    return ResponseService_ok_({
      idRegistro: ReporteDataService_valorTexto_(registro.ID_REGISTRO),
      estadoRegistro: ReporteDataService_normalizarEstadoRegistro_(registro.ESTADO_REGISTRO),
      fechaHoraReporte: ReporteDataService_valorTexto_(registro.FECHA_HORA_REPORTE),
      fechaHoraCierre: ReporteDataService_valorTexto_(registro.FECHA_HORA_CIERRE),
      empresaDelGrupo: ReporteDataService_valorTexto_(registro.EMPRESA_DEL_GRUPO),
      nombreCompletoSolicitante: ReporteDataService_valorTexto_(registro.NOMBRE_COMPLETO_SOLICITANTE),
      cargoSolicitante: ReporteDataService_valorTexto_(registro.CARGO_SOLICITANTE),
      movilSolicitante: ReporteDataService_valorTexto_(registro.MOVIL_SOLICITANTE),
      correoElectronicoSolicitante: ReporteDataService_valorTexto_(registro.CORREO_ELECTRONICO_SOLICITANTE),
      proyectoSede: ReporteDataService_valorTexto_(registro.PROYECTO_SEDE),
      centroCosto: ReporteDataService_valorTexto_(registro.CENTRO_DE_COSTO),
      tipoEquipo: ReporteDataService_resolverTipoEquipoRegistro_(registro),
      activoAfectado: ReporteDataService_valorTexto_(registro.ACTIVO_AFECTADO),
      tipoProblema: ReporteDataService_valorTexto_(registro.TIPO_PROBLEMA),
      prioridadUsuario: ReporteDataService_valorTexto_(registro.PRIORIDAD_USUARIO),
      slaAplicado: ReporteDataService_valorTexto_(registro.SLA_APLICADO),
      descripcionIncidencia: ReporteDataService_valorTexto_(registro.DESCRIPCION_INCIDENCIA),
      tecnicoResponsable: ReporteDataService_valorTexto_(registro.TECNICO_RESPONSABLE),
      diagnosticoTic: ReporteDataService_valorTexto_(registro.DIAGNOSTICO_TIC),
      accionTomada: ReporteDataService_valorTexto_(registro.ACCION_TOMADA),
      estadoFinal: ReporteDataService_valorTexto_(registro.ESTADO_FINAL),
      linkPdfReporte: ReporteDataService_valorTexto_(registro.LINK_PDF_REPORTE)
    }, 'Seguimiento obtenido correctamente.');
  } catch (error) {
    LogService_error_('ReporteService_obtenerSeguimientoPublico', error, { payload: payload });
    return ResponseService_error_(error, 'No se pudo obtener el seguimiento del ticket.');
  }
}

function ReporteService_adminListarTickets(payload) {
  try {
    payload = payload || {};
    const acceso = ReporteService_validarAccesoAdmin_(payload.codigoAcceso);
    if (!acceso.ok) return acceso;

    const data = ReporteDataService_listarRegistrosAdmin_(payload.limite);
    return ResponseService_ok_({
      tickets: data.tickets,
      resumen: data.resumen,
      estadosRegistro: ReporteDataService_estadosRegistroVisibles_(),
      tiposEquipo: TIPOS_EQUIPO,
      tecnicosTic: TECNICOS_TIC,
      prioridades: PRIORIDADES_USUARIO,
      estadosFinales: ESTADOS_FINALES,
      accionesTomadas: ACCIONES_TOMADAS
    }, 'Tickets obtenidos correctamente.');
  } catch (error) {
    LogService_error_('ReporteService_adminListarTickets', error, {});
    return ResponseService_error_(error, 'No se pudo cargar el consolidado de tickets.');
  }
}

function ReporteService_adminActualizarTicket(payload) {
  try {
    payload = payload || {};
    const acceso = ReporteService_validarAccesoAdmin_(payload.codigoAcceso);
    if (!acceso.ok) return acceso;

    const datos = {
      idRegistro: String(payload.idRegistro || '').trim().toUpperCase(),
      estadoRegistro: String(payload.estadoRegistro || '').trim(),
      tipoEquipo: String(payload.tipoEquipo || '').trim(),
      prioridad: String(payload.prioridad || '').trim(),
      tecnicoResponsable: String(payload.tecnicoResponsable || '').trim(),
      diagnosticoTic: String(payload.diagnosticoTic || '').trim(),
      accionTomada: String(payload.accionTomada || '').trim(),
      estadoFinal: String(payload.estadoFinal || '').trim()
    };

    if (!datos.idRegistro) {
      return ResponseService_error_('', 'Selecciona un ticket para actualizar.', RESPONSE_CODES.VALIDACION);
    }

    const registroActual = ReporteDataService_obtenerRegistroPorId_(datos.idRegistro);
    if (!registroActual) {
      return ResponseService_error_('', 'No se encontro el ticket solicitado.', RESPONSE_CODES.NO_ENCONTRADO);
    }

    datos.tipoEquipo = ReporteService_resolverTipoEquipoAutomatico_(
      datos.tipoEquipo,
      '',
      ReporteDataService_valorTexto_(registroActual.ACTIVO_AFECTADO)
    );

    if (datos.tipoEquipo && TIPOS_EQUIPO.indexOf(datos.tipoEquipo) === -1) {
      return ResponseService_error_('', 'El tipo de equipo seleccionado no es valido.', RESPONSE_CODES.VALIDACION);
    }

    if (datos.tecnicoResponsable && TECNICOS_TIC.indexOf(datos.tecnicoResponsable) === -1) {
      return ResponseService_error_('', 'El tecnico responsable seleccionado no es valido.', RESPONSE_CODES.VALIDACION);
    }

    if (datos.prioridad && PRIORIDADES_USUARIO.indexOf(datos.prioridad) === -1) {
      return ResponseService_error_('', 'La prioridad seleccionada no es valida.', RESPONSE_CODES.VALIDACION);
    }

    if (CONFIG.TRACKING.TERMINAL_STATUSES.indexOf(datos.estadoRegistro) !== -1) {
      const erroresCierre = [];
      if (!datos.tipoEquipo) erroresCierre.push('tipo de equipo');
      if (!datos.prioridad) erroresCierre.push('prioridad');
      if (!datos.tecnicoResponsable) erroresCierre.push('tecnico responsable');
      if (!datos.diagnosticoTic) erroresCierre.push('diagnostico TIC');
      if (!datos.accionTomada) erroresCierre.push('accion tomada');
      if (!datos.estadoFinal) erroresCierre.push('estado final');
      if (erroresCierre.length) {
        return ResponseService_error_('', 'Para cerrar/resolver completa: ' + erroresCierre.join(', ') + '.', RESPONSE_CODES.VALIDACION);
      }
    }

    const actualizado = ReporteDataService_actualizarGestionAdmin_(datos);
    LogService_evento_('ADMIN_ACTUALIZAR_TICKET', datos.idRegistro, 'OK', 'Gestion TIC actualizada.', { estado: datos.estadoRegistro });

    let mensaje = 'Ticket actualizado correctamente.';
    if (actualizado.pdf && actualizado.pdf.intentado && !actualizado.pdf.ok) {
      mensaje = 'Ticket actualizado, pero el PDF F-TIC-12 no se pudo generar. Puedes reintentarlo desde el panel TIC.';
    } else if (actualizado.notificacionCorreo && actualizado.notificacionCorreo.ok) {
      mensaje = 'Ticket actualizado y correo resumen enviado correctamente al solicitante.';
    } else if (actualizado.notificacionCorreo && actualizado.notificacionCorreo.status === 'OMITIDO_SIN_CORREO') {
      mensaje = 'Ticket actualizado correctamente. No se envio el correo resumen porque el ticket no tiene un correo registrado.';
    } else if (actualizado.notificacionCorreo && actualizado.notificacionCorreo.status === 'OMITIDO_CORREO_INVALIDO') {
      mensaje = 'Ticket actualizado correctamente. No se envio el correo resumen porque el correo registrado no es valido.';
    } else if (actualizado.notificacionCorreo && actualizado.notificacionCorreo.status === 'ERROR_ENVIO') {
      mensaje = 'Ticket actualizado correctamente, pero no se pudo enviar el correo resumen al solicitante.';
    }

    return ResponseService_ok_({
      ticket: ReporteService_mapearRegistroAdminDesdeObjeto_(actualizado.registro),
      pdf: actualizado.pdf,
      notificacionCorreo: actualizado.notificacionCorreo
    }, mensaje);
  } catch (error) {
    LogService_error_('ReporteService_adminActualizarTicket', error, {});
    return ResponseService_error_(error, 'No se pudo actualizar el ticket.');
  }
}

function ReporteService_adminRegenerarPdfTicket(payload) {
  try {
    payload = payload || {};
    const acceso = ReporteService_validarAccesoAdmin_(payload.codigoAcceso);
    if (!acceso.ok) return acceso;

    const idRegistro = String(payload.idRegistro || '').trim().toUpperCase();
    if (!idRegistro) {
      return ResponseService_error_('', 'Selecciona un ticket para generar el PDF.', RESPONSE_CODES.VALIDACION);
    }

    const actualizado = ReporteDataService_regenerarPdfTicketAdmin_(idRegistro);
    if (!actualizado.pdf || !actualizado.pdf.ok) {
      return ResponseService_error_(
        actualizado.pdf && actualizado.pdf.error ? actualizado.pdf.error : '',
        actualizado.pdf && actualizado.pdf.message ? actualizado.pdf.message : 'No se pudo generar el PDF F-TIC-12.'
      );
    }

    LogService_evento_('ADMIN_REGENERAR_PDF_TICKET', idRegistro, 'OK', 'PDF F-TIC-12 generado/reintentado desde el panel TIC.', {});
    return ResponseService_ok_({
      ticket: ReporteService_mapearRegistroAdminDesdeObjeto_(actualizado.registro),
      pdf: actualizado.pdf
    }, 'PDF F-TIC-12 generado correctamente.');
  } catch (error) {
    LogService_error_('ReporteService_adminRegenerarPdfTicket', error, {});
    return ResponseService_error_(error, 'No se pudo generar el PDF F-TIC-12.');
  }
}

function ReporteService_validarAccesoAdmin_(codigoAcceso) {
  const codigoConfigurado = PropertiesService.getScriptProperties().getProperty(CONFIG.SEGURIDAD.ADMIN_ACCESS_CODE_PROPERTY);
  if (!codigoConfigurado) {
    return ResponseService_error_('', 'Panel TIC pendiente de activacion: configura Script Property ADMIN_ACCESS_CODE.', RESPONSE_CODES.VALIDACION);
  }

  if (String(codigoAcceso || '').trim() !== String(codigoConfigurado).trim()) {
    return ResponseService_error_('', 'Codigo de acceso TIC no valido.', RESPONSE_CODES.VALIDACION);
  }

  return ResponseService_ok_({}, 'Acceso TIC validado.');
}

function ReporteService_mapearRegistroAdminDesdeObjeto_(registro) {
  return ReporteDataService_mapearRegistroAdminDesdeRegistro_(registro);
}

function ReporteService_validarTipoProblemaPorActivo_(tipoProblema, assetKind) {
  const valor = String(tipoProblema || '').trim();
  const opciones = ReporteService_obtenerOpcionesTipoProblemaPorAssetKind_(assetKind);
  if (!valor) {
    return ResponseService_error_('', 'Selecciona el tipo de problema.', RESPONSE_CODES.VALIDACION);
  }

  const permitidoDirecto = opciones.some(function (opcion) {
    return String(opcion.value || '').trim() === valor;
  });
  if (permitidoDirecto) {
    return ResponseService_ok_({}, 'Tipo de problema valido para el activo.');
  }

  const categoriasBasePermitidas = {};
  opciones.forEach(function (opcion) {
    const categoria = String(opcion.category || '').trim();
    if (categoria) categoriasBasePermitidas[categoria] = true;
  });

  if (categoriasBasePermitidas[valor]) {
    return ResponseService_ok_({}, 'Tipo de problema legacy valido para el activo.');
  }

  return ResponseService_error_(
    '',
    'El tipo de problema no corresponde al activo seleccionado. Elige una categoria valida para ese equipo.',
    RESPONSE_CODES.VALIDACION
  );
}

function ReporteService_obtenerOpcionesTipoProblemaPorAssetKind_(assetKind) {
  const clave = TIPOS_PROBLEMA_ASSET_KIND_MAP[String(assetKind || '').trim().toLowerCase()] || '';
  return (TIPOS_PROBLEMA_POR_ACTIVO[clave] || []).slice();
}

function ReporteService_resolverTipoEquipoAutomatico_(tipoEquipoActual, assetKind, activoAfectado) {
  const tipoEquipo = String(tipoEquipoActual || '').trim();
  if (tipoEquipo) return tipoEquipo;

  const kind = String(assetKind || '').trim().toLowerCase();
  if (kind === 'smartphone') return 'Smartphone';
  if (kind === 'printer') return 'Impresora';
  if (kind === 'scanner') return 'Escaner';
  if (kind === 'consulta') return 'Programas';
  if (kind === 'otro') return 'Otro';
  if (kind === 'pc') return 'PC-Portatil';

  const activo = FormatoService_normalizarClave_(activoAfectado);
  if (!activo) return '';
  if (activo.indexOf('ESCANER') !== -1 || activo.indexOf('SCANER') !== -1) return 'Escaner';
  if (activo.indexOf('IMPRESORA') !== -1) return 'Impresora';
  if (activo.indexOf('SMARTPHONE') !== -1 || activo.indexOf('IMEI') !== -1 || activo.indexOf('MOVIL') !== -1) return 'Smartphone';
  if (activo === 'CONSULTA') return 'Programas';
  if (activo === 'OTROS' || activo === 'OTRO') return 'Otro';
  if (activo.indexOf('PC') !== -1) return 'PC-Portatil';
  return '';
}
