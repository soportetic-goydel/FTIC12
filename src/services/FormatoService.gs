function FormatoService_generarPdfRegistro_(registro) {
  const idRegistro = String(registro.ID_REGISTRO || '').trim();
  if (!idRegistro) throw new Error('No se puede generar formato sin ID_REGISTRO.');

  const folder = DriveApp.getFolderById(CONFIG.DRIVE.FOLDER_RG_F_TIC_12);
  const template = DriveApp.getFileById(CONFIG.FORMATOS.F_TIC_12_TEMPLATE_SPREADSHEET);
  const nombreBase = FormatoService_nombreArchivo_(registro);
  const copia = template.makeCopy(nombreBase + ' - editable', folder);

  try {
    const ss = SpreadsheetApp.openById(copia.getId());
    const sheet = ss.getSheetByName(CONFIG.FORMATOS.F_TIC_12_TEMPLATE_SHEET) || ss.getSheets()[0];
    FormatoService_llenarHoja_(sheet, registro);
    SpreadsheetApp.flush();

    const pdfBlob = FormatoService_exportarPdf_(ss.getId(), nombreBase + '.pdf');
    const pdfFile = folder.createFile(pdfBlob);
    const hash = FormatoService_hashBlob_(pdfBlob);

    // Se conserva solo el PDF como registro unitario final para evitar duplicar archivos editables.
    copia.setTrashed(true);

    return {
      pdfUrl: pdfFile.getUrl(),
      pdfId: pdfFile.getId(),
      hash: hash
    };
  } catch (error) {
    try {
      copia.setTrashed(true);
    } catch (e) {
      // Si no se puede eliminar la copia temporal, no ocultar el error original.
    }
    throw error;
  }
}

function FormatoService_llenarHoja_(sheet, registro) {
  const tipoEquipo = String(registro.TIPO_EQUIPO || '');
  const tipoProblema = String(registro.TIPO_PROBLEMA || '');
  const prioridad = String(registro.PRIORIDAD_USUARIO || '');
  const accionTomada = String(registro.ACCION_TOMADA || '');
  const estadoFinal = String(registro.ESTADO_FINAL || '');
  const slaAplicado = String(registro.SLA_APLICADO || '');
  const detalleIncidencia = String(registro.DESCRIPCION_INCIDENCIA || '').trim();
  const diagnosticoTic = String(registro.DIAGNOSTICO_TIC || '').trim();
  const resumenTecnico = FormatoService_resumenTecnico_(detalleIncidencia, diagnosticoTic);

  FormatoService_limpiarCasillas_(sheet);
  FormatoService_restaurarEtiquetasChecklist_(sheet);

  FormatoService_setCampoLinea_(sheet, 'D7', registro.NOMBRE_COMPLETO_SOLICITANTE);
  FormatoService_setCampoLinea_(sheet, 'P7', registro.DNI_SOLICITANTE);
  FormatoService_setCampoLinea_(sheet, 'D9', registro.CARGO_SOLICITANTE);
  FormatoService_setCampoLinea_(sheet, 'P9', registro.MOVIL_SOLICITANTE);
  FormatoService_setCampoLinea_(sheet, 'D11', registro.PROYECTO_SEDE);
  FormatoService_setCampoLinea_(sheet, 'R11', registro.CENTRO_DE_COSTO);
  FormatoService_setCampoLinea_(sheet, 'D13', registro.FECHA_HORA_REPORTE);
  FormatoService_setCampoLinea_(sheet, 'P13', registro.TIPO_EQUIPO);

  FormatoService_setCampoLinea_(sheet, 'O20', registro.ACTIVO_AFECTADO);

  FormatoService_marcarSeleccionUnica_(sheet, tipoEquipo, {
    PCPORTATIL: 'D18',
    PCPORTABLE: 'D18',
    PCPORTATILO: 'D18',
    PCPORT: 'D18',
    PCESCRITORIO: 'H18',
    SMARTPHONE: 'L18',
    IMPRESORA: 'P18',
    ESCANER: 'D20',
    PROGRAMAS: 'H20',
    OTRO: 'L20'
  });

  FormatoService_marcarSeleccionUnica_(sheet, tipoProblema, {
    HARDWARE: 'D22',
    SOFTWARE: 'H22',
    RED: 'L22'
  });

  FormatoService_marcarSeleccionUnica_(sheet, prioridad, {
    BAJA: 'D24',
    MEDIA: 'H24',
    ALTA: 'L24'
  });

  FormatoService_setCampoLinea_(sheet, 'H28', registro.ANYDESK_ID);
  FormatoService_setCampoLinea_(sheet, 'P28', registro.ANYDESK_PASSWORD ? '[Registrado de forma segura]' : '');

  FormatoService_marcarSeleccionUnica_(sheet, slaAplicado, {
    ALTA2H: 'D33',
    P1: 'D33',
    MEDIA4H: 'H33',
    P2: 'H33',
    BAJA8H: 'L33',
    P3: 'L33',
    CONSULTA: 'P33',
    P4: 'P33'
  });

  FormatoService_setCampoBloque_(sheet, 'B36:T39', resumenTecnico);

  FormatoService_marcarSeleccionUnica_(sheet, accionTomada, {
    SOPORTEREMOTO: 'D41',
    SOPORTEPRESENCIAL: 'H41',
    TALLER: 'L41',
    GARANTIA: 'P41'
  });

  FormatoService_marcarSeleccionUnica_(sheet, estadoFinal, {
    OPERATIVO: 'D43',
    PENDIENTE: 'H43',
    REPOSICION: 'L43'
  });

  FormatoService_setCampoLinea_(sheet, 'D47', registro.TECNICO_RESPONSABLE);
  FormatoService_setCampoLinea_(sheet, 'S47', registro.FECHA_HORA_CIERRE);
}

function FormatoService_set_(sheet, a1, valor) {
  sheet.getRange(a1).setValue(valor || '');
}

function FormatoService_setCampoLinea_(sheet, a1, valor) {
  const range = sheet.getRange(a1);
  range
    .setValue(valor || '')
    .setFontFamily('Arial')
    .setFontSize(8)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setWrap(false);
}

function FormatoService_setCampoBloque_(sheet, a1, valor) {
  const range = sheet.getRange(a1);
  range
    .clearContent()
    .setWrap(true)
    .setVerticalAlignment('top');
  sheet.getRange(range.getRow(), range.getColumn()).setValue(valor || '').setFontFamily('Arial').setFontSize(8);
}

function FormatoService_resumenTecnico_(detalleIncidencia, diagnosticoTic) {
  const partes = [];
  if (detalleIncidencia) partes.push('Incidencia reportada: ' + detalleIncidencia);
  if (diagnosticoTic) partes.push('Diagnostico TIC: ' + diagnosticoTic);
  return partes.join('\n\n');
}

function FormatoService_limpiarCasillas_(sheet) {
  [
    'C18:T18',
    'C20:T20',
    'C22:T22',
    'C24:T24',
    'C33:T33',
    'C41:T41',
    'C43:T43'
  ].forEach(function (a1) {
    sheet.getRange(a1).clearContent();
  });

  [
    'D18', 'H18', 'L18', 'P18',
    'D20', 'H20', 'L20',
    'D22', 'H22', 'L22',
    'D24', 'H24', 'L24',
    'D33', 'H33', 'L33', 'P33',
    'D41', 'H41', 'L41', 'P41',
    'D43', 'H43', 'L43'
  ].forEach(function (a1) {
    sheet.getRange(a1).clearContent();
  });
}

function FormatoService_restaurarEtiquetasChecklist_(sheet) {
  const etiquetas = {
    F18: 'PC-Portatil',
    J18: 'PC-Escritorio',
    N18: 'Smartphone',
    S18: 'Impresora',
    F20: 'Escaner',
    J20: 'Programas',
    N20: 'Otros :',
    F22: 'Hardware',
    J22: 'Software',
    N22: 'Red',
    F24: 'Baja',
    J24: 'Media',
    N24: 'Alta',
    F33: 'P1 - CRITICO',
    J33: 'P2 - ALTO',
    N33: 'P3 - ESTANDAR',
    S33: 'P4 - CONSULTA',
    F41: 'Soporte Remoto',
    J41: 'Soporte Presencial',
    N41: 'Taller',
    S41: 'Garantia',
    F43: 'OPERATIVO',
    J43: 'PENDIENTE',
    N43: 'REPOSICION'
  };

  Object.keys(etiquetas).forEach(function (a1) {
    sheet.getRange(a1).setValue(etiquetas[a1]);
  });
}

function FormatoService_marcarOpcion_(sheet, valor, mapa) {
  const clave = FormatoService_normalizarClave_(valor);
  if (!clave) return;
  Object.keys(mapa).forEach(function (opcion) {
    if (clave.indexOf(opcion) !== -1 || opcion.indexOf(clave) !== -1) {
      FormatoService_marcarCasilla_(sheet.getRange(mapa[opcion]));
    }
  });
}

function FormatoService_marcarSeleccionUnica_(sheet, valor, mapa) {
  const clave = FormatoService_normalizarClave_(valor);
  if (!clave) return;

  const destino = mapa[clave] || null;
  if (!destino) return;

  FormatoService_marcarCasilla_(sheet.getRange(destino));
}

function FormatoService_marcarCasilla_(range) {
  range
    .setValue('✕')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Arial')
    .setFontSize(11)
    .setFontWeight('bold');
}

function FormatoService_exportarPdf_(spreadsheetId, nombreArchivo) {
  const file = DriveApp.getFileById(spreadsheetId);
  return file.getAs(MimeType.PDF).setName(nombreArchivo);
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

function FormatoService_normalizarClave_(valor) {
  let texto = String(valor || '');
  try {
    texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Mantener texto original si normalize no estuviera disponible.
  }
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
