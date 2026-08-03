function ResponseService_ok_(result, message) {
  return {
    ok: true,
    result: result || {},
    message: message || 'Operación realizada correctamente.'
  };
}

function ResponseService_error_(error, message, code) {
  return {
    ok: false,
    code: code || RESPONSE_CODES.ERROR,
    result: null,
    message: message || 'No se pudo completar la operación.',
    error: error ? String(error) : ''
  };
}
