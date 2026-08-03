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
const TIPOS_PROBLEMA = ['Hardware', 'Software', 'Red'];
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
