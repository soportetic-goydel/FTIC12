function FormatoService_generarPdfRegistro_(registro) {
  const idRegistro = String(registro.ID_REGISTRO || '').trim();
  if (!idRegistro) throw new Error('No se puede generar formato sin ID_REGISTRO.');

  const folder = DriveApp.getFolderById(CONFIG.DRIVE.FOLDER_RG_F_TIC_12);
  const nombreBase = FormatoService_nombreArchivo_(registro);
  const pdfBlob = FormatoService_construirPdfBlobDesdeRegistro_(registro, nombreBase + '.pdf');
  const pdfFile = folder.createFile(pdfBlob);
  const hash = FormatoService_hashBlob_(pdfBlob);

  return {
    pdfUrl: pdfFile.getUrl(),
    pdfId: pdfFile.getId(),
    hash: hash
  };
}

function FormatoService_construirPdfBlobDesdeRegistro_(registro, nombreArchivo) {
  const template = HtmlService.createTemplateFromFile(CONFIG.FORMATOS.F_TIC_12_TEMPLATE_HTML);
  template.data = FormatoService_construirVistaPdf_(registro);
  const htmlOutput = template.evaluate();
  return htmlOutput.getAs('application/pdf').setName(nombreArchivo);
}

function FormatoService_construirVistaPdf_(registro) {
  const tipoEquipoTexto = ReporteDataService_resolverTipoEquipoRegistro_(registro);
  const tipoEquipo = FormatoService_resolverTipoEquipoOpciones_(tipoEquipoTexto);
  const tipoProblemaTexto = FormatoService_tipoProblemaPrincipal_(registro && registro.TIPO_PROBLEMA);
  const tipoProblema = FormatoService_resolverSeleccionSimple_(tipoProblemaTexto, ['Hardware', 'Software', 'Red']);
  const prioridadTexto = FormatoService_texto_(registro && registro.PRIORIDAD_USUARIO);
  const prioridad = FormatoService_resolverSeleccionSimple_(prioridadTexto, ['Baja', 'Media', 'Alta']);
  const accionTexto = FormatoService_texto_(registro && registro.ACCION_TOMADA);
  const accion = FormatoService_resolverSeleccionSimple_(accionTexto, ['Soporte Remoto', 'Soporte Presencial', 'Taller', 'Garantia']);
  const estadoFinalTexto = FormatoService_texto_(registro && registro.ESTADO_FINAL);
  const estadoFinal = FormatoService_resolverSeleccionSimple_(estadoFinalTexto, ['Operativo', 'Pendiente', 'Reposicion']);
  const sla = FormatoService_resolverSlaOpciones_(
    registro && registro.SLA_APLICADO,
    registro && registro.PRIORIDAD_USUARIO
  );
  const diagnosticoLayout = FormatoService_prepararContenidoDiagnostico_(registro && registro.DIAGNOSTICO_TIC);

  return {
    codigoFormato: CONFIG.APP.CODIGO_FORMATO,
    versionFormato: CONFIG.APP.VERSION_FORMATO,
    fechaAprobacion: CONFIG.FORMATOS.F_TIC_12_FECHA_APROBACION,
    ticketId: FormatoService_texto_(registro && registro.ID_REGISTRO) || 'SIN-TICKET',
    nombreCompletoSolicitante: FormatoService_texto_(registro && registro.NOMBRE_COMPLETO_SOLICITANTE),
    dniSolicitante: FormatoService_texto_(registro && registro.DNI_SOLICITANTE),
    cargoSolicitante: FormatoService_texto_(registro && registro.CARGO_SOLICITANTE),
    movilSolicitante: FormatoService_texto_(registro && registro.MOVIL_SOLICITANTE),
    proyectoSede: FormatoService_texto_(registro && registro.PROYECTO_SEDE),
    centroCosto: FormatoService_texto_(registro && registro.CENTRO_DE_COSTO),
    fechaHoraReporte: FormatoService_texto_(registro && registro.FECHA_HORA_REPORTE),
    correoElectronicoSolicitante: FormatoService_texto_(registro && registro.CORREO_ELECTRONICO_SOLICITANTE),
    activoAfectado: FormatoService_texto_(registro && registro.ACTIVO_AFECTADO),
    tipoEquipo: tipoEquipo,
    tipoEquipoOtro: tipoEquipo.otro ? tipoEquipo.detalle : '',
    tipoProblema: tipoProblema,
    prioridad: prioridad,
    anydeskId: FormatoService_texto_(registro && registro.ANYDESK_ID),
    anydeskPasswordTexto: registro && registro.ANYDESK_PASSWORD ? '[Registrado de forma segura]' : '',
    sla: sla,
    diagnosticoTic: diagnosticoLayout.texto,
    diagnosticoFontSize: diagnosticoLayout.fontSize,
    accionTomada: accion,
    estadoFinal: estadoFinal,
    tecnicoResponsable: FormatoService_texto_(registro && registro.TECNICO_RESPONSABLE),
    fechaHoraCierre: FormatoService_texto_(registro && registro.FECHA_HORA_CIERRE)
  };
}

function FormatoService_registroDemoPdf_() {
  return {
    ID_REGISTRO: 'REG-F-TIC-12-2026-00000',
    NOMBRE_COMPLETO_SOLICITANTE: 'SOLICITANTE DE PRUEBA',
    DNI_SOLICITANTE: '00000000',
    CARGO_SOLICITANTE: 'TECNICO DE TI',
    MOVIL_SOLICITANTE: '900000000',
    PROYECTO_SEDE: 'PRUEBA PDF HTML',
    CENTRO_DE_COSTO: '(0000) CECO DEMO',
    FECHA_HORA_REPORTE: Utils_formatFechaHora_(Utils_now_()),
    CORREO_ELECTRONICO_SOLICITANTE: CONFIG.APP.SUPPORT_EMAIL || '',
    TIPO_EQUIPO: 'PC-Portatil',
    ACTIVO_AFECTADO: 'ACTIVO-DEMO-001',
    TIPO_PROBLEMA: 'Software',
    PRIORIDAD_USUARIO: 'Media',
    ANYDESK_ID: '123 456 789',
    ANYDESK_PASSWORD: 'secure-token',
    SLA_APLICADO: 'Media 4h',
    DIAGNOSTICO_TIC: 'Prueba de generacion PDF desde template HTML.\nVerificacion de multilinea y layout fijo.',
    ACCION_TOMADA: 'Soporte Remoto',
    ESTADO_FINAL: 'Operativo',
    TECNICO_RESPONSABLE: 'MESA DE AYUDA TIC',
    FECHA_HORA_CIERRE: Utils_formatFechaHora_(Utils_now_())
  };
}

function FormatoService_texto_(valor) {
  if (Object.prototype.toString.call(valor) === '[object Date]') return Utils_formatFechaHora_(valor);
  return String(valor || '').trim();
}

function FormatoService_resolverTipoEquipoOpciones_(tipoEquipoTexto) {
  const normalizado = FormatoService_normalizarClave_(tipoEquipoTexto);
  const seleccion = {
    pcPortatil: false,
    pcEscritorio: false,
    smartphone: false,
    impresora: false,
    escaner: false,
    programas: false,
    otro: false,
    detalle: ''
  };
  const mapa = {
    PCPORTATIL: 'pcPortatil',
    PCPORTABLE: 'pcPortatil',
    PCPORTATILO: 'pcPortatil',
    PCPORT: 'pcPortatil',
    PCESCRITORIO: 'pcEscritorio',
    SMARTPHONE: 'smartphone',
    IMPRESORA: 'impresora',
    ESCANER: 'escaner',
    PROGRAMAS: 'programas'
  };

  if (mapa[normalizado]) {
    seleccion[mapa[normalizado]] = true;
    return seleccion;
  }

  if (normalizado) {
    seleccion.otro = true;
    seleccion.detalle = FormatoService_texto_(tipoEquipoTexto);
  }

  return seleccion;
}

function FormatoService_resolverSeleccionSimple_(valor, opciones) {
  const normalizado = FormatoService_normalizarClave_(valor);
  return opciones.reduce(function (acumulado, opcion) {
    acumulado[FormatoService_claveOpcion_(opcion)] = FormatoService_normalizarClave_(opcion) === normalizado;
    return acumulado;
  }, {});
}

function FormatoService_resolverSlaOpciones_(slaAplicado, prioridadUsuario) {
  const normalizado = FormatoService_normalizarClave_(slaAplicado);
  const prioridad = FormatoService_normalizarClave_(prioridadUsuario);
  const contiene = function (partes) {
    return partes.some(function (parte) {
      return normalizado.indexOf(parte) !== -1;
    });
  };

  if (!normalizado) {
    return {
      p1: prioridad === 'ALTA',
      p2: prioridad === 'MEDIA',
      p3: prioridad === 'BAJA',
      p4: prioridad === 'CONSULTA',
      textoOriginal: ''
    };
  }

  return {
    p1: contiene(['P1', 'ALTA2H', 'CRITICO']),
    p2: contiene(['P2', 'MEDIA4H', 'ALTO']),
    p3: contiene(['P3', 'BAJA8H', 'ESTANDAR']),
    p4: contiene(['P4', 'CONSULTA']),
    textoOriginal: FormatoService_texto_(slaAplicado)
  };
}

function FormatoService_claveOpcion_(texto) {
  const normalizado = FormatoService_normalizarClave_(texto);
  if (normalizado === 'SOPORTEREMOTO') return 'soporteRemoto';
  if (normalizado === 'SOPORTEPRESENCIAL') return 'soportePresencial';
  if (normalizado === 'TALLER') return 'taller';
  if (normalizado === 'GARANTIA') return 'garantia';
  if (normalizado === 'OPERATIVO') return 'operativo';
  if (normalizado === 'PENDIENTE') return 'pendiente';
  if (normalizado === 'REPOSICION') return 'reposicion';
  if (normalizado === 'HARDWARE') return 'hardware';
  if (normalizado === 'SOFTWARE') return 'software';
  if (normalizado === 'RED') return 'red';
  if (normalizado === 'BAJA') return 'baja';
  if (normalizado === 'MEDIA') return 'media';
  if (normalizado === 'ALTA') return 'alta';
  return normalizado.toLowerCase();
}

function FormatoService_prepararContenidoDiagnostico_(diagnosticoTic) {
  const lineas = FormatoService_formatearDiagnosticoLineas_(diagnosticoTic);
  const cantidadLineas = Math.max(lineas.length, 1);
  const fontSize = cantidadLineas <= 5 ? 8 : (cantidadLineas <= 8 ? 7 : 6);
  return {
    texto: lineas.join('\n'),
    fontSize: fontSize
  };
}

function FormatoService_formatearDiagnosticoLineas_(valor) {
  return FormatoService_obtenerLineasConContenido_(valor).reduce(function (acumulado, linea) {
    const limpio = String(linea || '').replace(/^[\u2022\-\*]+\s*/, '').trim();
    if (!limpio) return acumulado;

    FormatoService_dividirTextoEnLineas_(limpio, 82).forEach(function (segmento, indice) {
      acumulado.push((indice === 0 ? '\u2022 ' : '  ') + segmento);
    });

    return acumulado;
  }, []);
}

function FormatoService_dividirTextoEnLineas_(texto, maxCaracteres) {
  const palabras = String(texto || '').split(/\s+/).filter(function (palabra) {
    return !!palabra;
  });
  if (!palabras.length) return [];

  const lineas = [];
  let actual = '';

  palabras.forEach(function (palabra) {
    const propuesta = actual ? (actual + ' ' + palabra) : palabra;
    if (propuesta.length <= maxCaracteres || !actual) {
      actual = propuesta;
      return;
    }

    lineas.push(actual);
    actual = palabra;
  });

  if (actual) lineas.push(actual);
  return lineas;
}

function FormatoService_obtenerLineasConContenido_(valor) {
  return String(valor || '')
    .split(/\r?\n/)
    .map(function (linea) {
      return linea.trim();
    })
    .filter(function (linea) {
      return !!linea;
    });
}

function FormatoService_hashBlob_(blob) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, blob.getBytes());
  return digest.map(function (byte) {
    const value = (byte < 0 ? byte + 256 : byte).toString(16);
    return value.length === 1 ? '0' + value : value;
  }).join('');
}

function FormatoService_nombreArchivo_(registro) {
  const idRegistro = String(registro.ID_REGISTRO || 'SIN-ID').replace(/[^A-Z0-9_-]/gi, '-');
  const fecha = Utils_formatFechaHora_(Utils_now_()).replace(/[-: ]/g, '');
  return 'F-TIC-12_' + idRegistro + '_' + fecha;
}

function FormatoService_tipoProblemaPrincipal_(tipoProblema) {
  const clave = FormatoService_normalizarClave_(tipoProblema);
  const mapa = {
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    RED: 'Red',
    HARDWAREFISICO: 'Hardware',
    SOFTWARESISTEMAS: 'Software',
    CONECTIVIDAD: 'Red',
    SOFTWAREMDM: 'Software',
    HARDWARERED: 'Hardware',
    HARDWARESUMINISTROS: 'Hardware',
    REDESCANEO: 'Red',
    CONFIGURACION: 'Software',
    ACCESOSYCUENTAS: 'Software',
    ASESORIAHOWTO: 'Software',
    PERIFERICOS: 'Hardware',
    SEGURIDAD: 'Software'
  };

  return mapa[clave] || FormatoService_texto_(tipoProblema);
}

function FormatoService_normalizarClave_(valor) {
  let texto = String(valor || '');
  try {
    texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Mantener texto original si normalize no estuviera disponible.
  }
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
