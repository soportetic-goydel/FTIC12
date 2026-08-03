function LogService_evento_(accion, idRegistro, resultado, mensaje, extra) {
  try {
    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.LOG_EVENTOS);
    if (!sheet) return;
    sheet.appendRow([
      Utils_formatFechaHora_(Utils_now_()),
      Session.getActiveUser().getEmail() || 'ANONIMO',
      accion || '',
      idRegistro || '',
      resultado || '',
      mensaje || '',
      extra ? JSON.stringify(extra) : ''
    ]);
  } catch (error) {
    // Los logs nunca deben interrumpir el flujo principal.
  }
}

function LogService_error_(accion, error, extra) {
  try {
    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.MAIN);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.LOG_ERRORES);
    if (!sheet) return;
    sheet.appendRow([
      Utils_formatFechaHora_(Utils_now_()),
      Session.getActiveUser().getEmail() || 'ANONIMO',
      accion || '',
      error ? String(error) : '',
      error && error.stack ? String(error.stack) : '',
      extra ? JSON.stringify(extra) : ''
    ]);
  } catch (errorInterno) {
    // Los logs nunca deben interrumpir el flujo principal.
  }
}
