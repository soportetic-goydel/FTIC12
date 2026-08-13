function ReporteValidator_validar_(datos) {
  const errores = [];
  const correo = Utils_normalizarCorreo_(datos.correoElectronico);
  const correoValido = Utils_esCorreoValido_(correo);

  if (datos.dni.length !== CONFIG.VALIDATION.DNI_LENGTH) {
    errores.push('El DNI debe tener ' + CONFIG.VALIDATION.DNI_LENGTH + ' digitos.');
  }
  if (!datos.nombreCompleto) errores.push('El nombre completo es obligatorio.');
  if (!datos.cargo) errores.push('El cargo es obligatorio.');
  if (datos.movil.length !== CONFIG.VALIDATION.MOVIL_LENGTH) {
    errores.push('El movil debe tener ' + CONFIG.VALIDATION.MOVIL_LENGTH + ' digitos.');
  }
  if (!correo) errores.push('El correo electronico es obligatorio.');
  else if (!correoValido) errores.push('El correo electronico no es valido.');
  if (!datos.proyectoSede) errores.push('El area o proyecto es obligatorio.');
  if (!datos.centroCosto) errores.push('El centro de costo (CECO) es obligatorio.');
  if (Object.keys(EMPRESAS_GRUPO).map(function (k) { return EMPRESAS_GRUPO[k]; }).indexOf(datos.empresaDelGrupo) === -1) {
    errores.push('La empresa del grupo no es valida.');
  }
  if (datos.tipoEquipo && TIPOS_EQUIPO.indexOf(datos.tipoEquipo) === -1) errores.push('El tipo de equipo no es valido.');
  if (!datos.activoSeleccionadoId) errores.push('Selecciona un activo afectado valido.');
  if (TIPOS_PROBLEMA.indexOf(datos.tipoProblema) === -1) errores.push('El tipo de problema no es valido.');
  if (datos.prioridad && PRIORIDADES_USUARIO.indexOf(datos.prioridad) === -1) errores.push('La prioridad no es valida.');
  if (!datos.descripcion) errores.push('La descripcion de la incidencia es obligatoria.');

  return { valido: errores.length === 0, errores: errores };
}
