function ReporteValidator_validar_(datos) {
  const errores = [];

  if (datos.dni.length !== CONFIG.VALIDATION.DNI_LENGTH) {
    errores.push('El DNI debe tener ' + CONFIG.VALIDATION.DNI_LENGTH + ' dígitos.');
  }
  if (!datos.nombreCompleto) errores.push('El nombre completo es obligatorio.');
  if (!datos.cargo) errores.push('El cargo es obligatorio.');
  if (datos.movil.length !== CONFIG.VALIDATION.MOVIL_LENGTH) {
    errores.push('El móvil debe tener ' + CONFIG.VALIDATION.MOVIL_LENGTH + ' dígitos.');
  }
  if (!datos.proyectoSede) errores.push('El área o proyecto es obligatorio.');
  if (!datos.centroCosto) errores.push('El centro de costo (CECO) es obligatorio.');
  if (Object.keys(EMPRESAS_GRUPO).map(function (k) { return EMPRESAS_GRUPO[k]; }).indexOf(datos.empresaDelGrupo) === -1) {
    errores.push('La empresa del grupo no es válida.');
  }
  if (TIPOS_EQUIPO.indexOf(datos.tipoEquipo) === -1) errores.push('El tipo de equipo no es válido.');
  if (!datos.activoAfectado) errores.push('El activo afectado (serie, código de inventario o descripción breve) es obligatorio.');
  if (TIPOS_PROBLEMA.indexOf(datos.tipoProblema) === -1) errores.push('El tipo de problema no es válido.');
  if (PRIORIDADES_USUARIO.indexOf(datos.prioridad) === -1) errores.push('La prioridad no es válida.');
  if (!datos.descripcion) errores.push('La descripción de la incidencia es obligatoria.');

  return { valido: errores.length === 0, errores: errores };
}
