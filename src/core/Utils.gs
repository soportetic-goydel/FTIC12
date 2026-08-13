function Utils_normalizarTextoNumerico_(valor) {
  let texto = String(valor || '');
  try {
    texto = texto.normalize('NFKC');
  } catch (e) {
    // `normalize` puede no estar disponible en algunos runtimes; continuar con el texto original.
  }

  let salida = '';
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    if (codigo >= 48 && codigo <= 57) {
      salida += texto.charAt(i);
    } else if (codigo >= 65296 && codigo <= 65305) {
      salida += String(codigo - 65296);
    } else if (codigo >= 1632 && codigo <= 1641) {
      salida += String(codigo - 1632);
    } else if (codigo >= 1776 && codigo <= 1785) {
      salida += String(codigo - 1776);
    }
  }
  return salida.trim();
}

function Utils_normalizarDni_(dni) {
  return Utils_normalizarTextoNumerico_(dni);
}

function Utils_soloDigitos_(valor) {
  return Utils_normalizarTextoNumerico_(valor);
}

function Utils_normalizarCorreo_(valor) {
  return String(valor || '').trim().toLowerCase();
}

function Utils_esCorreoValido_(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Utils_normalizarCorreo_(valor));
}

function Utils_obtenerDominiosCorreoPermitidos_() {
  return (CONFIG.VALIDATION.CORREO_DOMINIOS_PERMITIDOS || []).map(function (dominio) {
    return Utils_normalizarCorreo_(dominio);
  }).filter(function (dominio) {
    return !!dominio;
  });
}

function Utils_esCorreoCorporativoPermitido_(valor) {
  const correo = Utils_normalizarCorreo_(valor);
  if (!Utils_esCorreoValido_(correo)) return false;

  const dominios = Utils_obtenerDominiosCorreoPermitidos_();
  return dominios.some(function (dominio) {
    return correo.slice(-dominio.length) === dominio;
  });
}

function Utils_textoSinCorreoCorporativo_() {
  return String(CONFIG.VALIDATION.CORREO_SIN_CORPORATIVO || 'Sin correo').trim() || 'Sin correo';
}

function Utils_esMarcadorSinCorreoCorporativo_(valor) {
  return Utils_normalizarCorreo_(valor) === Utils_normalizarCorreo_(Utils_textoSinCorreoCorporativo_());
}

function Utils_resolverCorreoSolicitante_(correo, sinCorreoCorporativo) {
  if (sinCorreoCorporativo) return Utils_textoSinCorreoCorporativo_();
  return Utils_normalizarCorreo_(correo);
}

function Utils_now_() {
  return new Date();
}

function Utils_formatFechaHora_(fecha) {
  return Utilities.formatDate(fecha, CONFIG.APP.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function Utils_periodoMes_(fecha) {
  return Number(Utilities.formatDate(fecha, CONFIG.APP.TIMEZONE, 'M'));
}

function Utils_periodoAnio_(fecha) {
  return Number(Utilities.formatDate(fecha, CONFIG.APP.TIMEZONE, 'yyyy'));
}

// Cifrado simétrico reversible (XOR + Base64) para ANYDESK_PASSWORD.
// El secreto vive únicamente en Script Properties (CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY),
// nunca en el código fuente. No es un algoritmo de grado criptográfico: es un control
// mínimo aceptado para una contraseña temporal de soporte remoto (ver docs/DECISIONES.md).
function Utils_cifrarTexto_(texto) {
  if (!texto) return '';
  const secreto = PropertiesService.getScriptProperties().getProperty(CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY);
  if (!secreto) throw new Error('Falta configurar ' + CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY + ' en Script Properties.');
  const salida = [];
  for (let i = 0; i < texto.length; i++) {
    const codTexto = texto.charCodeAt(i) & 0xFF;
    const codClave = secreto.charCodeAt(i % secreto.length) & 0xFF;
    salida.push(codTexto ^ codClave);
  }
  return Utilities.base64Encode(salida);
}

function Utils_cifrarTextoSeguro_(texto) {
  try {
    return Utils_cifrarTexto_(texto);
  } catch (error) {
    LogService_error_('Utils_cifrarTextoSeguro_', error, { motivo: 'Se omite ANYDESK_PASSWORD para no bloquear el registro.' });
    return '';
  }
}

function Utils_descifrarTexto_(textoCifrado) {
  if (!textoCifrado) return '';
  const secreto = PropertiesService.getScriptProperties().getProperty(CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY);
  if (!secreto) throw new Error('Falta configurar ' + CONFIG.SEGURIDAD.ANYDESK_CIPHER_PROPERTY + ' en Script Properties.');
  const bytes = Utilities.base64Decode(textoCifrado);
  let salida = '';
  for (let i = 0; i < bytes.length; i++) {
    const codByte = bytes[i] & 0xFF;
    const codClave = secreto.charCodeAt(i % secreto.length) & 0xFF;
    salida += String.fromCharCode(codByte ^ codClave);
  }
  return salida;
}

function Utils_resumirErrorSeguro_(error) {
  const texto = error && error.message ? String(error.message) : String(error || 'ERROR_DESCONOCIDO');
  return texto
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[<>"']/g, '')
    .slice(0, 220);
}
