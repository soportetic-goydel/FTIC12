function PadronService_buscarPorDni(dni) {
  try {
    const dniNormalizado = Utils_normalizarDni_(dni);
    const correoRecordado = ReporteDataService_obtenerCorreoRecordadoPorDni_(dniNormalizado);
    if (dniNormalizado.length !== 8) {
      return ResponseService_error_('', 'El DNI debe tener 8 digitos.', RESPONSE_CODES.VALIDACION);
    }

    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.PADRON_PERSONAL);
    const encontradoCentral = PadronService_buscarEnPersonalCentral_(ss, dniNormalizado);
    if (encontradoCentral) {
      const correoResuelto = correoRecordado || encontradoCentral.correoElectronico || '';
      return ResponseService_ok_({
        dni: dniNormalizado,
        nombreCompleto: encontradoCentral.nombreCompleto,
        cargo: encontradoCentral.cargo,
        movil: encontradoCentral.movil,
        correoElectronico: correoResuelto,
        fuenteCorreoElectronico: correoRecordado ? 'REGISTRO' : (encontradoCentral.correoElectronico ? 'PADRON' : ''),
        proyecto: encontradoCentral.proyecto,
        empresa: encontradoCentral.empresa,
        cecoNumero: encontradoCentral.cecoNumero,
        cecoNombre: encontradoCentral.cecoNombre
      }, 'Personal encontrado en el padron.');
    }

    const empresas = CONFIG.PADRON.SHEETS_EMPRESAS;
    for (const codigoEmpresa in empresas) {
      const encontrado = PadronService_buscarEnEmpresa_(ss, empresas[codigoEmpresa], dniNormalizado);
      if (encontrado) {
        const correoResuelto = correoRecordado || encontrado.correoElectronico || '';
        return ResponseService_ok_({
          dni: dniNormalizado,
          nombreCompleto: encontrado.nombreCompleto,
          cargo: encontrado.cargo,
          movil: encontrado.movil,
          correoElectronico: correoResuelto,
          fuenteCorreoElectronico: correoRecordado ? 'REGISTRO' : (encontrado.correoElectronico ? 'PADRON' : ''),
          proyecto: encontrado.proyecto,
          empresa: codigoEmpresa,
          cecoNumero: encontrado.cecoNumero,
          cecoNombre: encontrado.cecoNombre
        }, 'Personal encontrado en el padron.');
      }
    }

    return ResponseService_error_('', 'El DNI no se encuentra registrado en el padron oficial.', RESPONSE_CODES.NO_ENCONTRADO);
  } catch (error) {
    LogService_error_('PadronService_buscarPorDni', error, { dni: dni });
    return ResponseService_error_(error, 'No se pudo consultar el padron de personal.');
  }
}

function PadronService_buscarEnPersonalCentral_(ss, dniNormalizado) {
  const sheet = ss.getSheetByName(CONFIG.PADRON.SHEET_PERSONAL_CENTRAL);
  if (!sheet) return null;

  const headers = CONFIG.PADRON.HEADERS_PERSONAL_CENTRAL;
  const mapa = SheetsService_getHeaderMap_(sheet);
  if (!(headers.DNI in mapa)) return null;

  const fila = SheetsService_findRowByValue_(sheet, headers.DNI, dniNormalizado);
  if (fila === -1) return null;

  const valores = sheet.getRange(fila, 1, 1, sheet.getLastColumn()).getValues()[0];
  return {
    nombreCompleto: valores[mapa[headers.NOMBRE]] || '',
    cargo: valores[mapa[headers.CARGO]] || '',
    movil: valores[mapa[headers.MOVIL]] || '',
    correoElectronico: Utils_normalizarCorreo_(valores[mapa[headers.EMAIL_CORPORATIVO]] || valores[mapa[headers.EMAIL_PERSONAL]] || ''),
    proyecto: valores[mapa[headers.AREA_PROYECTO]] || '',
    empresa: PadronService_codigoEmpresaDesdeRazonSocial_(valores[mapa[headers.RAZON_SOCIAL]]),
    cecoNumero: valores[mapa[headers.CECO_NUMERO]] || '',
    cecoNombre: valores[mapa[headers.CECO_NOMBRE]] || ''
  };
}

function PadronService_buscarEnEmpresa_(ss, nombreHoja, dniNormalizado) {
  const sheet = ss.getSheetByName(nombreHoja);
  if (!sheet) return null;

  const headers = CONFIG.PADRON.HEADERS_PERSONAL;
  const mapa = SheetsService_getHeaderMap_(sheet);
  if (!(headers.DNI in mapa)) return null;

  const fila = SheetsService_findRowByValue_(sheet, headers.DNI, dniNormalizado);
  if (fila === -1) return null;

  const valores = sheet.getRange(fila, 1, 1, sheet.getLastColumn()).getValues()[0];
  return {
    nombreCompleto: valores[mapa[headers.NOMBRE]] || '',
    cargo: valores[mapa[headers.CARGO]] || '',
    movil: '',
    correoElectronico: '',
    proyecto: valores[mapa[headers.PROYECTO]] || '',
    cecoNumero: '',
    cecoNombre: ''
  };
}

function PadronService_listarCecoActivos(empresa) {
  try {
    const ss = SheetsService_open_(CONFIG.SPREADSHEETS.PADRON_PERSONAL);
    const sheet = SheetsService_getSheet_(ss, CONFIG.PADRON.SHEET_CECO);
    const headers = CONFIG.PADRON.HEADERS_CECO;
    const empresasCompatibles = PadronService_obtenerEmpresasCompatibles_(empresa);
    const filas = PadronService_readCecoObjects_(sheet, headers);

    const activos = filas.filter(function (fila) {
      const esActivo = String(fila[headers.ESTADO] || '').trim().toUpperCase() === 'ACTIVO';
      const razonSocial = PadronService_normalizarEmpresa_(fila[headers.RAZON_SOCIAL]);
      const coincideEmpresa = !empresa || empresasCompatibles.indexOf(razonSocial) !== -1;
      return esActivo && coincideEmpresa;
    }).map(function (fila) {
      return {
        ceco: fila[headers.CECO],
        cecoNumero: fila[headers.CECO],
        centroCosto: fila[headers.CENTRO_COSTO],
        proyecto: fila[headers.PROYECTO]
      };
    });

    return ResponseService_ok_({ centrosCosto: activos }, 'Centros de costo obtenidos.');
  } catch (error) {
    LogService_error_('PadronService_listarCecoActivos', error, { empresa: empresa });
    return ResponseService_error_(error, 'No se pudo obtener el catalogo de centros de costo.');
  }
}

function PadronService_readCecoObjects_(sheet, headers) {
  const ultimaFila = sheet.getLastRow();
  const filaInicialDatos = 4;
  const columnasCeco = 5;
  if (ultimaFila < filaInicialDatos) return [];

  const filas = sheet.getRange(filaInicialDatos, 1, ultimaFila - filaInicialDatos + 1, columnasCeco).getValues();
  return filas.map(function (fila) {
    const obj = {};
    obj[headers.RAZON_SOCIAL] = fila[0];
    obj[headers.CECO] = fila[1];
    obj[headers.CENTRO_COSTO] = fila[2];
    obj[headers.PROYECTO] = fila[3];
    obj[headers.ESTADO] = fila[4];
    return obj;
  });
}

function PadronService_obtenerEmpresasCompatibles_(empresa) {
  const empresaNormalizada = PadronService_normalizarEmpresa_(empresa);
  if (!empresaNormalizada) return [];

  const aliases = CONFIG.PADRON.EMPRESAS_CECO_ALIASES || {};
  for (const clave in aliases) {
    const opciones = (aliases[clave] || []).map(PadronService_normalizarEmpresa_);
    if (opciones.indexOf(empresaNormalizada) !== -1) {
      return opciones;
    }
  }

  return [empresaNormalizada];
}

function PadronService_normalizarEmpresa_(valor) {
  return String(valor || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function PadronService_codigoEmpresaDesdeRazonSocial_(razonSocial) {
  const empresaNormalizada = PadronService_normalizarEmpresa_(razonSocial);
  const aliases = CONFIG.PADRON.EMPRESAS_CECO_ALIASES || {};

  for (const codigo in aliases) {
    const opciones = (aliases[codigo] || []).map(PadronService_normalizarEmpresa_);
    if (opciones.indexOf(empresaNormalizada) !== -1) return codigo;
  }

  return empresaNormalizada;
}
