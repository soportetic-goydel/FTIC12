function setupCrearBaseDatos_() {
  const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
  setupCrearHojaSiFalta_(ss, CONFIG.SHEETS.LOG_EVENTOS, CONFIG.HEADERS.LOG_EVENTOS);
  setupCrearHojaSiFalta_(ss, CONFIG.SHEETS.LOG_ERRORES, CONFIG.HEADERS.LOG_ERRORES);
}

function setupCrearHojaSiFalta_(ss, nombreHoja, encabezados) {
  let sheet = ss.getSheetByName(nombreHoja);
  if (!sheet) {
    sheet = ss.insertSheet(nombreHoja);
    sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Punto de entrada publico visible en el selector "Ejecutar" del editor de Apps Script
// (las funciones con guion bajo son privadas y no aparecen en ese selector).
function configurarProyecto() {
  setupCrearBaseDatos_();
  return validarEstructuraProyecto();
}

function validarEstructuraProyecto() {
  const resultado = { valido: true, detalles: [] };

  function registrar(seccion, ok, info) {
    resultado.detalles.push({ seccion: seccion, ok: ok, info: info });
    if (!ok) resultado.valido = false;
  }

  try {
    const ssMain = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);

    const sheetRegistros = ssMain.getSheetByName(CONFIG.SHEETS.REGISTROS);
    if (!sheetRegistros) {
      registrar(CONFIG.SHEETS.REGISTROS, false, 'La hoja no existe.');
    } else {
      const validacion = SheetsService_validateHeaders_(sheetRegistros, CONFIG.HEADERS.REGISTROS);
      registrar(
        CONFIG.SHEETS.REGISTROS,
        validacion.valido,
        validacion.valido ? 'OK' : 'Faltan columnas: ' + validacion.faltantes.join(', ')
      );
    }

    [CONFIG.SHEETS.LOG_EVENTOS, CONFIG.SHEETS.LOG_ERRORES].forEach(function (nombreHoja) {
      const sheet = ssMain.getSheetByName(nombreHoja);
      registrar(nombreHoja, !!sheet, sheet ? 'OK' : 'La hoja no existe (ejecuta configurarProyecto()).');
    });

    const ssPadron = SheetsService_open_(CONFIG.SPREADSHEETS.PADRON_PERSONAL);
    const hojasPadron = [
      CONFIG.PADRON.SHEETS_EMPRESAS.TDEM,
      CONFIG.PADRON.SHEETS_EMPRESAS.GOYDEL,
      CONFIG.PADRON.SHEET_CECO
    ];
    hojasPadron.forEach(function (nombreHoja) {
      const sheet = ssPadron.getSheetByName(nombreHoja);
      registrar('Padron · ' + nombreHoja, !!sheet, sheet ? 'OK' : 'La hoja no existe en el padron unico.');
    });

    const secretoConfigurado = !!PropertiesService.getScriptProperties().getProperty(CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY);
    registrar(
      'Script Property: ' + CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY,
      secretoConfigurado,
      secretoConfigurado ? 'OK' : 'Falta configurar el secreto de cifrado (ver docs/03_GUIA_OPERATIVA_Y_GOBIERNO.md).'
    );

    try {
      const folder = DriveApp.getFolderById(CONFIG.DRIVE.FOLDER_RG_F_TIC_12);
      registrar('Drive PDF destino', !!folder, folder ? 'OK' : 'No se pudo acceder a la carpeta destino del PDF.');
    } catch (errorDriveFolder) {
      registrar('Drive PDF destino', false, 'Sin autorizacion de Drive o carpeta invalida: ' + Utils_resumirErrorSeguro_(errorDriveFolder));
    }

    try {
      const template = DriveApp.getFileById(CONFIG.FORMATOS.F_TIC_12_TEMPLATE_SPREADSHEET);
      registrar('Plantilla PDF F-TIC-12', !!template, template ? 'OK' : 'No se pudo acceder a la plantilla del formato.');
    } catch (errorDriveTemplate) {
      registrar('Plantilla PDF F-TIC-12', false, 'Sin autorizacion de Drive o plantilla invalida: ' + Utils_resumirErrorSeguro_(errorDriveTemplate));
    }
  } catch (error) {
    registrar('Excepcion', false, String(error));
  }

  return resultado;
}

function autorizarServiciosPdf() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE.FOLDER_RG_F_TIC_12);
  const template = DriveApp.getFileById(CONFIG.FORMATOS.F_TIC_12_TEMPLATE_SPREADSHEET);
  const temporal = template.makeCopy('AUTH_PDF_FTIC12_TMP_' + new Date().getTime(), folder);
  const pdfTemporal = temporal.getAs(MimeType.PDF);
  temporal.setTrashed(true);
  return {
    ok: true,
    folderId: folder.getId(),
    folderName: folder.getName(),
    templateId: template.getId(),
    templateName: template.getName(),
    pdfBytes: pdfTemporal.getBytes().length,
    message: 'Permisos completos del flujo PDF verificados correctamente para la generacion del F-TIC-12.'
  };
}

function reiniciarSistemaDesdeCero() {
  const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
  const resultado = {
    ok: true,
    registrosEliminados: 0,
    logsEventosEliminados: 0,
    logsErroresEliminados: 0,
    pdfsEnviadosAPapelera: 0
  };

  resultado.registrosEliminados = setupEliminarFilasDatos_(ss.getSheetByName(CONFIG.SHEETS.REGISTROS));
  resultado.logsEventosEliminados = setupEliminarFilasDatos_(ss.getSheetByName(CONFIG.SHEETS.LOG_EVENTOS));
  resultado.logsErroresEliminados = setupEliminarFilasDatos_(ss.getSheetByName(CONFIG.SHEETS.LOG_ERRORES));
  resultado.pdfsEnviadosAPapelera = setupEnviarArchivosCarpetaAPapelera_(CONFIG.DRIVE.FOLDER_RG_F_TIC_12);

  SpreadsheetApp.flush();
  return resultado;
}

function setupEliminarFilasDatos_(sheet) {
  if (!sheet) return 0;
  const ultimaFila = sheet.getLastRow();
  if (ultimaFila <= 1) return 0;

  const cantidad = ultimaFila - 1;
  sheet.deleteRows(2, cantidad);
  return cantidad;
}

function setupEnviarArchivosCarpetaAPapelera_(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  let cantidad = 0;

  while (files.hasNext()) {
    const file = files.next();
    file.setTrashed(true);
    cantidad++;
  }

  return cantidad;
}
