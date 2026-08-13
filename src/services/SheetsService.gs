function SheetsService_open_(spreadsheetId) {
  return SpreadsheetApp.openById(spreadsheetId);
}

function SheetsService_getSheet_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('No existe la hoja "' + sheetName + '".');
  return sheet;
}

function SheetsService_getHeaderMap_(sheet) {
  const ultimaColumna = sheet.getLastColumn();
  const encabezados = sheet.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  const mapa = {};
  encabezados.forEach(function (nombre, indice) {
    if (nombre) mapa[String(nombre).trim()] = indice;
  });
  return mapa;
}

function SheetsService_readObjects_(sheet) {
  const ultimaFila = sheet.getLastRow();
  if (ultimaFila < 2) return [];
  const mapa = SheetsService_getHeaderMap_(sheet);
  const encabezados = Object.keys(mapa);
  const filas = sheet.getRange(2, 1, ultimaFila - 1, sheet.getLastColumn()).getValues();
  return filas.map(function (fila) {
    const obj = {};
    encabezados.forEach(function (encabezado) {
      obj[encabezado] = fila[mapa[encabezado]];
    });
    return obj;
  });
}

function SheetsService_appendObject_(sheet, objeto, encabezados) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const mapa = SheetsService_getHeaderMap_(sheet);
    const listaEncabezados = encabezados || Object.keys(mapa);
    const fila = new Array(sheet.getLastColumn()).fill('');
    listaEncabezados.forEach(function (encabezado) {
      if (!(encabezado in mapa)) throw new Error('La hoja no tiene la columna "' + encabezado + '".');
      fila[mapa[encabezado]] = objeto.hasOwnProperty(encabezado) ? objeto[encabezado] : '';
    });
    sheet.appendRow(fila);
  } finally {
    lock.releaseLock();
  }
}

function SheetsService_findRowByValue_(sheet, headerName, value) {
  const mapa = SheetsService_getHeaderMap_(sheet);
  if (!(headerName in mapa)) throw new Error('La hoja no tiene la columna "' + headerName + '".');
  const columna = mapa[headerName] + 1;
  const ultimaFila = sheet.getLastRow();
  if (ultimaFila < 2) return -1;
  const valores = sheet.getRange(2, columna, ultimaFila - 1, 1).getValues();
  for (let i = 0; i < valores.length; i++) {
    if (String(valores[i][0]).trim() === String(value).trim()) return i + 2;
  }
  return -1;
}

function SheetsService_validateHeaders_(sheet, encabezadosRequeridos) {
  const mapa = SheetsService_getHeaderMap_(sheet);
  const faltantes = encabezadosRequeridos.filter(function (encabezado) {
    return !(encabezado in mapa);
  });
  return { valido: faltantes.length === 0, faltantes: faltantes };
}

function SheetsService_ensureHeaders_(sheet, encabezadosRequeridos) {
  const validacion = SheetsService_validateHeaders_(sheet, encabezadosRequeridos);
  if (!validacion.faltantes.length) return { agregado: false, faltantes: [] };

  const columnaInicio = sheet.getLastColumn() + 1;
  sheet.getRange(1, columnaInicio, 1, validacion.faltantes.length).setValues([validacion.faltantes]);
  sheet.setFrozenRows(1);
  return { agregado: true, faltantes: validacion.faltantes.slice() };
}
