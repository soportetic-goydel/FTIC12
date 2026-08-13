function ActivosService_listarCatalogoPorDni_(dni) {
  try {
    const personaResp = PadronService_buscarPorDni(dni);
    if (!personaResp.ok) return personaResp;

    const persona = personaResp.result || {};
    const catalogo = ActivosService_resolverCatalogoParaPersona_(persona);
    return ResponseService_ok_({
      activos: catalogo.activos.map(ActivosService_mapearActivoPublico_)
    }, catalogo.message);
  } catch (error) {
    LogService_error_('ActivosService_listarCatalogoPorDni_', error, { dni: dni });
    return ResponseService_error_(error, 'No se pudo obtener el catalogo de activos del colaborador.');
  }
}

function ActivosService_resolverActivoSeleccionadoPorDni_(dni, activoSeleccionadoId) {
  try {
    const activoId = String(activoSeleccionadoId || '').trim();
    if (!activoId) {
      return ResponseService_error_('', 'Selecciona un activo afectado valido.', RESPONSE_CODES.VALIDACION);
    }

    const catalogoResp = ActivosService_listarCatalogoPorDni_(dni);
    if (!catalogoResp.ok) return catalogoResp;

    const activos = (catalogoResp.result && catalogoResp.result.activos) || [];
    const seleccionado = activos.find(function (activo) {
      return String(activo.id || '') === activoId;
    });

    if (!seleccionado) {
      return ResponseService_error_('', 'El activo seleccionado no pertenece al catalogo permitido para este DNI.', RESPONSE_CODES.VALIDACION);
    }

    return ResponseService_ok_({
      id: seleccionado.id,
      activoAfectado: seleccionado.canonicalLabel || seleccionado.label || '',
      assetKind: seleccionado.assetKind || ''
    }, 'Activo validado correctamente.');
  } catch (error) {
    LogService_error_('ActivosService_resolverActivoSeleccionadoPorDni_', error, {
      dni: dni,
      activoSeleccionadoId: activoSeleccionadoId
    });
    return ResponseService_error_(error, 'No se pudo validar el activo seleccionado.');
  }
}

function ActivosService_resolverCatalogoParaPersona_(persona) {
  const activosFisicos = ActivosService_resolverActivosFisicosParaPersona_(persona);
  const virtuales = ActivosService_obtenerOpcionesVirtuales_();
  return {
    activos: activosFisicos.activos.concat(virtuales),
    message: activosFisicos.message
  };
}

function ActivosService_resolverActivosFisicosParaPersona_(persona) {
  const empresa = String(persona && persona.empresa || '').trim().toUpperCase();
  const hojasEmpresa = (CONFIG.ACTIVOS && CONFIG.ACTIVOS.SHEETS_POR_EMPRESA && CONFIG.ACTIVOS.SHEETS_POR_EMPRESA[empresa]) || null;
  if (!hojasEmpresa) {
    return {
      activos: [],
      message: 'No se encontro una base de activos configurada para este colaborador. Puedes registrar Consulta u Otros.'
    };
  }

  const registros = ActivosService_listarRegistrosFisicosEmpresa_(hojasEmpresa);
  const coincidenciasNombre = ActivosService_filtrarCoincidenciasPorNombre_(registros, persona);
  if (!coincidenciasNombre.length) {
    return {
      activos: [],
      message: 'No se encontraron activos asignados para este DNI. Puedes registrar Consulta u Otros.'
    };
  }

  const reforzadas = coincidenciasNombre.filter(function (registro) {
    return registro.matchScore > 0;
  });

  if (reforzadas.length) {
    const extendidas = ActivosService_extenderCoincidenciasConAlias_(coincidenciasNombre, reforzadas);
    const incluyoAlias = extendidas.some(function (registro) {
      return registro.matchScore === 0;
    });

    if (incluyoAlias) {
      LogService_evento_('ACTIVOS_DNI_ALIAS_NOMBRE', '', 'INFO', 'Se ampliaron activos por alias compatible del nombre.', {
        dni: persona.dni || '',
        empresa: empresa,
        nombreCompleto: persona.nombreCompleto || '',
        cantidadCoincidencias: extendidas.length
      });
    }

    return {
      activos: ActivosService_ordenarActivos_(ActivosService_mapearActivosDesdeRegistros_(extendidas)),
      message: 'Selecciona el activo afectado asignado a tu usuario o registra Consulta u Otros.'
    };
  }

  const coincidenciasExactas = coincidenciasNombre.filter(function (registro) {
    return registro.nameMatchLevel >= 2;
  });

  if (coincidenciasExactas.length && !ActivosService_esCoincidenciaAmbigua_(coincidenciasExactas)) {
    return {
      activos: ActivosService_ordenarActivos_(ActivosService_mapearActivosDesdeRegistros_(coincidenciasExactas)),
      message: 'Selecciona el activo afectado asignado a tu usuario o registra Consulta u Otros.'
    };
  }

  LogService_evento_('ACTIVOS_DNI_AMBIGUO', '', 'WARN', 'Coincidencia ambigua de activos para un DNI.', {
    dni: persona.dni || '',
    empresa: empresa,
    nombreCompleto: persona.nombreCompleto || '',
    cantidadCoincidencias: coincidenciasNombre.length
  });

  return {
    activos: [],
    message: 'No se pudo identificar de forma confiable tus activos asignados. Puedes registrar Consulta u Otros.'
  };
}

function ActivosService_listarRegistrosFisicosEmpresa_(hojasEmpresa) {
  const ss = SheetsService_open_(CONFIG.SPREADSHEETS.ACTIVOS);
  const registros = [];

  registros.push.apply(registros, ActivosService_leerRegistrosPc_(ss, hojasEmpresa.PC));
  registros.push.apply(registros, ActivosService_leerRegistrosSmartphones_(ss, hojasEmpresa.SMARTPHONES));
  registros.push.apply(registros, ActivosService_leerRegistrosPrintScan_(ss, hojasEmpresa.PRINTSCAN));

  return registros;
}

function ActivosService_leerRegistrosPc_(ss, sheetName) {
  const sheet = SheetsService_getSheet_(ss, sheetName);
  const estadoAsignado = ActivosService_normalizarTexto_(CONFIG.ACTIVOS.ESTADO_ASIGNADO);
  return SheetsService_readObjects_(sheet).filter(function (fila) {
    return ActivosService_normalizarTexto_(fila.PC_ESTATUS_ASIGNACION) === estadoAsignado &&
      String(fila.PC_SERIE || '').trim();
  }).map(function (fila) {
    return {
      ownerName: fila.PC_NAME_USER_ASIGNADO || '',
      ownerMovil: fila.PC_CONTACTO_USER_ASIGNADO || '',
      ownerCeco: fila.PC_CECO_USER_ASIGNADO || '',
      id: sheetName + '|' + String(fila.PC_SERIE || '').trim(),
      iconKey: 'pc',
      assetKind: 'pc',
      label: 'PC - ' + String(fila.PC_SERIE || '').trim(),
      secondaryText: ActivosService_compactarPartes_([
        fila.PC_CECO_USER_ASIGNADO ? 'CECO: ' + fila.PC_CECO_USER_ASIGNADO : '',
        fila.PC_PROPIEDAD ? 'Propiedad: ' + fila.PC_PROPIEDAD : ''
      ], ' / '),
      canonicalLabel: 'PC ' + String(fila.PC_SERIE || '').trim()
    };
  });
}

function ActivosService_leerRegistrosSmartphones_(ss, sheetName) {
  const sheet = SheetsService_getSheet_(ss, sheetName);
  const estadoAsignado = ActivosService_normalizarTexto_(CONFIG.ACTIVOS.ESTADO_ASIGNADO);
  return SheetsService_readObjects_(sheet).filter(function (fila) {
    return ActivosService_normalizarTexto_(fila.SMARTPHN_ESTATUS_ASIGNACION) === estadoAsignado &&
      String(fila.ID_SMRT || fila.SMARTPHN_IMEI || '').trim();
  }).map(function (fila) {
    const movil = fila.TLF_NUMERO_MOVIL || fila.SMARTHPN_NUMERO_MOVIL || '';
    const imei = fila.SMARTPHN_IMEI || '';
    const marca = fila.SMARTPHN_MARCA || '';
    const modelo = fila.SMARTPHN_MODELO || '';
    const titulo = ActivosService_compactarPartes_([marca, modelo], ' ') || 'Smartphone';
    return {
      ownerName: fila.SMARTHPN_NAME_USER_ASIGNADO || '',
      ownerMovil: movil,
      ownerCeco: fila.SMARTHPN_CECO_USER_ASIGNADO || fila.SMARTHPN_CECO_USERASIGNADO || '',
      id: sheetName + '|' + String(fila.ID_SMRT || imei || '').trim(),
      iconKey: 'phone',
      assetKind: 'smartphone',
      label: titulo,
      secondaryText: ActivosService_compactarPartes_([
        imei ? 'IMEI: ' + imei : '',
        movil ? 'Movil: ' + movil : ''
      ], ' / '),
      canonicalLabel: ActivosService_compactarPartes_([
        titulo,
        imei ? 'IMEI: ' + imei : '',
        movil ? 'Movil: ' + movil : ''
      ], ' / ')
    };
  });
}

function ActivosService_leerRegistrosPrintScan_(ss, sheetName) {
  const sheet = SheetsService_getSheet_(ss, sheetName);
  const estadoAsignado = ActivosService_normalizarTexto_(CONFIG.ACTIVOS.ESTADO_ASIGNADO);
  return SheetsService_readObjects_(sheet).filter(function (fila) {
    return ActivosService_normalizarTexto_(fila.PRINTSCAN_ESTATUS_ASIGNACION) === estadoAsignado &&
      String(fila.PRINTSCAN_SERIE || '').trim();
  }).map(function (fila) {
    const tipo = String(fila.PRINTSCAN_TIPO || '').trim();
    const marca = String(fila.PRINTSCAN_MARCA || '').trim();
    const modelo = String(fila.PRINTSCAN_MODELO || '').trim();
    const serie = String(fila.PRINTSCAN_SERIE || '').trim();
    const tipoNormalizado = ActivosService_normalizarTexto_(tipo);
    const esEscaner = tipoNormalizado.indexOf('ESCANER') !== -1 || tipoNormalizado.indexOf('SCANER') !== -1;
    const titulo = ActivosService_compactarPartes_([tipo || (esEscaner ? 'Escaner' : 'Impresora'), marca, modelo], ' ');
    return {
      ownerName: fila.PRINTSCAN_NAME_USER_ASIGNADO || '',
      ownerMovil: '',
      ownerCeco: fila.PRINTSCAN_CECO_USER_ASIGNADO || '',
      id: sheetName + '|' + serie,
      iconKey: esEscaner ? 'scanner' : 'printer',
      assetKind: esEscaner ? 'scanner' : 'printer',
      label: titulo,
      secondaryText: 'Serie: ' + serie,
      canonicalLabel: ActivosService_compactarPartes_([titulo, 'Serie: ' + serie], ' / ')
    };
  });
}

function ActivosService_filtrarCoincidenciasPorNombre_(registros, persona) {
  const movilPersona = Utils_soloDigitos_(persona.movil || '');
  const cecoNumeroPersona = Utils_soloDigitos_(persona.cecoNumero || '');
  const cecoNombrePersona = ActivosService_normalizarTexto_(persona.cecoNombre || '');

  return registros.filter(function (registro) {
    return ActivosService_evaluarCompatibilidadNombre_(registro.ownerName, persona.nombreCompleto || '').esCompatible;
  }).map(function (registro) {
    const compatibilidadNombre = ActivosService_evaluarCompatibilidadNombre_(registro.ownerName, persona.nombreCompleto || '');
    const movilRegistro = Utils_soloDigitos_(registro.ownerMovil || '');
    const cecoRegistro = ActivosService_normalizarTexto_(registro.ownerCeco || '');
    const movilCoincide = !!(movilPersona && movilRegistro && movilPersona === movilRegistro);
    const cecoCoincide = ActivosService_coincideCeco_(cecoRegistro, cecoNumeroPersona, cecoNombrePersona);
    return {
      id: registro.id,
      iconKey: registro.iconKey,
      assetKind: registro.assetKind,
      label: registro.label,
      secondaryText: registro.secondaryText,
      canonicalLabel: registro.canonicalLabel,
      ownerName: registro.ownerName,
      ownerNameKey: compatibilidadNombre.ownerNameKey,
      nameMatchLevel: compatibilidadNombre.level,
      nameMatchMode: compatibilidadNombre.mode,
      ownerMovil: movilRegistro,
      ownerCeco: cecoRegistro,
      matchScore: (movilCoincide ? 1 : 0) + (cecoCoincide ? 1 : 0)
    };
  });
}

function ActivosService_coincideCeco_(cecoRegistro, cecoNumeroPersona, cecoNombrePersona) {
  if (!cecoRegistro) return false;
  if (cecoNumeroPersona && cecoRegistro.indexOf(cecoNumeroPersona) !== -1) return true;
  if (cecoNombrePersona && (cecoRegistro.indexOf(cecoNombrePersona) !== -1 || cecoNombrePersona.indexOf(cecoRegistro) !== -1)) return true;
  return false;
}

function ActivosService_esCoincidenciaAmbigua_(registros) {
  const nombres = {};
  const moviles = {};
  const cecos = {};

  registros.forEach(function (registro) {
    if (registro.ownerNameKey) nombres[registro.ownerNameKey] = true;
    if (registro.ownerMovil) moviles[registro.ownerMovil] = true;
    if (registro.ownerCeco) cecos[registro.ownerCeco] = true;
  });

  if (Object.keys(nombres).length > 1) return true;
  return Object.keys(moviles).length > 1 || Object.keys(cecos).length > 1;
}

function ActivosService_extenderCoincidenciasConAlias_(coincidenciasNombre, reforzadas) {
  const tieneReforzadaExacta = reforzadas.some(function (registro) {
    return registro.nameMatchLevel >= 3;
  });

  return coincidenciasNombre.filter(function (registro) {
    if (registro.matchScore > 0) return true;
    if (registro.nameMatchLevel >= 2) return true;
    return tieneReforzadaExacta && registro.nameMatchLevel >= 1;
  });
}

function ActivosService_mapearActivosDesdeRegistros_(registros) {
  const vistos = {};
  return registros.filter(function (registro) {
    if (!registro.id || vistos[registro.id]) return false;
    vistos[registro.id] = true;
    return true;
  });
}

function ActivosService_ordenarActivos_(activos) {
  const orden = {
    pc: 1,
    smartphone: 2,
    printer: 3,
    scanner: 4,
    consulta: 98,
    otro: 99
  };

  return activos.slice().sort(function (a, b) {
    const ordenA = orden[a.assetKind] || 50;
    const ordenB = orden[b.assetKind] || 50;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
}

function ActivosService_obtenerOpcionesVirtuales_() {
  return (CONFIG.ACTIVOS.OPCIONES_VIRTUALES || []).map(function (opcion) {
    return {
      id: opcion.id,
      label: opcion.label,
      iconKey: opcion.iconKey,
      assetKind: opcion.assetKind,
      secondaryText: opcion.label === 'Consulta'
        ? 'Usa esta opcion si tu incidente no corresponde a un equipo asignado.'
        : 'Usa esta opcion si necesitas registrar un caso excepcional.',
      canonicalLabel: opcion.label,
      isVirtual: true
    };
  });
}

function ActivosService_mapearActivoPublico_(activo) {
  return {
    id: activo.id,
    label: activo.label,
    iconKey: activo.iconKey,
    assetKind: activo.assetKind,
    secondaryText: activo.secondaryText || '',
    isVirtual: !!activo.isVirtual,
    canonicalLabel: activo.canonicalLabel || activo.label || ''
  };
}

function ActivosService_normalizarNombre_(valor) {
  return ActivosService_normalizarTexto_(valor).replace(/\s+/g, ' ').trim();
}

function ActivosService_tokenizarNombre_(valor) {
  return ActivosService_normalizarNombre_(valor).split(' ').filter(function (token) {
    return !!token;
  });
}

function ActivosService_firmaTokensNombre_(tokens) {
  const vistos = {};
  return (tokens || []).filter(function (token) {
    if (!token || vistos[token]) return false;
    vistos[token] = true;
    return true;
  }).sort().join('|');
}

function ActivosService_evaluarCompatibilidadNombre_(ownerName, personaNombre) {
  const ownerNormalizado = ActivosService_normalizarNombre_(ownerName);
  const personaNormalizada = ActivosService_normalizarNombre_(personaNombre);
  const ownerTokens = ActivosService_tokenizarNombre_(ownerName);
  const personaTokens = ActivosService_tokenizarNombre_(personaNombre);
  const ownerKey = ActivosService_firmaTokensNombre_(ownerTokens);
  const personaKey = ActivosService_firmaTokensNombre_(personaTokens);

  if (!ownerNormalizado || !personaNormalizada) {
    return { esCompatible: false, level: 0, mode: 'none', ownerNameKey: ownerKey };
  }

  if (ownerNormalizado === personaNormalizada) {
    return { esCompatible: true, level: 3, mode: 'exact', ownerNameKey: ownerKey };
  }

  if (ownerKey && ownerKey === personaKey) {
    return { esCompatible: true, level: 2, mode: 'token-set', ownerNameKey: ownerKey };
  }

  const ownerSet = {};
  ownerTokens.forEach(function (token) {
    ownerSet[token] = true;
  });

  const personaSet = {};
  personaTokens.forEach(function (token) {
    personaSet[token] = true;
  });

  const tokensCompartidos = ownerTokens.filter(function (token) {
    return personaSet[token];
  }).length;

  const todosOwnerEnPersona = ownerTokens.length > 0 && ownerTokens.every(function (token) {
    return personaSet[token];
  });

  const todosPersonaEnOwner = personaTokens.length > 0 && personaTokens.every(function (token) {
    return ownerSet[token];
  });

  const diferenciaLongitud = Math.abs(ownerTokens.length - personaTokens.length);
  const coincidePorSubconjunto = tokensCompartidos >= 3 &&
    diferenciaLongitud <= 1 &&
    (todosOwnerEnPersona || todosPersonaEnOwner);

  if (coincidePorSubconjunto) {
    return { esCompatible: true, level: 1, mode: 'subset', ownerNameKey: ownerKey || personaKey };
  }

  return { esCompatible: false, level: 0, mode: 'none', ownerNameKey: ownerKey };
}

function ActivosService_normalizarTexto_(valor) {
  let texto = String(valor || '').trim().toUpperCase();
  try {
    texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Mantener el texto original si normalize no estuviera disponible.
  }
  return texto.replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function ActivosService_compactarPartes_(partes, separador) {
  return (partes || []).filter(function (parte) {
    return !!String(parte || '').trim();
  }).join(separador || ' ');
}
