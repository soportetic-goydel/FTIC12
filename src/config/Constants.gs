const ESTADOS_REGISTRO = {
  ABIERTO: 'Abierto',
  EN_ATENCION: 'En Atencion',
  RESUELTO: 'Resuelto'
};

const ESTADOS_REGISTRO_LEGACY = {
  PENDIENTE: 'Pendiente',
  CERRADO: 'Cerrado',
  ANULADO: 'Anulado'
};

const EMPRESAS_GRUPO = {
  TDEM: 'TDEM',
  GOYDEL: 'GOYDEL',
  METRIN: 'METRIN'
};

const TIPOS_EQUIPO = ['PC-Portatil', 'PC-Escritorio', 'Smartphone', 'Impresora', 'Escaner', 'Programas', 'Otro'];
const TECNICOS_TIC = ['Yamil', 'Bruno', 'Alexis', 'Renzo'];
const TIPOS_PROBLEMA_POR_ACTIVO = {
  pc: [
    {
      value: 'Hardware / Fisico',
      label: 'Hardware / Fisico',
      category: 'Hardware',
      examples: 'Ejemplos: equipo no enciende, bateria no retiene carga, ruidos extranos, pantalla parpadea.'
    },
    {
      value: 'Software / Sistemas',
      label: 'Software / Sistemas',
      category: 'Software',
      examples: 'Ejemplos: pantalla azul, lentitud extrema, Excel o SAP se cierran solos.'
    },
    {
      value: 'Conectividad',
      label: 'Conectividad',
      category: 'Red',
      examples: 'Ejemplos: no conecta al Wi-Fi de la oficina, fallos de VPN o red inestable.'
    }
  ],
  smartphone: [
    {
      value: 'Software / MDM',
      label: 'Software / MDM',
      category: 'Software',
      examples: 'Ejemplos: correo corporativo no sincroniza o aplicaciones bloqueadas por politicas de seguridad.'
    },
    {
      value: 'Hardware / Red',
      label: 'Hardware / Red',
      category: 'Hardware',
      examples: 'Ejemplos: pantalla rota, robo o perdida del equipo, o falta de cobertura de datos moviles.'
    }
  ],
  printscan: [
    {
      value: 'Hardware / Suministros',
      label: 'Hardware / Suministros',
      category: 'Hardware',
      examples: 'Ejemplos: atasco de papel, manchas en impresiones, toner agotado o cambio de tambor.'
    },
    {
      value: 'Red / Escaneo',
      label: 'Red / Escaneo',
      category: 'Red',
      examples: 'Ejemplos: impresora fuera de linea, documentos en cola o error al escanear a carpeta o correo.'
    },
    {
      value: 'Configuracion',
      label: 'Configuracion',
      category: 'Software',
      examples: 'Ejemplos: instalacion de drivers o problemas para imprimir a doble cara o color.'
    }
  ],
  consulta: [
    {
      value: 'Accesos y Cuentas',
      label: 'Accesos y Cuentas',
      category: 'Software',
      examples: 'Ejemplos: reseteo de contrasenas, desbloqueo de usuario o permisos a carpetas.'
    },
    {
      value: 'Asesoria (How-To)',
      label: 'Asesoria (How-To)',
      category: 'Software',
      examples: 'Ejemplos: como configurar la firma de correo o conectar la laptop a la TV de la sala.'
    }
  ],
  otro: [
    {
      value: 'Perifericos',
      label: 'Perifericos',
      category: 'Hardware',
      examples: 'Ejemplos: monitor secundario sin imagen, teclado o mouse danado, audifonos sin sonido.'
    },
    {
      value: 'Seguridad',
      label: 'Seguridad',
      category: 'Software',
      examples: 'Ejemplos: correo sospechoso, alerta de antivirus o dispositivo USB bloqueado.'
    }
  ]
};

const TIPOS_PROBLEMA_LEGACY = ['Hardware', 'Software', 'Red'];
const TIPOS_PROBLEMA_ASSET_KIND_MAP = {
  pc: 'pc',
  smartphone: 'smartphone',
  printer: 'printscan',
  scanner: 'printscan',
  consulta: 'consulta',
  otro: 'otro'
};

const TIPOS_PROBLEMA = (function () {
  const valores = [];
  const vistos = {};

  TIPOS_PROBLEMA_LEGACY.forEach(function (tipo) {
    vistos[tipo] = true;
    valores.push(tipo);
  });

  Object.keys(TIPOS_PROBLEMA_POR_ACTIVO).forEach(function (clave) {
    (TIPOS_PROBLEMA_POR_ACTIVO[clave] || []).forEach(function (opcion) {
      const value = String(opcion.value || '').trim();
      if (!value || vistos[value]) return;
      vistos[value] = true;
      valores.push(value);
    });
  });

  return valores;
})();
const PRIORIDADES_USUARIO = ['Baja', 'Media', 'Alta'];

// Catalogos de Seccion 3 (uso interno TIC). Se usan en el panel de gestion TIC.
const SLA_APLICADO_OPCIONES = ['Baja 8h', 'Media 4h', 'Alta 2h'];
const ACCIONES_TOMADAS = ['Soporte Remoto', 'Soporte Presencial', 'Taller', 'Garantia'];
const ESTADOS_FINALES = ['OPERATIVO', 'PENDIENTE', 'REPOSICION'];

const RESPONSE_CODES = {
  OK: 'OK',
  ERROR: 'ERROR',
  NO_ENCONTRADO: 'NO_ENCONTRADO',
  VALIDACION: 'VALIDACION'
};
